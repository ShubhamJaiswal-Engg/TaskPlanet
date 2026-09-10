import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, PlusSquare, User, Sparkles } from 'lucide-react';

export const MobileBottomNav = ({ activeTab, setActiveTab, onScrollToComposer, onOpenProfile }) => {
  const { user, openAuthModal } = useAuth();

  return (
    <nav className="mobile-bottom-nav">
      <button 
        className={`mobile-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('feed');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <Home size={22} />
        <span>Feed</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'popular' ? 'active' : ''}`}
        onClick={() => setActiveTab('popular')}
      >
        <Sparkles size={22} />
        <span>Popular</span>
      </button>

      <button 
        className="mobile-nav-item"
        onClick={onScrollToComposer}
        style={{ color: 'var(--primary)' }}
      >
        <PlusSquare size={24} />
        <span>Create</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'my-posts' ? 'active' : ''}`}
        onClick={() => {
          if (!user) {
            openAuthModal('login');
          } else {
            onOpenProfile();
          }
        }}
      >
        <User size={22} />
        <span>{user ? 'Profile' : 'Log In'}</span>
      </button>
    </nav>
  );
};
