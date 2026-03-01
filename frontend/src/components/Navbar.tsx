import React from "react";
import { Link, useLocation } from "react-router";

const Navbar: React.FC = () => {
  const location = useLocation();
  return (
    <nav style={{
      background: '#1a237e',
      color: 'white',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
    }}>
      <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>Jano Health</div>
      <div style={{ display: 'flex', gap: 24 }}>
        <Link to="/" style={{ color: location.pathname === '/' ? '#ffeb3b' : 'white', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
        <Link to="/patients" style={{ color: location.pathname === '/patients' ? '#ffeb3b' : 'white', textDecoration: 'none', fontWeight: 500 }}>Patients</Link>
        <Link to="/add-session" style={{ color: location.pathname === '/add-session' ? '#ffeb3b' : 'white', textDecoration: 'none', fontWeight: 500 }}>Add Session</Link>
      </div>
    </nav>
  );
};

export default Navbar;
