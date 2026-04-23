import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ChartBarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const MonitorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const SmartphoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function AnalyticsPanel({ shortId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shortId) return;
    setLoading(true);
    setError('');
    axios
      .get(`${API_BASE_URL}/${shortId}/analytics`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.error || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [shortId]);

  if (loading) {
    return (
      <div className="analytics-panel" id="analytics-panel">
        <div className="analytics-loading">
          <div className="btn-spinner analytics-spinner" />
          <span>Loading analytics…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-panel" id="analytics-panel">
        <div className="analytics-error">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const maxDaily = Math.max(...Object.values(data.dailyClicks), 1);
  const totalDevices = data.devices.desktop + data.devices.mobile + data.devices.tablet || 1;
  const desktopPct = Math.round((data.devices.desktop / totalDevices) * 100);
  const mobilePct = Math.round((data.devices.mobile / totalDevices) * 100);
  const tabletPct = 100 - desktopPct - mobilePct;

  const dayLabels = Object.keys(data.dailyClicks).map((d) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en', { weekday: 'short' });
  });

  return (
    <div className="analytics-panel" id="analytics-panel">
      {/* Header */}
      <div className="analytics-header">
        <h3>
          <ChartBarIcon /> Link Analytics
        </h3>
        <button className="analytics-close" onClick={onClose} aria-label="Close analytics">
          <CloseIcon />
        </button>
      </div>

      {/* Stats row */}
      <div className="analytics-stats-row">
        <div className="analytics-stat-card highlight">
          <span className="stat-value">{data.totalClicks}</span>
          <span className="stat-desc">Total Clicks</span>
        </div>
        <div className="analytics-stat-card">
          <span className="stat-value">{Object.keys(data.dailyClicks).length}d</span>
          <span className="stat-desc">Tracked</span>
        </div>
        <div className="analytics-stat-card">
          <span className="stat-value">{data.referrers.length}</span>
          <span className="stat-desc">Sources</span>
        </div>
      </div>

      {/* Click timeline */}
      <div className="analytics-section">
        <h4>Click Timeline — Last 7 Days</h4>
        <div className="chart-container">
          {Object.entries(data.dailyClicks).map(([date, count], i) => (
            <div className="chart-bar-group" key={date}>
              <span className="chart-count">{count}</span>
              <div className="chart-bar-track">
                <div
                  className="chart-bar"
                  style={{
                    height: `${Math.max((count / maxDaily) * 100, 4)}%`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              </div>
              <span className="chart-label">{dayLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column: Referrers + Devices */}
      <div className="analytics-columns">
        {/* Referrers */}
        <div className="analytics-section">
          <h4><GlobeIcon /> Top Referrers</h4>
          {data.referrers.length === 0 ? (
            <p className="analytics-empty">No click data yet</p>
          ) : (
            <div className="referrer-list">
              {data.referrers.map((ref) => (
                <div className="referrer-item" key={ref.name}>
                  <div className="referrer-info">
                    <span className="referrer-name">{ref.name}</span>
                    <span className="referrer-count">{ref.count}</span>
                  </div>
                  <div className="referrer-bar-track">
                    <div
                      className="referrer-bar"
                      style={{ width: `${(ref.count / data.totalClicks) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devices */}
        <div className="analytics-section">
          <h4><MonitorIcon /> Devices</h4>
          <div className="device-breakdown">
            <div className="device-bar-track">
              <div className="device-bar desktop" style={{ width: `${desktopPct}%` }} />
              <div className="device-bar mobile" style={{ width: `${mobilePct}%` }} />
              <div className="device-bar tablet" style={{ width: `${tabletPct}%` }} />
            </div>
            <div className="device-legend">
              <div className="device-legend-item">
                <span className="device-dot desktop" />
                <MonitorIcon /> Desktop <strong>{desktopPct}%</strong>
              </div>
              <div className="device-legend-item">
                <span className="device-dot mobile" />
                <SmartphoneIcon /> Mobile <strong>{mobilePct}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata footer */}
      <div className="analytics-meta">
        <span>Created {new Date(data.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        {data.expiresAt && (
          <span className="meta-expiry">
            Expires {new Date(data.expiresAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
        {data.hasPassword && <span className="meta-lock">🔒 Protected</span>}
      </div>
    </div>
  );
}
