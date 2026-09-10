import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  User, 
  Sparkles, 
  Bookmark, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

export const LeftSidebar = ({ activeTab, setActiveTab, onOpenProfile, myPostsCount }) => {
  const { user, openAuthModal } = useAuth();

  return (
    <aside className="desktop-left-sidebar">
      {/* Profile snippet */}
      <div className="social-card sidebar-profile-card">
        <img
          src={user ? user.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'}
          alt={user ? user.name : 'Guest User'}
          className="sidebar-avatar"
        />
        {user ? (
          <>
            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', margin: '0 0 2px' }}>
              {user.name}
            </h4>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>
              @{user.username}
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', margin: '0 0 14px', lineHeight: '1.4' }}>
              {user.bio}
            </p>
            <button 
              className="btn btn-outline" 
              style={{ fontSize: '0.8rem', padding: '5px 14px', width: '100%' }}
              onClick={onOpenProfile}
            >
              View Profile
            </button>
          </>
        ) : (
          <>
            <h4 style={{ fontWeight: 800, fontSize: '1rem', margin: '0 0 4px' }}>
              Welcome to TaskPlanet!
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Log in to like posts, comment, and share your thoughts.
            </p>
            <button 
              className="btn btn-primary" 
              style={{ fontSize: '0.85rem', width: '100%' }}
              onClick={() => openAuthModal('login')}
            >
              Log In / Sign Up
            </button>
          </>
        )}
      </div>

      {/* Nav links */}
      <div className="social-card">
        <div className="sidebar-nav-list">
          <div
            className={`sidebar-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <Home size={19} />
            <span>Public Feed</span>
          </div>

          <div
            className={`sidebar-nav-item ${activeTab === 'my-posts' ? 'active' : ''}`}
            onClick={() => {
              if (!user) {
                openAuthModal('login');
              } else {
                setActiveTab('my-posts');
              }
            }}
          >
            <User size={19} />
            <span>My Posts {user ? `(${myPostsCount})` : ''}</span>
          </div>

          <div
            className={`sidebar-nav-item ${activeTab === 'popular' ? 'active' : ''}`}
            onClick={() => setActiveTab('popular')}
          >
            <Sparkles size={19} />
            <span>Most Liked</span>
          </div>
        </div>
      </div>

      {/* Community Tips */}
      <div className="social-card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <CheckCircle2 size={18} color="var(--primary)" />
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>
            Community Tips
          </span>
        </div>
        <ul style={{ fontSize: '0.76rem', color: 'var(--text-muted)', paddingLeft: '16px', lineHeight: '1.7', margin: 0 }}>
          <li>Share constructive thoughts & questions</li>
          <li>Add images or links to enrich discussions</li>
          <li>Be respectful and support fellow creators</li>
        </ul>
      </div>
    </aside>
  );
};
