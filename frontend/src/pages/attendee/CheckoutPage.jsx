/**
 * pages/attendee/CheckoutPage.jsx
 *
 * FIXES:
 *  1. Backend verifyPayment expects { razorpayOrderId, razorpayPaymentId,
 *     razorpaySignature, eventId, ticketTypeId, quantity } — added eventId.
 *  2. FIX: amountInPaise used correctly (was already present but eventId was missing).
 *  3. Guard: redirect if location.state is missing (navigated directly to /checkout).
 */
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { fmtPrice, fmtDateTime } from '../../utils/format';
import * as api from '../../api';

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = resolve;
    s.onerror = () => reject(new Error('Failed to load Razorpay SDK. Check your internet connection.'));
    document.head.appendChild(s);
  });
}

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast }       = useToast();

  const { event, ticketType, quantity } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState('review');

  useEffect(() => {
    // FIX: also guard quantity — undefined quantity makes total NaN and breaks Razorpay amount
    if (!event || !ticketType || !quantity) navigate('/browse', { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!event || !ticketType || !quantity) return null;

  const total = ticketType.price * quantity;

  const startPayment = async () => {
    setLoading(true);
    setStep('processing');
    try {
      const order = await api.createOrder({ ticketTypeId: ticketType.id, quantity }, token);

      await loadRazorpay();

      const rzp = new window.Razorpay({
        key:         order.keyId,
        amount:      order.amountInPaise,
        currency:    order.currency || 'INR',
        name:        'Ticket Platform',
        description: `${ticketType.name} × ${quantity}`,
        order_id:    order.orderId,
        prefill: {
          name:  user?.name  || '',
          email: user?.email || '',
        },
        theme: { color: '#e8a046' },

        handler: async (response) => {
          try {
            await api.verifyPayment({
              razorpayOrderId:   order.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              // FIX: eventId was missing — backend requires it for ticket issuance
              eventId:           event.id,
              ticketTypeId:      ticketType.id,
              quantity,
            }, token);
            setStep('done');
            toast('Tickets booked! Check your email.', 'success');
          } catch (e) {
            toast(e.message, 'error');
            setStep('review');
          }
          setLoading(false);
        },

        modal: {
          ondismiss: () => { setLoading(false); setStep('review'); },
        },
      });
      rzp.open();

    } catch (e) {
      toast(e.message, 'error');
      setLoading(false);
      setStep('review');
    }
  };

  /* ── Success screen ── */
  if (step === 'done') {
    return (
      <div className="checkout-success fade-in">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 52, color: 'var(--success)', marginBottom: 16, lineHeight: 1 }}>✓</div>
        <h1 style={{ fontSize: 24, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Booking confirmed</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 13.5, marginBottom: 28, lineHeight: 1.7 }}>
          Your {quantity} ticket{quantity > 1 ? 's have' : ' has'} been booked for{' '}
          <strong style={{ color: 'var(--text)' }}>{event.name}</strong>.
          QR codes have been sent to your email.
        </p>
        <div className="checkout-success-actions">
          <Button variant="primary" onClick={() => navigate('/tickets')}>View my tickets</Button>
          <Button onClick={() => navigate('/browse')}>Browse more</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-wrap fade-in">
      <button
        onClick={() => navigate(-1)}
        className="back-btn"
      >
        ← Back
      </button>

      <h1 style={{ fontSize: 22, marginBottom: 4, letterSpacing: '-0.3px' }}>Review order</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 24 }}>Confirm your details before payment.</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span style={{ fontSize: 13, fontWeight: 600 }}>Order summary</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Razorpay</span>
        </div>
        <div className="card-body">
          <div className="order-row">
            <span className="order-row-label">Event</span>
            <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{event.name}</span>
          </div>
          <div className="order-row">
            <span className="order-row-label">Date</span>
            <span className="order-row-value">{fmtDateTime(event.start)}</span>
          </div>
          <div className="order-row">
            <span className="order-row-label">Venue</span>
            <span>{event.venue}</span>
          </div>
          <div className="order-row">
            <span className="order-row-label">Ticket type</span>
            <span style={{ fontWeight: 500 }}>{ticketType.name}</span>
          </div>
          <div className="order-row">
            <span className="order-row-label">Price per ticket</span>
            <span className="order-row-value" style={{ color: 'var(--accent)' }}>{fmtPrice(ticketType.price)}</span>
          </div>
          <div className="order-row">
            <span className="order-row-label">Quantity</span>
            <span className="order-row-value">{quantity}</span>
          </div>
          <div className="order-total">
            <span>Total</span>
            <span className="order-total-value">{fmtPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        <span>🔒</span>
        <span>Secure payment via Razorpay. QR code delivered to your email after payment.</span>
      </div>

      <Button
        variant="primary" size="lg"
        disabled={loading}
        onClick={startPayment}
        style={{ width: '100%' }}
      >
        {loading ? <><Spinner /> Processing…</> : `Pay ${fmtPrice(total)}`}
      </Button>

      <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 12 }}>
        You will be redirected to Razorpay's secure checkout.
      </p>
    </div>
  );
}
