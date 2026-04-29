import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import QRCodeGenerator from 'qrcode';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ResultCard from './components/ResultCard';
import AnalyticsPanel from './components/AnalyticsPanel';
import Features from './components/Features';
import RecentLinks from './components/RecentLinks';


const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const RECENT_LINKS_KEY = 'scissor.recentLinks.v1';
const MAX_RECENT_LINKS = 50;

function loadRecentLinks() {
  try {
    const raw = localStorage.getItem(RECENT_LINKS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecentLinks(items) {
  try {
    localStorage.setItem(RECENT_LINKS_KEY, JSON.stringify(items));
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
}

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [shortId, setShortId] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(false);

  // New feature state
  const [expiresIn, setExpiresIn] = useState('never');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const [view, setView] = useState('home'); // 'home' | 'recent'
  const [recentLinks, setRecentLinks] = useState(() => loadRecentLinks());

  useEffect(() => {
    saveRecentLinks(recentLinks);
  }, [recentLinks]);

  const recentCount = useMemo(() => recentLinks.length, [recentLinks.length]);

  const handleShorten = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setAnalyticsOpen(false);
    try {
      const res = await axios.post(`${API_BASE_URL}/shorten`, {
        originalUrl: url,
        expiresIn: expiresIn,
        password: password || undefined,
      });
      const data = res.data;
      setShortUrl(data.shortUrl);
      setShortId(data.shortId);
      setExpiresAt(data.expiresAt);
      setHasPassword(data.hasPassword);
      setView('home');
      setCopied(false);
      const qr = await QRCodeGenerator.toDataURL(data.shortUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0A0A0F',
          light: '#FFFFFF',
        },
      });
      setQrImage(qr);

      // Persist to "Recent shortened links"
      const entry = {
        shortId: data.shortId,
        shortUrl: data.shortUrl,
        originalUrl: url,
        createdAt: new Date().toISOString(),
        expiresAt: data.expiresAt || null,
        hasPassword: !!data.hasPassword,
      };
      setRecentLinks((prev) => {
        const next = [entry, ...prev.filter((x) => x?.shortId !== entry.shortId)];
        return next.slice(0, MAX_RECENT_LINKS);
      });
    } catch (err) {
      console.error('ERROR:', err);
      alert(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* Background effects */}
      <div className="page-bg" />
      <div className="noise-overlay" />

      {/* Navigation */}
      <Navbar
        view={view}
        setView={setView}
        recentCount={recentCount}
        onGoHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {view === 'home' ? (
        <>
          {/* Hero + Result */}
          <Hero
            url={url}
            setUrl={setUrl}
            onShorten={handleShorten}
            loading={loading}
            expiresIn={expiresIn}
            setExpiresIn={setExpiresIn}
            password={password}
            setPassword={setPassword}
          />

          {/* Result card — shown inside hero area */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 2rem', position: 'relative', zIndex: 2, marginTop: shortUrl ? '-2rem' : 0 }}>
            <ResultCard
              shortUrl={shortUrl}
              shortId={shortId}
              copied={copied}
              onCopy={handleCopy}
              qrImage={qrImage}
              expiresAt={expiresAt}
              hasPassword={hasPassword}
              onAnalyticsToggle={() => setAnalyticsOpen(!analyticsOpen)}
              analyticsOpen={analyticsOpen}
            />

            {/* Analytics Panel */}
            {analyticsOpen && shortId && (
              <AnalyticsPanel
                shortId={shortId}
                onClose={() => setAnalyticsOpen(false)}
              />
            )}
          </div>

          {/* Features */}
          <Features />
        </>
      ) : (
        <RecentLinks
          items={recentLinks}
          onClear={() => setRecentLinks([])}
          onOpenHome={() => setView('home')}
          onUpdateItem={(shortId, patch) => {
            setRecentLinks((prev) =>
              prev.map((x) => (x?.shortId === shortId ? { ...x, ...patch } : x))
            );
          }}
        />
      )}

    </>
  );
}

export default App;