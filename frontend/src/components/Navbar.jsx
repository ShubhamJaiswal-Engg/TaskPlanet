import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Moon, 
  Sun, 
  PlusSquare, 
  LogOut, 
  User as UserIcon, 
  Sparkles,
  Share2
} from 'lucide-react';

export const Navbar = ({ 
  searchTerm, 
  setSearchTerm, 
  darkMode, 
  setDarkMode, 
  onOpenProfile,
  onScrollToComposer 
}) => {
  const { user, logout, openAuthModal } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div 
          className="brand-logo" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="TaskPlanet Social"
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="url(#brandGrad)" />
            <path 
              d="M32 52L46 66L68 36" 
              stroke="white" 
              strokeWidth="9" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <defs>
              <linearGradient id="brandGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563EB" />
                <stop offset="1" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
          </svg>
          <span>TaskPlanet</span>
          <span className="brand-badge">Social</span>
        </div>

        {/* Search Bar */}
        <div className="navbar-center">
          <div className="search-box">
            <Search />
            <input
              type="text"
              placeholder="Search posts, hashtags, or @usernames..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                style={{ 
                  position: 'absolute', 
                  right: 12, 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer',
                  fontSize: '14px' 
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Actions / Auth */}
        <div className="navbar-actions">
          {/* Dark Mode Toggle */}
          <button 
            className="btn-icon" 
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {user ? (
            <>
              <button 
                className="btn btn-primary" 
                onClick={onScrollToComposer}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <PlusSquare size={18} />
                <span className="hide-mobile">Create</span>
              </button>

              <div 
                onClick={onOpenProfile}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                title={`Logged in as @${user.username}`}
              >
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '2px solid var(--primary)',
                    objectFit: 'cover'
                  }}
                />
              </div>

              <button 
                className="btn-icon" 
                onClick={logout} 
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => openAuthModal('login')}
              >
                Log In
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => openAuthModal('register')}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
