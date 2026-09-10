import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Sparkles, ArrowRight } from 'lucide-react';

export const AuthModal = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    setAuthModalMode,
    login,
    register,
    quickDemoLogin,
  } = useAuth();

  // Login states
  const [loginEmailOrUsername, setLoginEmailOrUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmailOrUsername || !loginPassword) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(loginEmailOrUsername, loginPassword);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !username || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register({
        name,
        username,
        email,
        password,
        bio,
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Try another username or email.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail) => {
    setLoading(true);
    setError('');
    try {
      await quickDemoLogin(demoEmail);
    } catch (err) {
      setError('Demo login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h3 className="modal-title">
            {authModalMode === 'login' ? 'Welcome Back 👋' : 'Join TaskPlanet 🚀'}
          </h3>
          <button className="btn-icon" onClick={closeAuthModal} style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${authModalMode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthModalMode('login');
                setError('');
              }}
            >
              Log In
            </button>
            <button
              className={`auth-tab ${authModalMode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setAuthModalMode('register');
                setError('');
              }}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          {authModalMode === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Email or Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. aarav@taskplanet.com or aarav_tech"
                  value={loginEmailOrUsername}
                  onChange={(e) => setLoginEmailOrUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '44px', marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? <div className="spinner" /> : 'Log In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ananya Sen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Username (alphanumeric & underscores) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ananya_dev"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. ananya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password (min 6 characters) *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Short Bio (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tell others what you do..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '44px', marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? <div className="spinner" /> : 'Create Account'}
              </button>
            </form>
          )}

          {/* Quick Demo Logins */}
          <div className="quick-demo-accounts">
            <div className="quick-demo-title">
              ⚡ Quick Demo Accounts
            </div>
            <div className="demo-pills-row">
              <button
                type="button"
                className="demo-pill"
                onClick={() => handleQuickDemo('aarav@taskplanet.com')}
                disabled={loading}
              >
                👤 Aarav (Full Stack)
              </button>
              <button
                type="button"
                className="demo-pill"
                onClick={() => handleQuickDemo('priya@taskplanet.com')}
                disabled={loading}
              >
                🎨 Priya (Design)
              </button>
              <button
                type="button"
                className="demo-pill"
                onClick={() => handleQuickDemo('rohan@taskplanet.com')}
                disabled={loading}
              >
                💻 Rohan (Backend)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
