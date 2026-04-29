import { useState, useEffect } from 'react';

const LinkIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function Navbar({ view, setView, recentCount, onGoHome }) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="navbar-left">
        <button
          className="navbar-hamburger"
          type="button"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </button>

        <div
          className="navbar-brand"
          onClick={() => {
            setView?.('home');
            onGoHome?.();
          }}
        >
          <LinkIcon />
          <span>Scissor<span className="dot">.io</span></span>
        </div>
      </div>

      <button
        className="navbar-cta"
        onClick={() => {
          setView?.('home');
          const input = document.getElementById('url-input');
          if (input) { input.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => input.focus(), 400); }
        }}
      >
        Get Started
      </button>

      {/* Drawer */}
      <div className={`nav-drawer-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`nav-drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="nav-drawer-header">
          <div className="nav-drawer-title">Menu</div>
          <button className="nav-drawer-close" type="button" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        <div className="nav-drawer-items">
          <button
            type="button"
            className={`nav-drawer-item ${view === 'home' ? 'active' : ''}`}
            onClick={() => {
              setView?.('home');
              onGoHome?.();
              setDrawerOpen(false);
            }}
          >
            Home
          </button>

          <button
            type="button"
            className={`nav-drawer-item ${view === 'recent' ? 'active' : ''}`}
            onClick={() => {
              setView?.('recent');
              onGoHome?.();
              setDrawerOpen(false);
            }}
          >
            Recent shortened links
            <span className="nav-drawer-badge">{recentCount || 0}</span>
          </button>
        </div>
      </aside>
    </nav>
  );
}
