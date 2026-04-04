import { useState } from 'react';
import axios from 'axios';
import QRCodeGenerator from 'qrcode';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ResultCard from './components/ResultCard';
import Features from './components/Features';


const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShorten = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/shorten`, {
        originalUrl: url,
      });
      const newShortUrl = res.data.shortUrl;
      setShortUrl(newShortUrl);
      setCopied(false);
      const qr = await QRCodeGenerator.toDataURL(newShortUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0A0A0F',
          light: '#FFFFFF',
        },
      });
      setQrImage(qr);
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
      <Navbar />

      {/* Hero + Result */}
      <Hero
        url={url}
        setUrl={setUrl}
        onShorten={handleShorten}
        loading={loading}
      />

      {/* Result card — shown inside hero area */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 2rem', position: 'relative', zIndex: 2, marginTop: shortUrl ? '-2rem' : 0 }}>
        <ResultCard
          shortUrl={shortUrl}
          copied={copied}
          onCopy={handleCopy}
          qrImage={qrImage}
        />
      </div>

      {/* Features */}
      <Features />




    </>
  );
}

export default App;