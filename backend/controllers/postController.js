import Post from '../models/Post.js';
import User from '../models/User.js';

// @desc    Get all posts (public feed with pagination)
// @route   GET /api/posts
// @access  Public (optional auth for isLiked status)
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortOption = req.query.sort === 'mostLiked' ? { 'likes.length': -1, createdAt: -1 } : { createdAt: -1 };

    const totalPosts = await Post.countDocuments();
    const posts = await Post.find()
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Map posts to attach isLikedByMe and ensure likesCount and commentsCount are explicitly computed
    const formattedPosts = posts.map((post) => {
      const isLikedByMe = req.user
        ? post.likes.some((like) => like.userId.toString() === req.user._id.toString())
        : false;

      return {
        ...post,
        likesCount: post.likes ? post.likes.length : 0,
        commentsCount: post.comments ? post.comments.length : 0,
        isLikedByMe,
      };
    });

    res.json({
      posts: formattedPosts,
      page,
      totalPages: Math.ceil(totalPosts / limit) || 1,
      totalPosts,
      hasMore: skip + posts.length < totalPosts,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error retrieving posts' });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLikedByMe = req.user
      ? post.likes.some((like) => like.userId.toString() === req.user._id.toString())
      : false;

    res.json({
      ...post.toObject(),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByMe,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving post' });
  }
};

// @desc    Create a new post (text, image, or both)
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    const trimmedContent = content ? content.trim() : '';
    const trimmedImage = image ? image.trim() : '';

    if (!trimmedContent && !trimmedImage) {
      return res.status(400).json({
        message: 'Post must contain text content, an image, or both.',
      });
    }

    const post = await Post.create({
      user: req.user._id,
      username: req.user.username,
      userAvatar: req.user.avatar || '',
      content: trimmedContent,
      image: trimmedImage,
      likes: [],
      comments: [],
    });

    res.status(201).json({
      ...post.toObject(),
      likesCount: 0,
      commentsCount: 0,
      isLikedByMe: false,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: error.message || 'Server error creating post' });
  }
};

// @desc    Toggle like on a post (saves username of who liked)
// @route   PUT /api/posts/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIdStr = req.user._id.toString();
    const existingIndex = post.likes.findIndex(
      (like) => like.userId.toString() === userIdStr
    );

    let isLikedNow = false;

    if (existingIndex !== -1) {
      // User already liked -> unlike
      post.likes.splice(existingIndex, 1);
      isLikedNow = false;
    } else {
      // Add like with userId and username
      post.likes.push({
        userId: req.user._id,
        username: req.user.username,
        createdAt: new Date(),
      });
      isLikedNow = true;
    }

    await post.save();

    res.json({
      postId: post._id,
      likesCount: post.likes.length,
      likes: post.likes,
      isLikedByMe: isLikedNow,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error updating like' });
  }
};

// @desc    Add a comment to a post (saves username of commenter)
// @route   POST /api/posts/:id/comment
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      userId: req.user._id,
      username: req.user.username,
      userAvatar: req.user.avatar || '',
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      postId: post._id,
      comment: addedComment,
      comments: post.comments,
      commentsCount: post.comments.length,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};

// @desc    Delete post (author only)
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed successfully', postId: req.params.id });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
};
