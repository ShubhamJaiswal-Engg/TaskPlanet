import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';

const STATIC_STORIES = [
  {
    id: 's1',
    username: 'aarav_tech',
    name: 'Aarav',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    caption: 'Shipped the new API feature today! 🚀'
  },
  {
    id: 's2',
    username: 'priya_design',
    name: 'Priya',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    caption: 'Designing new glassmorphism dashboard cards 🎨'
  },
  {
    id: 's3',
    username: 'rohan_codes',
    name: 'Rohan',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    caption: 'Coffee + Code = Nirvana ☕'
  },
  {
    id: 's4',
    username: 'neha_growth',
    name: 'Neha',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    caption: 'Weekly team sprint retrospective 🎉'
  },
  {
    id: 's5',
    username: 'taskplanet_hq',
    name: 'TaskPlanet',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    caption: 'Welcome to TaskPlanet Community!'
  }
];

export const StoriesBar = ({ onAddStoryClick }) => {
  const { user } = useAuth();
  const [activeStory, setActiveStory] = useState(null);

  return (
    <>
      <div className="social-card stories-card">
        {/* Your Story */}
        <div 
          className="story-item" 
          onClick={onAddStoryClick}
          title="Create a new post or story"
        >
          <div className="story-avatar-wrap my-story">
            <img 
              src={user ? user.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'} 
              alt="Your story" 
              className="story-avatar" 
            />
            <div className="add-story-badge">
              <Plus size={11} strokeWidth={3} />
            </div>
          </div>
          <span className="story-username">Your Story</span>
        </div>

        {/* Other Members Stories */}
        {STATIC_STORIES.map((story) => (
          <div 
            key={story.id} 
            className="story-item"
            onClick={() => setActiveStory(story)}
          >
            <div className="story-avatar-wrap">
              <img 
                src={story.avatar} 
                alt={story.name} 
                className="story-avatar" 
              />
            </div>
            <span className="story-username">{story.name}</span>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="modal-overlay" onClick={() => setActiveStory(null)}>
          <div 
            className="modal-card" 
            style={{ maxWidth: '420px', background: '#000', color: '#fff', borderRadius: '24px', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative' }}>
              {/* Progress bar */}
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.3)', width: '100%' }}>
                <div style={{ height: '100%', background: '#3b82f6', width: '100%', animation: 'progress 5s linear' }} />
              </div>

              {/* Story Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={activeStory.avatar} 
                    alt={activeStory.name} 
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #3b82f6' }} 
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{activeStory.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>@{activeStory.username} • 2h ago</div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveStory(null)} 
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* Story Media */}
              <img 
                src={activeStory.storyImage} 
                alt={activeStory.name} 
                style={{ width: '100%', height: '420px', objectFit: 'cover' }} 
              />

              {/* Story Caption */}
              <div style={{ padding: '16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#fff', textAlign: 'center' }}>
                  {activeStory.caption}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
