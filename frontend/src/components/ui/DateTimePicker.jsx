/**
 * DateTimePicker.jsx
 * Custom calendar + time picker matching the app's dark design system.
 * Drop-in replacement for <input type="datetime-local" />.
 *
 * Props:
 *   label       - field label string
 *   required    - shows red asterisk
 *   value       - ISO-like string "YYYY-MM-DDTHH:mm" (same as datetime-local)
 *   onChange    - called with (isoString) e.g. "2025-08-15T18:30"
 *   error       - error message string
 *   minDate     - "YYYY-MM-DD" — disables dates before this
 *   maxDate     - "YYYY-MM-DD" — disables dates after this
 */
import { useState, useEffect, useRef, useCallback } from 'react';

/* ── Helpers ───────────────────────────────────────────────── */
const pad  = (n) => String(n).padStart(2, '0');
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function firstWeekday(year, month) {
  return new Date(year, month, 1).getDay();
}
function parseValue(val) {
  if (!val) return null;
  const [datePart, timePart = '00:00'] = val.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute]     = timePart.split(':').map(Number);
  return { year, month: month - 1, day, hour, minute };
}
function toIso(year, month, day, hour, minute) {
  return `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

/* ── Main component ─────────────────────────────────────────── */
export function DateTimePicker({ label, required, value, onChange, error, minDate, maxDate }) {
  const ref       = useRef(null);
  const [open, setOpen]     = useState(false);

  /* Internal calendar / time state */
  const parsed = parseValue(value);
  const today  = new Date();

  const [viewYear,  setViewYear]  = useState(parsed?.year  ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());
  const [selDate,   setSelDate]   = useState(parsed ? { year: parsed.year, month: parsed.month, day: parsed.day } : null);
  const [hour,      setHour]      = useState(parsed?.hour   ?? 0);
  const [minute,    setMinute]    = useState(parsed?.minute ?? 0);

  /* Sync when external value changes */
  useEffect(() => {
    const p = parseValue(value);
    if (p) {
      setViewYear(p.year); setViewMonth(p.month);
      setSelDate({ year: p.year, month: p.month, day: p.day });
      setHour(p.hour); setMinute(p.minute);
    }
  }, [value]);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* Emit value whenever date or time changes */
  const emit = useCallback((sd, h, m) => {
    if (!sd) return;
    onChange(toIso(sd.year, sd.month, sd.day, h, m));
  }, [onChange]);

  /* Min/max helpers */
  const dateStr = (y, mo, d) => `${y}-${pad(mo + 1)}-${pad(d)}`;
  const isDisabled = (y, mo, d) => {
    const s = dateStr(y, mo, d);
    if (minDate && s < minDate) return true;
    if (maxDate && s > maxDate) return true;
    return false;
  };
  const isSelected = (y, mo, d) =>
    selDate && selDate.year === y && selDate.month === mo && selDate.day === d;
  const isToday = (y, mo, d) =>
    y === today.getFullYear() && mo === today.getMonth() && d === today.getDate();

  /* Calendar grid */
  const numDays = daysInMonth(viewYear, viewMonth);
  const startDay = firstWeekday(viewYear, viewMonth);
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= numDays; d++) cells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const pickDay = (d) => {
    const sd = { year: viewYear, month: viewMonth, day: d };
    setSelDate(sd);
    emit(sd, hour, minute);
  };

  const changeHour = (delta) => {
    const h = (hour + delta + 24) % 24;
    setHour(h);
    emit(selDate, h, minute);
  };
  const changeMinute = (delta) => {
    const m = (minute + delta + 60) % 60;
    setMinute(m);
    emit(selDate, hour, m);
  };

  /* Display label */
  const displayVal = selDate
    ? `${selDate.day} ${MONTHS[selDate.month].slice(0,3)} ${selDate.year}, ${pad(hour)}:${pad(minute)}`
    : '';

  return (
    <div className="input-wrap" ref={ref} style={{ position: 'relative' }}>
      {label && (
        <label className={`input-label${required ? ' required' : ''}`}>{label}</label>
      )}

      {/* Trigger */}
      <button
        type="button"
        className={`input dtp-trigger${error ? ' error' : ''}`}
        onClick={() => setOpen(o => !o)}
        style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
      >
        <span style={{ color: displayVal ? 'var(--text)' : 'var(--text-3)', fontSize: 13 }}>
          {displayVal || 'Select date & time'}
        </span>
        <span style={{ color: 'var(--text-3)', fontSize: 12, flexShrink: 0 }}>📅</span>
      </button>

      {error && <span className="input-error">{error}</span>}

      {/* Popover */}
      {open && (
        <div className="dtp-popover">
          {/* Month navigation */}
          <div className="dtp-nav">
            <button type="button" className="dtp-nav-btn" onClick={prevMonth}>‹</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <select
                className="dtp-month-sel"
                value={viewMonth}
                onChange={e => setViewMonth(Number(e.target.value))}
              >
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <input
                type="number"
                className="dtp-year-inp"
                value={viewYear}
                min={1900} max={2100}
                onChange={e => setViewYear(Number(e.target.value))}
              />
            </div>
            <button type="button" className="dtp-nav-btn" onClick={nextMonth}>›</button>
          </div>

          {/* Day headers */}
          <div className="dtp-grid">
            {DAYS.map(d => (
              <div key={d} className="dtp-day-hdr">{d}</div>
            ))}

            {/* Cells */}
            {cells.map((d, i) =>
              d === null ? (
                <div key={`e${i}`} />
              ) : (
                <button
                  type="button"
                  key={`d${d}`}
                  disabled={isDisabled(viewYear, viewMonth, d)}
                  onClick={() => pickDay(d)}
                  className={[
                    'dtp-day',
                    isSelected(viewYear, viewMonth, d) ? 'dtp-day-sel' : '',
                    isToday(viewYear, viewMonth, d) && !isSelected(viewYear, viewMonth, d) ? 'dtp-day-today' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {d}
                </button>
              )
            )}
          </div>

          {/* Time picker */}
          <div className="dtp-time">
            <span className="dtp-time-label">Time</span>
            <div className="dtp-time-ctrl">
              <button type="button" className="dtp-spin" onClick={() => changeHour(1)}>▲</button>
              <div className="dtp-time-val">{pad(hour)}</div>
              <button type="button" className="dtp-spin" onClick={() => changeHour(-1)}>▼</button>
            </div>
            <span style={{ color: 'var(--text-2)', fontWeight: 700, fontSize: 16 }}>:</span>
            <div className="dtp-time-ctrl">
              <button type="button" className="dtp-spin" onClick={() => changeMinute(5)}>▲</button>
              <div className="dtp-time-val">{pad(minute)}</div>
              <button type="button" className="dtp-spin" onClick={() => changeMinute(-5)}>▼</button>
            </div>
            <span style={{ color: 'var(--text-2)', fontSize: 12 }}>
              {hour < 12 ? 'AM' : 'PM'}
            </span>
          </div>

          {/* Done button */}
          <div className="dtp-footer">
            {selDate && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={() => setOpen(false)}
              >
                Done
              </button>
            )}
            {value && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => { setSelDate(null); onChange(''); }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
