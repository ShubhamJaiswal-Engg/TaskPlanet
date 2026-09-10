import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, Check, Edit2, User, Mail, Calendar, ShieldCheck } from 'lucide-react';

const AVATAR_OPTIONS = [
  'bottts', 'adventurer', 'fun-emoji', 'lorelei', 'notionists', 'croodles'
];

export const ProfileModal = ({ isOpen, onClose, myPostsCount }) => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      const updated = await api.updateProfile({ name, bio, avatar });
      setUser((prev) => ({ ...prev, ...updated }));
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const cycleAvatarStyle = (style) => {
    const newAvatar = `https://api.dicebear.com/7.x/${style}/svg?seed=${user.username}`;
    setAvatar(newAvatar);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h3 className="modal-title">My Profile</h3>
          <button className="btn-icon" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
            <img
              src={avatar || user.avatar}
              alt={user.name}
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                border: '3px solid var(--primary)',
                objectFit: 'cover',
                boxShadow: 'var(--shadow-card)',
              }}
            />
          </div>

          {editing ? (
            <form onSubmit={handleSave} style={{ textAlign: 'left', marginTop: '10px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Pick Avatar Style:
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {AVATAR_OPTIONS.map((style) => (
                    <button
                      key={style}
                      type="button"
                      className="demo-pill"
                      style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                      onClick={() => cycleAvatarStyle(style)}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  className="composer-textarea"
                  style={{ minHeight: '60px' }}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px' }}>
                {user.name}
              </h2>
              <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '12px' }}>
                @{user.username}
              </div>

              <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 16px' }}>
                {user.bio || 'Exploring TaskPlanet Social! 🚀'}
              </p>

              {success && (
                <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem', marginBottom: '12px' }}>
                  ✓ {success}
                </div>
              )}

              {/* Stats card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  padding: '12px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                    {myPostsCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posts</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                    Active
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                    2026
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Member Since</div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%' }}
                onClick={() => setEditing(true)}
              >
                <Edit2 size={15} />
                <span>Edit Profile</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
