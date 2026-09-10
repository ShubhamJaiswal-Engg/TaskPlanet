import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  toggleLike,
  addComment,
  deletePost,
} from '../controllers/postController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPostById);
router.post('/', protect, createPost);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);

export default router;
