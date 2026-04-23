import { useState, useEffect } from 'react';

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const ChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

function formatTimeLeft(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function ResultCard({ shortUrl, shortId, copied, onCopy, qrImage, expiresAt, hasPassword, onAnalyticsToggle, analyticsOpen }) {
  if (!shortUrl) return null;

  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(expiresAt));

  // Live countdown
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(expiresAt));
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleShare = async () => {
    try {
      // Convert data URL to blob for sharing
      const res = await fetch(qrImage);
      const blob = await res.blob();
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Scissor.io — QR Code',
          text: `Check out this link: ${shortUrl}`,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Scissor.io — Shortened Link',
          text: `Check out this link: ${shortUrl}`,
          url: shortUrl,
        });
      } else {
        // Fallback: copy link
        navigator.clipboard.writeText(shortUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  };

  return (
    <div className="result-card" id="result-card">
      <div className="result-header-row">
        <div className="result-label">Your shortened link</div>
        <div className="result-badges">
          {timeLeft && (
            <span className={`result-badge expiry-badge ${timeLeft === 'Expired' ? 'expired' : ''}`}>
              ⏱ {timeLeft === 'Expired' ? 'Expired' : `Expires in ${timeLeft}`}
            </span>
          )}
          {hasPassword && (
            <span className="result-badge lock-badge">🔒 Protected</span>
          )}
        </div>
      </div>

      <div className="result-url-row">
        <a
          className="result-url"
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="result-url"
        >
          {shortUrl}
        </a>
        <button
          id="copy-button"
          className={`copy-btn ${copied ? 'copied' : ''}`}
          onClick={onCopy}
        >
          {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
        </button>
      </div>

      {/* Action buttons row */}
      <div className="result-actions-row">
        <button
          className={`result-action-btn ${analyticsOpen ? 'active' : ''}`}
          onClick={onAnalyticsToggle}
          id="analytics-btn"
        >
          <ChartIcon />
          Analytics
        </button>
      </div>

      {qrImage && (
        <div className="qr-section">
          <p>Scan this QR code to open your link</p>
          <div className="qr-container">
            <img src={qrImage} alt="QR Code" width={160} height={160} />
          </div>
          <div className="qr-actions">
            <a
              className="qr-download-btn"
              href={qrImage}
              download="qr-code.png"
              target="_blank"
              id="qr-download"
            >
              <DownloadIcon />
              Download
            </a>
            <button
              className="qr-download-btn"
              onClick={handleShare}
              id="qr-share"
            >
              <ShareIcon />
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
