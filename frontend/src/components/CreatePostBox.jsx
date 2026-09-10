import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Smile, 
  X, 
  Sparkles, 
  Send,
  Camera
} from 'lucide-react';

const PRESET_IMAGES = [
  { label: '💻 Coding', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80' },
  { label: '🎨 Design', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80' },
  { label: '🚀 Tech', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80' },
  { label: '☕ Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80' },
];

export const CreatePostBox = ({ onPostCreated, composerRef }) => {
  const { user, openAuthModal } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // File to base64 reader
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setShowUrlInput(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlInputValue.trim()) {
      setImage(urlInputValue.trim());
      setUrlInputValue('');
      setShowUrlInput(false);
      setErrorMsg('');
    }
  };

  const handleRemoveImage = () => {
    setImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    const trimmedContent = content.trim();
    const trimmedImage = image.trim();

    // Validate that post contains text, an image, or both
    if (!trimmedContent && !trimmedImage) {
      setErrorMsg('Please enter some text or add an image to create a post.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await onPostCreated({
        content: trimmedContent,
        image: trimmedImage,
      });

      // Reset form on success
      setContent('');
      setImage('');
      setShowUrlInput(false);
      setUrlInputValue('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to publish post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="social-card create-post-card" ref={composerRef} id="create-post-box">
      <div className="create-post-header">
        <img
          src={user ? user.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'}
          alt={user ? user.name : 'Guest'}
          className="composer-avatar"
        />
        <div style={{ flex: 1 }}>
          <textarea
            className="composer-textarea"
            placeholder={
              user
                ? `What's on your mind, ${user.name.split(' ')[0]}? Share thoughts or an image...`
                : 'Share your thoughts or an image with the TaskPlanet community (Log in to post)...'
            }
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            rows={2}
          />
        </div>
      </div>

      {/* Image Preview if chosen */}
      {image && (
        <div className="image-preview-wrapper">
          <img src={image} alt="Preview" />
          <button 
            type="button" 
            className="remove-image-btn" 
            onClick={handleRemoveImage}
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Direct URL input strip if toggled */}
      {showUrlInput && (
        <div className="url-input-strip">
          <input
            type="url"
            placeholder="Paste image URL (https://...)..."
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyUrl()}
          />
          <button type="button" className="btn btn-outline" style={{ padding: '4px 14px', fontSize: '0.82rem' }} onClick={handleApplyUrl}>
            Apply
          </button>
          <button type="button" className="btn-icon" style={{ width: '32px', height: '32px' }} onClick={() => setShowUrlInput(false)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Preset stock suggestions */}
      {!image && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', margin: '6px 0 10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick sample photos:</span>
          {PRESET_IMAGES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setImage(preset.url);
                setShowUrlInput(false);
                setErrorMsg('');
              }}
              style={{
                fontSize: '0.72rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '2px 8px',
                cursor: 'pointer',
                color: 'var(--text-body)',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Error Message if any */}
      {errorMsg && (
        <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '8px', fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Footer Actions */}
      <div className="create-post-footer">
        <div className="media-actions">
          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className={`media-btn ${image ? 'active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            title="Upload photo from device"
          >
            <ImageIcon size={18} color="#2563EB" />
            <span>Photo</span>
          </button>

          {/* Web Image Link Button */}
          <button
            type="button"
            className={`media-btn ${showUrlInput ? 'active' : ''}`}
            onClick={() => setShowUrlInput(!showUrlInput)}
            title="Add image via link"
          >
            <LinkIcon size={17} color="#7C3AED" />
            <span>Image URL</span>
          </button>
        </div>

        {/* Submit Post Button */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting || (!content.trim() && !image.trim())}
          style={{ minWidth: '100px' }}
        >
          {submitting ? (
            <div className="spinner" style={{ width: '16px', height: '16px' }} />
          ) : (
            <>
              <Send size={15} />
              <span>Post</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
