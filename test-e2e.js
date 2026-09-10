// Comprehensive End-to-End API and Flow Verification Script
const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('🚀 Starting Full Suite Verification for TaskPlanet Social App...\n');
  let passed = 0;
  let total = 0;

  const assert = (condition, title) => {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title}`);
      process.exitCode = 1;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(health.status === 'online', 'Health endpoint reports online status');

    // 2. Fetch public feed
    const feedRes = await fetch(`${BASE_URL}/posts?page=1&limit=5`);
    const feed = await feedRes.json();
    assert(Array.isArray(feed.posts) && feed.posts.length > 0, `Public feed contains seeded posts (Found ${feed.posts.length} posts)`);
    assert(feed.page === 1 && feed.totalPages >= 1, 'Pagination metadata is properly formed');

    // 3. User Registration
    const timestamp = Date.now();
    const testUsername = `testuser_${timestamp}`;
    const testEmail = `test_${timestamp}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        username: testUsername,
        email: testEmail,
        password: 'Password123!',
        bio: 'Automated end-to-end test account',
      }),
    });
    const regData = await regRes.json();
    assert(regData.token && regData.username === testUsername, `User registration creates account and issues JWT token (@${testUsername})`);
    const token = regData.token;

    // 4. User Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrUsername: testEmail,
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginData.token && loginData.name === 'Test User', 'User login authenticates credentials and returns profile');

    // 5. Create Post (Text Only)
    const textPostRes = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: 'Testing text-only post publishing without an image attached.',
        image: '',
      }),
    });
    const textPost = await textPostRes.json();
    assert(textPost.content && !textPost.image, 'Create post succeeds with text-only');

    // 6. Create Post (Image Only)
    const imgPostRes = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: '',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000',
      }),
    });
    const imgPost = await imgPostRes.json();
    assert(!imgPost.content && imgPost.image, 'Create post succeeds with image-only');

    // 7. Create Post (Both Text & Image)
    const fullPostRes = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: 'Full post with both text content and rich media image!',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000',
      }),
    });
    const fullPost = await fullPostRes.json();
    assert(fullPost.content && fullPost.image, 'Create post succeeds with both text and image');
    const targetPostId = fullPost._id;

    // 8. Like Post & verify username is stored
    const likeRes = await fetch(`${BASE_URL}/posts/${targetPostId}/like`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    const likeData = await likeRes.json();
    assert(likeData.likesCount === 1 && likeData.isLikedByMe === true, 'Toggling like increments count to 1 and flags isLikedByMe');
    assert(likeData.likes.some(l => l.username === testUsername), `Liker username '${testUsername}' is stored in post document`);

    // 9. Add Comment & verify username is stored
    const commentRes = await fetch(`${BASE_URL}/posts/${targetPostId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: 'This is an instant automated test comment! Looks fantastic.',
      }),
    });
    const commentData = await commentRes.json();
    assert(commentData.commentsCount === 1, 'Adding comment increments commentsCount to 1');
    assert(commentData.comment.username === testUsername, `Commenter username '${testUsername}' is stored in comment object`);

    // 10. Unlike Post
    const unlikeRes = await fetch(`${BASE_URL}/posts/${targetPostId}/like`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    const unlikeData = await unlikeRes.json();
    assert(unlikeData.likesCount === 0 && unlikeData.isLikedByMe === false, 'Toggling like again unlikes and decrements count to 0');

    // 11. Validation check: Empty post must fail
    const emptyPostRes = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: '   ', image: '' }),
    });
    assert(emptyPostRes.status === 400, 'Posting empty content & empty image is properly rejected with 400 Bad Request');

    // 12. Delete Post
    const delRes = await fetch(`${BASE_URL}/posts/${targetPostId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const delData = await delRes.json();
    assert(delData.postId === targetPostId, 'Post author can delete their own post');

    console.log(`\n========================================`);
    console.log(`🎯 Test Summary: ${passed}/${total} Passed (${Math.round((passed/total)*100)}%)`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
