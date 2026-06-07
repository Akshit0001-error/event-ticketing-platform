/** 404 page */
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, textAlign: 'center', padding: 24 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 64, fontWeight: 700, color: 'var(--text-3)', lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: 20 }}>Page not found</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 340 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="primary" onClick={() => navigate('/')}>Go home</Button>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    </div>
  );
}
