import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from './CommentSection';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Trash2, 
  MoreHorizontal, 
  CheckCircle,
  Copy,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Format relative timestamp
function formatTimeAgo(dateString) {
  if (!dateString) return 'recently';
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

export const PostCard = ({ 
  post, 
  onToggleLike, 
  onAddComment, 
  onDeletePost 
}) => {
  const { user, openAuthModal } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const isMyPost = user && (user._id === post.user || user._id === post.user?._id);

  // Trigger heart burst / confetti for liking
  const handleLikeClick = (e) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    // Small celebratory confetti burst if liking
    if (!post.isLikedByMe) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { x, y },
        colors: ['#ef4444', '#ec4899', '#f43f5e'],
        disableForReducedMotion: true,
      });
    }

    onToggleLike(post._id);
  };

  const handleShareClick = () => {
    const url = `${window.location.origin}/#post-${post._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Build string describing who liked
  const renderLikersSummary = () => {
    const likes = post.likes || [];
    if (likes.length === 0) {
      return <span>Be the first to like this</span>;
    }

    const firstLiker = likes[0]?.username;
    if (likes.length === 1) {
      return (
        <span onClick={() => setShowLikesModal(true)} style={{ cursor: 'pointer' }}>
          Liked by <b>@{firstLiker}</b>
        </span>
      );
    }
    if (likes.length === 2) {
      return (
        <span onClick={() => setShowLikesModal(true)} style={{ cursor: 'pointer' }}>
          Liked by <b>@{firstLiker}</b> and <b>@{likes[1]?.username}</b>
        </span>
      );
    }
    return (
      <span onClick={() => setShowLikesModal(true)} style={{ cursor: 'pointer' }}>
        Liked by <b>@{firstLiker}</b> and <b>{likes.length - 1} others</b>
      </span>
    );
  };

  return (
    <>
      <article className="social-card post-card" id={`post-${post._id}`}>
        {/* Post Header */}
        <header className="post-card-header">
          <div className="post-user-info">
            <img
              src={
                post.userAvatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${post.username || 'default'}`
              }
              alt={post.username}
              className="post-avatar"
            />
            <div className="post-user-meta">
              <span className="post-username">
                @{post.username}
                <CheckCircle className="verified-badge" size={14} />
              </span>
              <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isMyPost && (
              <button
                className="btn-icon"
                style={{ width: '32px', height: '32px', border: 'none' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this post?')) {
                    onDeletePost(post._id);
                  }
                }}
                title="Delete your post"
              >
                <Trash2 size={16} color="#ef4444" />
              </button>
            )}
          </div>
        </header>

        {/* Post Content (Text) */}
        {post.content && (
          <div className="post-content">
            {post.content}
          </div>
        )}

        {/* Post Content (Image) */}
        {post.image && (
          <div className="post-image-container">
            <img
              src={post.image}
              alt="Post media"
              className="post-image"
              loading="lazy"
            />
          </div>
        )}

        {/* Stats Row */}
        <div className="post-stats-row">
          <div className="likes-avatars-preview">
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            {renderLikersSummary()}
          </div>

          <div 
            style={{ cursor: 'pointer' }}
            onClick={() => setShowComments(!showComments)}
          >
            {post.commentsCount || 0} {post.commentsCount === 1 ? 'comment' : 'comments'}
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="post-actions-bar">
          <button
            type="button"
            className={`action-btn ${post.isLikedByMe ? 'liked' : ''}`}
            onClick={handleLikeClick}
          >
            <Heart size={18} />
            <span>{post.likesCount || 0} Like</span>
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={18} />
            <span>Comment</span>
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={handleShareClick}
          >
            {copiedToast ? <Copy size={18} color="#10B981" /> : <Share2 size={18} />}
            <span>{copiedToast ? 'Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Expandable Comments Drawer */}
        {showComments && (
          <CommentSection
            postId={post._id}
            comments={post.comments || []}
            onAddComment={onAddComment}
          />
        )}
      </article>

      {/* Liked Users Modal */}
      {showLikesModal && (
        <div className="modal-overlay" onClick={() => setShowLikesModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#2563eb" />
                Liked by ({post.likes?.length || 0})
              </h3>
              <button 
                className="btn-icon" 
                style={{ width: '32px', height: '32px' }} 
                onClick={() => setShowLikesModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {post.likes && post.likes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {post.likes.map((like, i) => (
                    <div 
                      key={like.userId || i} 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${like.username}`} 
                          alt={like.username} 
                          style={{ width: '36px', height: '36px', borderRadius: '50%' }} 
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>@{like.username}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {formatTimeAgo(like.createdAt)}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>❤️ Liked</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No likes yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
