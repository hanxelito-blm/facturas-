import { useState } from 'react';
import { LoginIcon, AlertIcon } from '../components/icons/ExtraIcons.jsx';

const ADMIN_CREDENTIALS = {
  email: 'admin@techstore.com',
  password: 'admin123',
};

const Login = ({ onLogin, t }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        onLogin();
      } else {
        setError(t('loginError'));
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="login-overlay">
      <div className="login-card card">
        <div className="card-header">
          <LoginIcon />
          <span>{t('loginTitle')}</span>
        </div>
        <div className="card-body">
          <div className="login-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-accent)' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2>Iniciar Sesión</h2>
          <p className="login-subtitle">{t('loginSubtitle')}</p>

          {error && (
            <div className="login-error">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@techstore.com"
                required
              />
            </div>
            <div className="form-group">
              <label>{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary login-btn btn-icon-only" disabled={isLoading} title={t('loginButton')}>
              <LoginIcon />
            </button>
          </form>

          <div className="login-hint">
            <p>{t('credentialsHint')}</p>
            <code>admin@techstore.com / admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
