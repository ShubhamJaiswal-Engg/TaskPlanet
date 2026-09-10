import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      trim: true,
      maxlength: [2000, 'Post content cannot exceed 2000 characters'],
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    likes: [likeSchema],
    comments: [commentSchema],
  },
  {
    timestamps: true,
    collection: 'posts',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual counts for likes and comments
postSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

postSchema.virtual('commentsCount').get(function () {
  return this.comments ? this.comments.length : 0;
});

// Validation: At least one of content or image must be provided
postSchema.pre('validate', function (next) {
  const hasContent = this.content && this.content.trim().length > 0;
  const hasImage = this.image && this.image.trim().length > 0;

  if (!hasContent && !hasImage) {
    next(new Error('A post must contain either text content, an image, or both.'));
  } else {
    next();
  }
});

const Post = mongoose.model('Post', postSchema);
export default Post;
