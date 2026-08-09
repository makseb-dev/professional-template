import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { fetchMe, fetchSections, signin } from '../api/agency';
import type { AdminSection } from '../types';

export function Login({
  onAuthed,
}: {
  onAuthed: (sections: AdminSection[]) => void;
}) {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signin(emailOrPhone, password);
      const me = await fetchMe();
      if (!me) throw new Error('Could not verify session');
      const sections = await fetchSections();
      onAuthed(sections);
      navigate('/admin');
    } catch (err) {
      setError((err as Error).message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span className="brand-tile" style={{ marginInline: 'auto', width: '3.5rem', height: '3.5rem' }}>
            <Plane size={28} style={{ transform: 'rotate(45deg)' }} />
          </span>
          <h2 style={{ fontSize: '1.5rem', marginTop: '0.75rem', marginBottom: '0.25rem' }}>Admin Access</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Secure area — edit your website sections.</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label htmlFor="login-email">Email or phone</label>
          <input
            id="login-email"
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textAlign: 'center', marginTop: '1rem' }}>
          Demo · hello@professionaltraveling.com / StrongPass123
        </p>
      </form>
    </div>
  );
}
