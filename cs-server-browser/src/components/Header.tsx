import React, { useState } from 'react';
import { FaServer, FaSearch, FaFilter, FaChartBar, FaUser, FaSignInAlt, FaUserPlus, FaCog } from 'react-icons/fa';
import AuthPage from '../pages/AuthPage';
import { useAuth } from '../context/AuthContext';
import logoImg from '../../images/logos/logo.png';
import StatsBar from './StatsBar';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, setSearchTerm }) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showStatsBar, setShowStatsBar] = useState(false);
  const { user, logout } = useAuth();

  const pathname = window.location.pathname;
  return (
    <>
      <div className="sticky-header">
        <header>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="logo">
              <img src={logoImg} alt="Logo" style={{ height: '32px', marginRight: '12px' }} />
              <h1>CSFind</h1>
            </div>
            <div className="nav-links">
              <a href="/" className={pathname === '/' ? 'active' : ''}>Servers</a>
              <a href="/myservers" className={pathname === '/myservers' ? 'active' : ''}>My Servers</a>
              <a href="#" className={pathname === '/options' ? 'active' : ''}>Options</a>
              <a href="/dailyclip" className={pathname === '/dailyclip' ? 'active' : ''}>Daily Clip</a>
            </div>
          </div>
          <div className="controls">
            <div className="search-box">
              <span className="search-icon">
                <FaSearch />
              </span>
              <input 
                type="text" 
                placeholder="Search servers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="profile-btn filter-btn">
              <FaFilter />
            </button>
            <button
              className="profile-btn toggle-stats-btn"
              id="toggleStats"
              onClick={() => setShowStatsBar((prev) => !prev)}
            >
              <FaChartBar />
            </button>
            <div className="user-controls">
              <button 
                className="profile-btn" 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <FaUser />
              </button>
              <div className={`profile-menu ${profileMenuOpen ? '' : 'hidden'}`}>
                {!user ? (
                  <>
                    <button className="login-menu-btn" onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}>
                      <FaSignInAlt /> Log In
                    </button>
                    <button className="register-menu-btn" onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}>
                      <FaUserPlus /> Register
                    </button>
                  </>
                ) : (
                  <>
                    <span>Logged in as {user.username}</span>
                    <button className="settings-menu-btn">
                      <FaCog /> Settings
                    </button>
                    <button className="logout-menu-btn" onClick={logout}>
                      Log Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>
      {authModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <AuthPage initialMode={authMode} onClose={() => setAuthModalOpen(false)} />
          </div>
        </div>
      )}
      {showStatsBar && (
        <StatsBar />
      )}
    </>
  );
};

export default Header;