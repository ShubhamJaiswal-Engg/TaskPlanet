import React from 'react';
import { TrendingUp, Users, Sparkles } from 'lucide-react';

const TRENDS = [
  { tag: '#TaskPlanet', count: '14.2k posts' },
  { tag: '#WebDevelopment', count: '9.8k posts' },
  { tag: '#ReactJS', count: '7.4k posts' },
  { tag: '#DesignSystems', count: '5.2k posts' },
  { tag: '#TechCommunity', count: '3.9k posts' },
];

const SUGGESTED_CREATORS = [
  { name: 'Aarav Sharma', handle: 'aarav_tech', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
  { name: 'Priya Patel', handle: 'priya_design', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { name: 'Rohan Verma', handle: 'rohan_codes', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' },
];

export const RightSidebar = ({ onTagClick }) => {
  return (
    <aside className="desktop-right-sidebar">
      {/* Trending Topics */}
      <div className="social-card trending-card">
        <h3>
          <TrendingUp size={18} color="var(--primary)" />
          <span>Trending Topics</span>
        </h3>
        <div>
          {TRENDS.map((t, idx) => (
            <div 
              key={idx} 
              className="trending-item"
              onClick={() => onTagClick(t.tag)}
            >
              <span className="trending-tag">{t.tag}</span>
              <span className="trending-count">{t.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Creators */}
      <div className="social-card" style={{ padding: '18px 20px' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={17} color="var(--primary)" />
          <span>Suggested Creators</span>
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {SUGGESTED_CREATORS.map((creator, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={creator.avatar} 
                  alt={creator.name} 
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{creator.name}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>@{creator.handle}</div>
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: '16px' }}
                onClick={() => onTagClick(creator.handle)}
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer links */}
      <div style={{ padding: '0 8px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        <p style={{ margin: '0 0 4px' }}>TaskPlanet Community Platform</p>
        <p style={{ margin: 0 }}>© 2026 TaskPlanet • Privacy • Terms</p>
      </div>
    </aside>
  );
};
