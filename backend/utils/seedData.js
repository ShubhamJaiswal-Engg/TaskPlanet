import User from '../models/User.js';
import Post from '../models/Post.js';

export const seedDatabase = async () => {
  try {
    const postCount = await Post.countDocuments();
    if (postCount > 0) {
      console.log(`ℹ️ Database already has ${postCount} posts. Skipping auto-seed.`);
      return;
    }

    console.log('🌱 Empty database detected. Seeding sample TaskPlanet demo data...');

    // Clean existing seed users if any
    await User.deleteMany({ email: { $regex: /@taskplanet\.com$/i } });

    // Create demo users
    const usersData = [
      {
        name: 'Aarav Sharma',
        username: 'aarav_tech',
        email: 'aarav@taskplanet.com',
        password: 'Password123!',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: 'Full stack explorer & open source builder. Excited about TaskPlanet ecosystem! 💻✨',
      },
      {
        name: 'Priya Patel',
        username: 'priya_design',
        email: 'priya@taskplanet.com',
        password: 'Password123!',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        bio: 'Product Designer & UI lover 🎨 | Designing intuitive experiences',
      },
      {
        name: 'Rohan Verma',
        username: 'rohan_codes',
        email: 'rohan@taskplanet.com',
        password: 'Password123!',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        bio: 'Backend enthusiast & coffee lover ☕ | Node.js & MongoDB geek',
      },
      {
        name: 'Neha Kapoor',
        username: 'neha_growth',
        email: 'neha@taskplanet.com',
        password: 'Password123!',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        bio: 'Growth Marketer & Tech advocate 🚀 | Building communities',
      },
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
    }

    // Seed diverse posts:
    // 1. Text + Image
    // 2. Text only
    // 3. Image only
    // 4. Multiple likes & comments
    const samplePosts = [
      {
        user: createdUsers[0]._id,
        username: createdUsers[0].username,
        userAvatar: createdUsers[0].avatar,
        content: 'Just deployed the new feed interactions on TaskPlanet! 🚀 Loving the instant likes, responsive layout, and smooth discussion threads. Drop a comment below and share your thoughts!',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
        likes: [
          { userId: createdUsers[1]._id, username: createdUsers[1].username, createdAt: new Date() },
          { userId: createdUsers[2]._id, username: createdUsers[2].username, createdAt: new Date() },
          { userId: createdUsers[3]._id, username: createdUsers[3].username, createdAt: new Date() },
        ],
        comments: [
          {
            userId: createdUsers[1]._id,
            username: createdUsers[1].username,
            userAvatar: createdUsers[1].avatar,
            text: 'The UI looks exceptionally clean! Love the clean aesthetics and layout.',
            createdAt: new Date(Date.now() - 3600000),
          },
          {
            userId: createdUsers[2]._id,
            username: createdUsers[2].username,
            userAvatar: createdUsers[2].avatar,
            text: 'Super smooth performance! Instant likes are super satisfying.',
            createdAt: new Date(Date.now() - 1800000),
          },
        ],
      },
      {
        user: createdUsers[1]._id,
        username: createdUsers[1].username,
        userAvatar: createdUsers[1].avatar,
        content: 'Quick design tip for web applications: Consistent spacing, subtle elevation cards, and readable typography will always beat cluttered animations. Clean simplicity is the highest form of sophistication.',
        image: '', // Text-only post test!
        likes: [
          { userId: createdUsers[0]._id, username: createdUsers[0].username, createdAt: new Date() },
          { userId: createdUsers[3]._id, username: createdUsers[3].username, createdAt: new Date() },
        ],
        comments: [
          {
            userId: createdUsers[3]._id,
            username: createdUsers[3].username,
            userAvatar: createdUsers[3].avatar,
            text: '100% agreed! Great UX leads to great product retention.',
            createdAt: new Date(Date.now() - 7200000),
          },
        ],
      },
      {
        user: createdUsers[2]._id,
        username: createdUsers[2].username,
        userAvatar: createdUsers[2].avatar,
        content: 'Weekend coding marathon in full swing! Working with Node.js and MongoDB embedded subdocuments for high-speed queries. ☕💻',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
        likes: [
          { userId: createdUsers[0]._id, username: createdUsers[0].username, createdAt: new Date() },
        ],
        comments: [
          {
            userId: createdUsers[0]._id,
            username: createdUsers[0].username,
            userAvatar: createdUsers[0].avatar,
            text: 'Keep crushing it Rohan! Best of luck.',
            createdAt: new Date(Date.now() - 900000),
          },
        ],
      },
      {
        user: createdUsers[3]._id,
        username: createdUsers[3].username,
        userAvatar: createdUsers[3].avatar,
        content: '', // Image-only post test!
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
        likes: [
          { userId: createdUsers[1]._id, username: createdUsers[1].username, createdAt: new Date() },
          { userId: createdUsers[2]._id, username: createdUsers[2].username, createdAt: new Date() },
        ],
        comments: [
          {
            userId: createdUsers[1]._id,
            username: createdUsers[1].username,
            userAvatar: createdUsers[1].avatar,
            text: 'Team collaboration at its finest! 🌟',
            createdAt: new Date(Date.now() - 600000),
          },
        ],
      },
    ];

    await Post.insertMany(samplePosts);
    console.log('✅ Demo seed data created successfully (4 users, 4 diverse posts with likes & comments)');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
