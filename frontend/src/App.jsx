import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { StoriesBar } from './components/StoriesBar';
import { CreatePostBox } from './components/CreatePostBox';
import { PostCard } from './components/PostCard';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { 
  Sparkles, 
  RefreshCw, 
  MessageSquare, 
  FileQuestion,
  Filter
} from 'lucide-react';

export function App() {
  const { user, openAuthModal } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'my-posts' | 'popular'
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const composerRef = useRef(null);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Fetch initial posts
  const fetchPosts = async (pageNum = 1, append = false, sortOption = 'latest') => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const data = await api.getPosts(pageNum, 10, sortOption);
      if (append) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts || []);
      }
      setPage(data.page);
      setTotalPages(data.totalPages);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reload when sort tab changes
  useEffect(() => {
    const sort = activeTab === 'popular' ? 'mostLiked' : 'latest';
    fetchPosts(1, false, sort);
  }, [activeTab]);

  // Re-fetch or re-evaluate isLiked when user logs in/out
  useEffect(() => {
    if (posts.length > 0) {
      setPosts((prevPosts) =>
        prevPosts.map((p) => ({
          ...p,
          isLikedByMe: user
            ? p.likes?.some((l) => (l.userId === user._id || l.userId?.toString() === user._id?.toString()))
            : false,
        }))
      );
    }
  }, [user]);

  // Scroll to composer helper
  const scrollToComposer = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const textarea = composerRef.current?.querySelector('textarea');
    if (textarea) textarea.focus();
  };

  // Create post handler
  const handleCreatePost = async ({ content, image }) => {
    const newPost = await api.createPost({ content, image });
    setPosts((prev) => [
      {
        ...newPost,
        isLikedByMe: false,
        likes: [],
        comments: [],
        likesCount: 0,
        commentsCount: 0,
      },
      ...prev,
    ]);
  };

  // Instant Like / Unlike with optimistic UI
  const handleToggleLike = async (postId) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    // Save previous posts for rollback on failure
    const prevPosts = [...posts];

    // Optimistic mutation
    setPosts((currentPosts) =>
      currentPosts.map((p) => {
        if (p._id !== postId) return p;

        const alreadyLiked = p.isLikedByMe;
        const currentLikes = p.likes || [];

        let newLikes;
        if (alreadyLiked) {
          newLikes = currentLikes.filter(
            (l) => l.userId !== user._id && l.userId?.toString() !== user._id.toString()
          );
        } else {
          newLikes = [
            ...currentLikes,
            {
              userId: user._id,
              username: user.username,
              createdAt: new Date(),
            },
          ];
        }

        return {
          ...p,
          isLikedByMe: !alreadyLiked,
          likes: newLikes,
          likesCount: newLikes.length,
        };
      })
    );

    try {
      const result = await api.toggleLike(postId);
      // Sync authoritative state from server
      setPosts((currentPosts) =>
        currentPosts.map((p) => {
          if (p._id !== postId) return p;
          return {
            ...p,
            likes: result.likes,
            likesCount: result.likesCount,
            isLikedByMe: result.isLikedByMe,
          };
        })
      );
    } catch (err) {
      console.error('Like toggle failed, reverting:', err);
      setPosts(prevPosts);
    }
  };

  // Instant Add Comment with optimistic UI
  const handleAddComment = async (postId, text) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    const tempCommentId = `temp-${Date.now()}`;
    const optimisticComment = {
      _id: tempCommentId,
      userId: user._id,
      username: user.username,
      userAvatar: user.avatar,
      text,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setPosts((currentPosts) =>
      currentPosts.map((p) => {
        if (p._id !== postId) return p;
        const updatedComments = [...(p.comments || []), optimisticComment];
        return {
          ...p,
          comments: updatedComments,
          commentsCount: updatedComments.length,
        };
      })
    );

    try {
      const result = await api.addComment(postId, { text });
      // Replace optimistic comment with server-created comment
      setPosts((currentPosts) =>
        currentPosts.map((p) => {
          if (p._id !== postId) return p;
          return {
            ...p,
            comments: result.comments,
            commentsCount: result.commentsCount,
          };
        })
      );
    } catch (err) {
      console.error('Add comment failed, removing temp comment:', err);
      setPosts((currentPosts) =>
        currentPosts.map((p) => {
          if (p._id !== postId) return p;
          const filteredComments = (p.comments || []).filter((c) => c._id !== tempCommentId);
          return {
            ...p,
            comments: filteredComments,
            commentsCount: filteredComments.length,
          };
        })
      );
    }
  };

  // Delete post handler
  const handleDeletePost = async (postId) => {
    try {
      await api.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.message || 'Failed to delete post');
    }
  };

  // Filter posts based on active tab and search query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Tab filter
      if (activeTab === 'my-posts') {
        if (!user) return false;
        const matchesUser =
          post.user === user._id ||
          post.user?._id === user._id ||
          post.username === user.username;
        if (!matchesUser) return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const contentMatch = post.content?.toLowerCase().includes(query);
        const usernameMatch = post.username?.toLowerCase().includes(query);
        return contentMatch || usernameMatch;
      }

      return true;
    });
  }, [posts, activeTab, searchTerm, user]);

  const myPostsCount = useMemo(() => {
    if (!user) return 0;
    return posts.filter(
      (p) => p.user === user._id || p.user?._id === user._id || p.username === user.username
    ).length;
  }, [posts, user]);

  return (
    <div className="app-container">
      {/* Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenProfile={() => setProfileModalOpen(true)}
        onScrollToComposer={scrollToComposer}
      />

      {/* Main 3-Column Layout */}
      <div className="main-layout">
        {/* Left Sidebar */}
        <LeftSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenProfile={() => setProfileModalOpen(true)}
          myPostsCount={myPostsCount}
        />

        {/* Center Feed Column */}
        <main className="feed-column">
          {/* Stories Bar (TaskPlanet App inspired) */}
          <StoriesBar onAddStoryClick={scrollToComposer} />

          {/* Create Post Box */}
          <CreatePostBox
            composerRef={composerRef}
            onPostCreated={handleCreatePost}
          />

          {/* Active Filter Strip if searching */}
          {searchTerm && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: 'var(--primary-light)', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                Filtering posts by: "{searchTerm}" ({filteredPosts.length} results)
              </span>
              <button
                onClick={() => setSearchTerm('')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Posts List */}
          {loading ? (
            <div className="social-card empty-feed-card">
              <div className="spinner" style={{ width: '36px', height: '36px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Connecting to MongoDB and loading feed...
              </p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onToggleLike={handleToggleLike}
                onAddComment={handleAddComment}
                onDeletePost={handleDeletePost}
              />
            ))
          ) : (
            <div className="social-card empty-feed-card">
              <FileQuestion size={48} color="#94a3b8" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No posts found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '320px' }}>
                {activeTab === 'my-posts'
                  ? "You haven't published any posts yet. Write your first post above!"
                  : searchTerm
                  ? `No posts matched "${searchTerm}". Try a different keyword.`
                  : 'Be the first to share an update with the TaskPlanet community!'}
              </p>
              <button className="btn btn-primary" onClick={scrollToComposer}>
                Create a Post
              </button>
            </div>
          )}

          {/* Pagination / Load More Button */}
          {hasMore && !searchTerm && activeTab === 'feed' && (
            <div style={{ textAlign: 'center', margin: '16px 0 32px' }}>
              <button
                className="btn btn-outline"
                style={{ padding: '10px 24px' }}
                onClick={() => fetchPosts(page + 1, true, activeTab === 'popular' ? 'mostLiked' : 'latest')}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <div className="spinner" style={{ width: '16px', height: '16px' }} />
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span>Load More Posts</span>
                  </>
                )}
              </button>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <RightSidebar onTagClick={(tag) => setSearchTerm(tag)} />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onScrollToComposer={scrollToComposer}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Auth Modal (Login / Sign Up / Recruiter Demo) */}
      <AuthModal />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        myPostsCount={myPostsCount}
      />
    </div>
  );
}

export default App;
