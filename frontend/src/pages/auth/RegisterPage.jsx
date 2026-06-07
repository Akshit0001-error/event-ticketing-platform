/**
 * pages/auth/RegisterPage.jsx
 * Register → auto-login flow. Passes name correctly to AuthContext.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import * as api from '../../api';

export default function RegisterPage() {
  const { login }  = useAuth();
  const { toast }  = useToast();
  const navigate   = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', role: 'ATTENDEE',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim())        { setError('Full name is required.'); return; }
    if (!form.email)              { setError('Email is required.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await api.register({ name: form.name.trim(), email: form.email, password: form.password, role: form.role });
      // Auto-login after registration
      const res = await api.login({ email: form.email, password: form.password });
      login(res.token, res.name || form.name.trim());

      const role = String(res.role || '').replace('ROLE_', '');
      const dest = role === 'ORGANIZER' ? '/dashboard' : '/browse';
      toast('Account created! Welcome aboard.', 'success');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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

        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join as an attendee or event organiser.</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={submit} className="form-stack">
          <Input
            label="Full name" required
            value={form.name} onChange={set('name')}
            placeholder="Ravi Kumar" autoFocus
          />
          <Input
            label="Email" type="email" required
            value={form.email} onChange={set('email')}
            placeholder="you@example.com"
          />
          <Input
            label="Password" type="password" required
            value={form.password} onChange={set('password')}
            placeholder="Min. 8 characters"
          />
          <Input
            label="Confirm password" type="password" required
            value={form.confirm} onChange={set('confirm')}
            placeholder="Re-enter password"
          />
          <Select
            label="I am a…"
            value={form.role} onChange={set('role')}
          >
            <option value="ATTENDEE">Attendee — I want to buy tickets</option>
            <option value="ORGANIZER">Organizer — I want to create events</option>
          </Select>
          <Button
            type="submit" variant="primary" size="lg"
            disabled={loading} style={{ width: '100%', marginTop: 4 }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
