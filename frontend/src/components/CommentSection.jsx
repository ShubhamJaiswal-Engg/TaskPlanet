import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, MessageCircle } from 'lucide-react';

// Format relative timestamp helper
function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const CommentSection = ({ postId, comments = [], onAddComment }) => {
  const { user, openAuthModal } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    const trimmed = commentText.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await onAddComment(postId, trimmed);
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comments-section">
      {/* Input box */}
      <form onSubmit={handleSubmit} className="comment-input-row">
        <img
          src={user ? user.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'}
          alt={user ? user.name : 'Guest'}
          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <input
          type="text"
          placeholder={
            user
              ? 'Write a thoughtful comment...'
              : 'Log in to join the conversation...'
          }
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onClick={() => {
            if (!user) openAuthModal('login');
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
          disabled={submitting || !commentText.trim()}
          title="Send comment"
        >
          {submitting ? (
            <div className="spinner" style={{ width: '14px', height: '14px' }} />
          ) : (
            <Send size={15} />
          )}
        </button>
      </form>

      {/* List of comments */}
      {comments.length > 0 ? (
        <div className="comments-list">
          {comments.map((c, index) => (
            <div key={c._id || index} className="comment-bubble">
              <img
                src={
                  c.userAvatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${c.username || 'user'}`
                }
                alt={c.username}
                className="comment-avatar"
              />
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-author">@{c.username}</span>
                  <span className="comment-date">{formatTimeAgo(c.createdAt)}</span>
                </div>
                <div className="comment-text">{c.text}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          No comments yet. Start the discussion!
        </div>
      )}
    </div>
  );
};
