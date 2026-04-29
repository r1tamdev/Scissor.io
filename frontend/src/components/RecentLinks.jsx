import { useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function RecentLinks({ items, onClear, onOpenHome, onUpdateItem }) {
  const [copiedId, setCopiedId] = useState('');
  const [busyId, setBusyId] = useState('');

  const sorted = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    return [...arr].sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
  }, [items]);

  const handleCopy = async (shortUrl, shortId) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(shortId);
      setTimeout(() => setCopiedId(''), 1400);
    } catch {
      alert('Copy failed. Please copy manually.');
    }
  };

  const handlePasswordUpdate = async (shortId, hasPassword) => {
    const label = hasPassword ? 'Change password' : 'Add password';
    const next = prompt(`${label} for this link.\n\nLeave empty to remove password.`);
    if (next === null) return;

    setBusyId(shortId);
    try {
      const res = await axios.put(`${API_BASE_URL}/${shortId}/password`, { password: next });
      const updatedHasPassword = !!res.data?.hasPassword;
      // Update local "Recent" state (device-only history)
      if (typeof onUpdateItem === 'function') onUpdateItem(shortId, { hasPassword: updatedHasPassword });
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to update password');
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="recent-page" id="recent-page">
      <div className="recent-card">
        <div className="recent-header">
          <div>
            <div className="recent-kicker">Recent</div>
            <h2 className="recent-title">Shortened Links</h2>
            <p className="recent-subtitle">Your recently shortened links appear here.</p>
          </div>
          <div className="recent-actions">
            <button className="recent-btn" onClick={onOpenHome} type="button">
              Back to Home
            </button>
            <button className="recent-btn danger" onClick={onClear} type="button" disabled={!sorted.length}>
              Clear
            </button>
          </div>
        </div>

        {!sorted.length ? (
          <div className="recent-empty">
            No links yet. Create one from <button type="button" className="recent-inline-link" onClick={onOpenHome}>Home</button>.
          </div>
        ) : (
          <div className="recent-list" role="list">
            {sorted.map((it) => (
              <div className="recent-item" key={it.shortId} role="listitem">
                <div className="recent-item-main">
                  <div className="recent-item-row">
                    <a className="recent-short" href={it.shortUrl} target="_blank" rel="noreferrer">
                      {it.shortUrl}
                    </a>
                    <div className="recent-badges">
                      {it.expiresAt && <span className="recent-badge expiry">Expires {formatWhen(it.expiresAt)}</span>}
                      {it.hasPassword && <span className="recent-badge lock">Protected</span>}
                    </div>
                  </div>
                  <div className="recent-original" title={it.originalUrl}>
                    {it.originalUrl}
                  </div>
                  <div className="recent-meta">
                    Created {formatWhen(it.createdAt)}
                  </div>
                </div>

                <div className="recent-item-actions">
                  <button
                    className={`recent-icon-btn ${busyId === it.shortId ? 'active' : ''}`}
                    type="button"
                    onClick={() => handlePasswordUpdate(it.shortId, it.hasPassword)}
                    aria-label={it.hasPassword ? 'Change password' : 'Add password'}
                    title={it.hasPassword ? 'Change password' : 'Add password'}
                    disabled={busyId === it.shortId}
                  >
                    <LockIcon />
                  </button>
                  <button
                    className="recent-icon-btn"
                    type="button"
                    onClick={() => window.open(it.shortUrl, '_blank', 'noopener,noreferrer')}
                    aria-label="Open link"
                  >
                    <ExternalIcon />
                  </button>
                  <button
                    className={`recent-icon-btn ${copiedId === it.shortId ? 'active' : ''}`}
                    type="button"
                    onClick={() => handleCopy(it.shortUrl, it.shortId)}
                    aria-label="Copy short link"
                  >
                    <CopyIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

