/**
 * pages/organizer/EventFormPage.jsx
 * Create and Edit event — same form component, different mode.
 *
 * FIXES:
 *  1. useEffect had [id] dep but also used token — added token to deps.
 *  2. DateTimePicker receives ISO strings; backend also expects ISO strings —
 *     ensure we don't send empty-string dates (send null instead).
 *  3. Validation: salesStart/salesEnd are optional but if both set, validate order.
 *  4. Ticket type "description" field used Textarea import that wasn't used — removed dead import.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TopBar } from '../../components/layout/TopBar';
import { Input, Select } from '../../components/ui/Input';
import { DateTimePicker } from '../../components/ui/DateTimePicker';
import { Button } from '../../components/ui/Button';
import { Spinner, LoadingState } from '../../components/ui/Spinner';
import { fmtForInput } from '../../utils/format';
import { EventImageUpload } from '../../components/shared/EventImageUpload';
import * as api from '../../api';

const blankTicketType = () => ({
  id: null,
  name: '',
  price: '',
  description: '',
  totalAvailable: '',
});

const blankEvent = () => ({
  name: '',
  venue: '',
  start: '',
  end: '',
  salesStart: '',
  salesEnd: '',
  status: 'DRAFT',
  bannerImage: null,
  ticketTypes: [blankTicketType()],
});

export default function EventFormPage() {
  const { id }       = useParams();
  const isEdit       = Boolean(id);
  const { openMenu } = useOutletContext();
  const { token }    = useAuth();
  const { toast }    = useToast();
  const navigate     = useNavigate();

  const [form,    setForm]    = useState(blankEvent());
  const [loading, setLoading] = useState(isEdit);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});

  // FIX: added token to dep array
  useEffect(() => {
    if (!isEdit) return;
    api.getEventById(id, token)
      .then(e => setForm({
        ...e,
        start:      fmtForInput(e.start),
        end:        fmtForInput(e.end),
        salesStart: fmtForInput(e.salesStart),
        salesEnd:   fmtForInput(e.salesEnd),
        ticketTypes: (e.ticketTypes || []).map(tt => ({
          ...tt,
          price:          String(tt.price          ?? ''),
          totalAvailable: String(tt.totalAvailable ?? ''),
        })),
      }))
      .catch(e => { toast(e.message, 'error'); navigate('/dashboard/events'); })
      .finally(() => setLoading(false));
  }, [id, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const set    = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));
  const setDate = (k) => (val) => setForm(f => ({ ...f, [k]: val }));
  const setTT  = (i, k) => (e) =>
    setForm(f => ({
      ...f,
      ticketTypes: f.ticketTypes.map((tt, idx) =>
        idx === i ? { ...tt, [k]: e.target?.value ?? e } : tt
      ),
    }));

  const addTT    = () => setForm(f => ({ ...f, ticketTypes: [...f.ticketTypes, blankTicketType()] }));
  const removeTT = (i) => setForm(f => ({ ...f, ticketTypes: f.ticketTypes.filter((_, idx) => idx !== i) }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Event name is required.';
    if (!form.venue.trim()) e.venue = 'Venue is required.';
    if (!form.start)        e.start = 'Start date is required.';
    if (!form.end)          e.end   = 'End date is required.';
    if (form.start && form.end && form.end <= form.start) e.end = 'End must be after start.';
    // FIX: validate salesStart/salesEnd order when both are set
    if (form.salesStart && form.salesEnd && form.salesEnd <= form.salesStart)
      e.salesEnd = 'Sales close must be after sales open.';

    form.ticketTypes.forEach((tt, i) => {
      if (!tt.name.trim()) e[`tt_name_${i}`] = 'Name required.';
      if (!tt.price || isNaN(Number(tt.price)) || Number(tt.price) < 0) e[`tt_price_${i}`] = 'Valid price required.';
      if (!tt.totalAvailable || isNaN(Number(tt.totalAvailable)) || Number(tt.totalAvailable) < 1) e[`tt_cap_${i}`] = 'Capacity ≥ 1 required.';
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        // FIX: send null not empty string — backend @NotNull on start/end but salesStart/salesEnd are optional
        start:      form.start      || null,
        end:        form.end        || null,
        salesStart: form.salesStart || null,
        salesEnd:   form.salesEnd   || null,
        ticketTypes: form.ticketTypes.map(tt => ({
          ...tt,
          id:             tt.id || null,
          price:          parseFloat(tt.price)        || 0,
          totalAvailable: parseInt(tt.totalAvailable) || 0,
        })),
      };
      if (isEdit) {
        payload.id = id;
        await api.updateEvent(id, payload, token);
        toast('Event updated.', 'success');
      } else {
        await api.createEvent(payload, token);
        toast('Event created.', 'success');
      }
      navigate('/dashboard/events');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <><TopBar title={isEdit ? 'Edit Event' : 'New Event'} onMenuClick={openMenu} /><LoadingState /></>;

  return (
    <>
      <TopBar
        title={isEdit ? 'Edit Event' : 'New Event'}
        onMenuClick={openMenu}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/events')}>← Back</Button>
        }
      />

      <div className="app-content">
        <div style={{ maxWidth: 740 }}>
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: 20 }}>{isEdit ? 'Edit event' : 'Create event'}</h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => navigate('/dashboard/events')}>Cancel</Button>
              <Button variant="primary" disabled={saving} onClick={handleSave}>
                {saving ? <><Spinner /> Saving…</> : isEdit ? 'Save changes' : 'Create event'}
              </Button>
            </div>
          </div>

          {/* ── Basic info ── */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Event information
              </span>
            </div>
            <div className="card-body form-stack">
              <Input
                label="Event name" required
                value={form.name} onChange={set('name')}
                placeholder="e.g. Mumbai Tech Summit 2025"
                error={errors.name}
              />
              <Input
                label="Venue" required
                value={form.venue} onChange={set('venue')}
                placeholder="e.g. NSCI Dome, Worli, Mumbai"
                error={errors.venue}
              />

              <div className="form-row" style={{ zIndex: 20, position: 'relative' }}>
                <DateTimePicker
                  label="Start date & time" required
                  value={form.start}
                  onChange={setDate('start')}
                  error={errors.start}
                  maxDate={form.end ? form.end.split('T')[0] : undefined}
                />
                <DateTimePicker
                  label="End date & time" required
                  value={form.end}
                  onChange={setDate('end')}
                  error={errors.end}
                  minDate={form.start ? form.start.split('T')[0] : undefined}
                />
              </div>

              <div className="form-row" style={{ position: 'relative', zIndex: 10 }}>
                <DateTimePicker
                  label="Sales open"
                  value={form.salesStart}
                  onChange={setDate('salesStart')}
                  error={errors.salesStart}
                  maxDate={form.salesEnd ? form.salesEnd.split('T')[0] : undefined}
                />
                <DateTimePicker
                  label="Sales close"
                  value={form.salesEnd}
                  onChange={setDate('salesEnd')}
                  error={errors.salesEnd}
                  minDate={form.salesStart ? form.salesStart.split('T')[0] : undefined}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label className="input-label">Status</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['DRAFT', 'Draft — not visible publicly'], ['PUBLISHED', 'Published — live on browse page']].map(([v, l]) => (
                    <div
                      key={v}
                      onClick={() => setForm(f => ({ ...f, status: v }))}
                      style={{
                        flex: 1, padding: '9px 12px',
                        border: `1px solid ${form.status === v ? 'var(--text-2)' : 'var(--border)'}`,
                        borderRadius: 'var(--r2)', cursor: 'pointer',
                        background: form.status === v ? 'var(--surface-2)' : 'var(--surface)',
                        transition: 'all 0.12s',
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{v}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <EventImageUpload
                value={form.bannerImage}
                onChange={(val) => setForm(f => ({ ...f, bannerImage: val }))}
              />
            </div>
          </div>

          {/* ── Ticket types ── */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Ticket types
              </span>
              <Button size="sm" onClick={addTT}>+ Add type</Button>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {form.ticketTypes.map((tt, i) => (
                <div key={i} className="tt-form-item">
                  <div className="tt-form-header">
                    <span className="tt-form-label">Type {i + 1}</span>
                    {form.ticketTypes.length > 1 && (
                      <Button variant="danger" size="sm" onClick={() => removeTT(i)}>Remove</Button>
                    )}
                  </div>

                  <div className="form-row" style={{ marginBottom: 10 }}>
                    <Input
                      label="Name" required
                      value={tt.name} onChange={setTT(i, 'name')}
                      placeholder="e.g. General, VIP, Early Bird"
                      error={errors[`tt_name_${i}`]}
                    />
                    <Input
                      label="Description"
                      value={tt.description} onChange={setTT(i, 'description')}
                      placeholder="What's included?"
                    />
                  </div>
                  <div className="form-row">
                    <Input
                      label="Price (₹)" required type="number" min="0"
                      value={tt.price} onChange={setTT(i, 'price')}
                      placeholder="0" error={errors[`tt_price_${i}`]}
                    />
                    <Input
                      label="Capacity" required type="number" min="1"
                      value={tt.totalAvailable} onChange={setTT(i, 'totalAvailable')}
                      placeholder="e.g. 500" error={errors[`tt_cap_${i}`]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => navigate('/dashboard/events')}>Cancel</Button>
            <Button variant="primary" disabled={saving} onClick={handleSave}>
              {saving ? <><Spinner /> Saving…</> : isEdit ? 'Save changes' : 'Create event'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
