import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";

const navLinks = [
  { to: "/",            label: "Sessions"    },
  { to: "/patients",    label: "Patients"    },
  { to: "/add-session", label: "Add Session" },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');

        .nav-root {
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.3s ease;
        }
        .nav-bar {
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .nav-glass {
          background: rgba(255,255,255,0.72);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .nav-glass.scrolled {
          background: rgba(255,255,255,0.88);
          border-bottom-color: rgba(0,0,0,0.1);
          box-shadow: 0 1px 12px rgba(0,0,0,0.06);
        }

        /* Logo */
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .nav-logo-icon {
          width: 28px; height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, #25CED1, #1db8bb);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(37,206,209,0.3);
        }
        .nav-logo-text {
          font-family: 'DM Serif Display', serif;
          font-style: italic;
          font-size: 17px;
          color: #1a1a2e;
          letter-spacing: -0.01em;
          line-height: 1;
        }

        /* Links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
        .nav-link {
          position: relative;
          padding: 6px 14px;
          border-radius: 980px;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          text-decoration: none;
          transition: color 0.2s ease, background 0.2s ease;
          white-space: nowrap;
          letter-spacing: -0.01em;
        }
        .nav-link:hover {
          color: #1a1a2e;
          background: rgba(0,0,0,0.04);
        }
        .nav-link.active {
          color: #1a1a2e;
          font-weight: 600;
          background: rgba(0,0,0,0.06);
        }

        /* CTA */
        .nav-cta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .nav-cta-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 980px;
          font-size: 13px;
          font-weight: 600;
          color: white;
          text-decoration: none;
          background: linear-gradient(135deg, #FF8A5B, #f06030);
          box-shadow: 0 2px 8px rgba(255,138,91,0.3);
          transition: all 0.2s ease;
          letter-spacing: -0.01em;
          white-space: nowrap;
          border: none;
          cursor: pointer;
        }
        .nav-cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(255,138,91,0.4);
        }
        .nav-cta-btn:active {
          transform: translateY(0);
        }

        /* Mobile hamburger */
        .nav-hamburger {
          display: none;
          width: 32px; height: 32px;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .nav-hamburger:hover { background: rgba(0,0,0,0.05); }

        /* Mobile drawer */
        .mobile-drawer {
          border-top: 1px solid rgba(0,0,0,0.07);
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(20px);
          padding: 8px 16px 16px;
        }
        .mobile-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: #374151;
          text-decoration: none;
          transition: background 0.15s;
        }
        .mobile-link:hover { background: rgba(0,0,0,0.04); }
        .mobile-link.active {
          color: #1a1a2e;
          font-weight: 600;
          background: rgba(37,206,209,0.07);
        }
        .mobile-link.active .mobile-link-dot {
          opacity: 1;
        }
        .mobile-link-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #25CED1;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .mobile-cta {
          margin-top: 8px;
          width: 100%;
          padding: 13px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          color: white;
          text-align: center;
          text-decoration: none;
          background: linear-gradient(135deg, #FF8A5B, #f06030);
          display: block;
          box-shadow: 0 4px 12px rgba(255,138,91,0.3);
        }

        @keyframes drawer-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-drawer { animation: drawer-in 0.2s ease both; }

        @media (max-width: 768px) {
          .nav-links    { display: none !important; }
          .nav-cta-btn  { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>

      <div className="nav-root">
        <div className={`nav-glass ${scrolled ? "scrolled" : ""}`}>
          <div className="nav-bar">

            {/* Logo */}
            <Link to="/" className="nav-logo">
              <div className="nav-logo-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="nav-logo-text">Jano Health</span>
            </Link>

            {/* Centered nav links */}
            <nav className="nav-links">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-link ${location.pathname === to ? "active" : ""}`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right CTA */}
            <div className="nav-cta">
              <Link to="/add-session" className="nav-cta-btn">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New Session
              </Link>

              {/* Mobile hamburger */}
              <button
                className="nav-hamburger"
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="mobile-drawer">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`mobile-link ${location.pathname === to ? "active" : ""}`}
              >
                {label}
                <span className="mobile-link-dot" />
              </Link>
            ))}
            <Link to="/add-session" className="mobile-cta">
              + New Session
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;