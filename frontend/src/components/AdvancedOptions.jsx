import { useEffect, useRef, useState } from 'react';

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform 0.3s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CUSTOM_REGEX = /^(\d+)([smhd])$/;
const CUSTOM_DEFAULT = { amount: 10, unit: 's' };
const CUSTOM_UNIT_OPTIONS = [
  { unit: 's', label: 'SEC', ms: 1000 },
  { unit: 'm', label: 'MIN', ms: 60 * 1000 },
  { unit: 'h', label: 'HRS', ms: 60 * 60 * 1000 },
  { unit: 'd', label: 'DAYS', ms: 24 * 60 * 60 * 1000 },
];

const PRESET_DURATIONS_MS = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

const EXPIRY_OPTIONS = [
  { value: 'never', label: 'Never',    desc: 'Link stays forever' },
  { value: '1h',    label: '1 Hour',   desc: 'Quick share' },
  { value: '24h',   label: '24 Hours', desc: 'Day pass' },
  { value: '7d',    label: '7 Days',   desc: 'One week' },
  { value: '30d',   label: '30 Days',  desc: 'One month' },
  { value: 'custom',label: '⚙ Custom', desc: 'Customize your own date & time' },
];

export default function AdvancedOptions({ expiresIn, setExpiresIn, password, setPassword }) {
  const [open, setOpen] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef(null);
  const [customAmountText, setCustomAmountText] = useState(String(CUSTOM_DEFAULT.amount));
  const [customUnit, setCustomUnit] = useState(CUSTOM_DEFAULT.unit);

  const parsedCustom = typeof expiresIn === 'string' ? expiresIn.match(CUSTOM_REGEX) : null;
  const [customMode, setCustomMode] = useState(!!parsedCustom);
  const isCustom = customMode;
  const parsedAmount = parsedCustom ? Number(parsedCustom[1]) : null;
  const parsedUnit = parsedCustom ? parsedCustom[2] : null;

  useEffect(() => {
    if (!customMode) return;
    if (!parsedCustom) return;
    setCustomAmountText(String(parsedAmount));
    setCustomUnit(parsedUnit);
  }, [expiresIn, customMode, parsedAmount, parsedUnit]);

  const setCustomExpiry = (amountNumber, unit) => {
    const n = Number(amountNumber);
    if (!Number.isFinite(n) || n <= 0) {
      setExpiresIn('never');
      return;
    }
    setExpiresIn(`${n}${unit}`);
  };

  const previewDate = (() => {
    const amount = Number(customAmountText);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    const unitOpt = CUSTOM_UNIT_OPTIONS.find((u) => u.unit === customUnit);
    if (!unitOpt) return null;
    return new Date(Date.now() + amount * unitOpt.ms);
  })();

  const presetPreviewDate = (() => {
    if (customMode) return null;
    if (!expiresIn || expiresIn === 'never') return null;
    const ms = PRESET_DURATIONS_MS[expiresIn];
    if (!ms) return null;
    return new Date(Date.now() + ms);
  })();

  const formatPreviewExpiresAt = (d) => {
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (isToday) return `Expires at ${time} today`;
    const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    return `Expires at ${time}, ${dateStr}`;
  };

  const enablePassword = () => {
    setPasswordEnabled(true);
    setTimeout(() => passwordInputRef.current?.focus(), 0);
  };

  const disablePassword = () => {
    setPasswordEnabled(false);
    setShowPassword(false);
    setPassword('');
  };

  return (
    <div className="advanced-options" id="advanced-options">
      <button
        className="advanced-toggle"
        onClick={() => setOpen(!open)}
        type="button"
        id="advanced-toggle-btn"
      >
        <span className="advanced-toggle-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Advanced Options
        </span>
        <ChevronIcon open={open} />
      </button>

      <div className={`advanced-panel ${open ? 'open' : ''}`}>
        <div className="advanced-panel-inner">
          {/* Expiry selector */}
          <div className="option-group">
            <label className="option-label">
              <ClockIcon />
              Link Expiry
            </label>
            {isCustom ? (
              <div className="custom-expiry-box" id="custom-expiry-box">
                <div className="custom-expiry-row">
                  <span className="custom-expiry-prefix">EXPIRES IN</span>
                  <span className="custom-expiry-bracket">[</span>
                  <input
                    className="custom-expiry-amount"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={customAmountText}
                    onChange={(e) => {
                      const next = e.target.value.replace(/[^\d]/g, '');
                      setCustomAmountText(next);
                      const amount = Number(next);
                      if (amount <= 0) setExpiresIn('never');
                      else setCustomExpiry(amount, customUnit);
                    }}
                    aria-label="Custom expiry amount"
                  />
                  <span className="custom-expiry-bracket">]</span>

                  <div className="custom-expiry-units">
                    {CUSTOM_UNIT_OPTIONS.map((u) => (
                      <button
                        key={u.unit}
                        type="button"
                        className={`custom-expiry-unit ${customUnit === u.unit ? 'active' : ''}`}
                        onClick={() => {
                          setCustomUnit(u.unit);
                          const amount = Number(customAmountText);
                          if (amount <= 0) setExpiresIn('never');
                          else setCustomExpiry(amount, u.unit);
                        }}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="custom-expiry-clear"
                    onClick={() => {
                      setCustomAmountText(String(CUSTOM_DEFAULT.amount));
                      setCustomUnit(CUSTOM_DEFAULT.unit);
                      setCustomMode(false);
                      setExpiresIn('never');
                    }}
                  >
                    Clear
                  </button>
                </div>

                {previewDate && (
                  <div className="custom-expiry-preview">
                    <ClockIcon />
                    <span>{formatPreviewExpiresAt(previewDate)}</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="expiry-chips" id="expiry-chips">
                  {EXPIRY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`expiry-chip ${opt.value === 'custom' ? (isCustom ? 'active' : '') : (expiresIn === opt.value ? 'active' : '')}`}
                      onClick={() => {
                        if (opt.value === 'custom') {
                          setCustomMode(true);
                          setCustomExpiry(CUSTOM_DEFAULT.amount, CUSTOM_DEFAULT.unit);
                          return;
                        }
                        setCustomMode(false);
                        setExpiresIn(opt.value);
                      }}
                      title={opt.desc}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {presetPreviewDate && (
                  <div className="expiry-preview" id="expiry-preview">
                    <ClockIcon />
                    <span>{formatPreviewExpiresAt(presetPreviewDate)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Password protection */}
          <div className="option-group">
            <div className="option-row">
              <label className="option-label">
                <LockIcon />
                Password Protect
              </label>
              <button
                type="button"
                className={`option-action-btn ${passwordEnabled ? 'active' : ''}`}
                onClick={() => (passwordEnabled ? disablePassword() : enablePassword())}
                id="password-toggle"
                aria-label={passwordEnabled ? 'Remove password protection' : 'Add password protection'}
              >
                {passwordEnabled ? 'Remove' : 'Add'}
              </button>
            </div>
            <div className={`password-field ${passwordEnabled ? 'open' : ''}`}>
              <div className="password-input-wrap">
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter a password…"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password-input"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="password-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
