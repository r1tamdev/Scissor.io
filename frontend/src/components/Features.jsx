const ZapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const QrIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="8" height="8" rx="1" />
    <rect x="14" y="2" width="8" height="8" rx="1" />
    <rect x="2" y="14" width="8" height="8" rx="1" />
    <rect x="14" y="14" width="4" height="4" rx="0.5" />
    <line x1="22" y1="14" x2="22" y2="14.01" />
    <line x1="22" y1="18" x2="22" y2="22" />
    <line x1="18" y1="22" x2="18" y2="22.01" />
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const features = [
  {
    icon: <ZapIcon />,
    title: 'Lightning Fast',
    description: 'Generate short links in milliseconds. Our API is optimized for speed with minimal latency worldwide.',
  },
  {
    icon: <QrIcon />,
    title: 'QR Code Generation',
    description: 'Every shortened link comes with an auto-generated QR code. Download and share it anywhere.',
  },
  {
    icon: <ClockIcon />,
    title: 'Link Expiry',
    description: 'Set your links to auto-expire after 1 hour, 24 hours, 7 days, or 30 days. Perfect for temporary shares.',
  },
  {
    icon: <LockIcon />,
    title: 'Password Protection',
    description: 'Secure your links with a password. Only users with the correct password can access the destination.',
  },
  {
    icon: <ChartIcon />,
    title: 'Click Analytics',
    description: 'Track total clicks, device types, referrers, and daily activity with a beautiful real-time dashboard.',
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="section-header">
        <div className="section-tag">✦ Features</div>
        <h2 className="section-title">Everything you need</h2>
        <p className="section-subtitle">
          Powerful tools to manage, protect, and share your links effectively.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, i) => (
          <div className="feature-card" key={i} id={`feature-${i}`}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
