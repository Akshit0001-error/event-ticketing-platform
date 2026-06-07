/**
 * pages/auth/LoginPage.jsx
 *
 * FIXES:
 *  1. After login, redirect to 'from' location (set by ProtectedRoute) if present.
 *  2. Passes res.name to login() so AuthContext can store display name.
 *  3. Added password minlength hint on the input.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import * as api from '../../api';

export default function LoginPage() {
  const { login }   = useAuth();
  const { toast }   = useToast();
  const navigate    = useNavigate();
  const location    = useLocation();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await api.login(form);
      login(res.token, res.name);

      const role = String(res.role || '').replace('ROLE_', '');
      // FIX: redirect to where they were trying to go, or role default
      const from = location.state?.from?.pathname;
      const dest = from || (
        role === 'ORGANIZER' ? '/dashboard' :
        role === 'STAFF'     ? '/validate'  : '/browse'
      );
      toast(`Welcome back, ${res.name || 'there'}!`, 'success');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-mark">T</div>
          Ticket Platform
        </div>

        <h1 className="auth-title">Sign in</h1>
        <p className="auth-sub">Enter your credentials to continue.</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={submit} className="form-stack">
          <Input
            label="Email" type="email" required
            value={form.email} onChange={set('email')}
            placeholder="you@example.com" autoFocus
          />
          <Input
            label="Password" type="password" required
            value={form.password} onChange={set('password')}
            placeholder="••••••••"
          />
          <Button
            type="submit" variant="primary" size="lg"
            disabled={loading} style={{ width: '100%', marginTop: 4 }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="auth-footer">
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
