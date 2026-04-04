import { useState } from 'react';

const LinkInputIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export default function Hero({ url, setUrl, onShorten, loading }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && url.trim()) {
      onShorten();
    }
  };

  return (
    <section className="hero" id="hero">
      {/* Badge */}
      <div className="hero-badge">
        <div className="badge-dot" />
        <span>New</span> — Now with QR code generation
      </div>

      {/* Headline */}
      <h1>
        Shorten Your Links,<br />
        <span className="gradient-text">Share With Ease</span>
      </h1>

      {/* Subtitle */}
      <p className="hero-subtitle">
        Transform long, unwieldy URLs into clean, shareable links in seconds.
        Generate QR codes and take control of your links.
      </p>

      {/* URL Input */}
      <div className="url-input-group" id="hero-input">
        <div className="url-input-wrapper">
          <div className="input-icon">
            <LinkInputIcon />
          </div>
          <input
            id="url-input"
            type="url"
            placeholder="Paste your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <button
            id="shorten-button"
            className="shorten-btn"
            onClick={onShorten}
            disabled={loading || !url.trim()}
          >
            {loading ? (
              <div className="btn-spinner" />
            ) : (
              <>
                Shorten <ArrowIcon />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
