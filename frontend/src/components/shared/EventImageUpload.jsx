/**
 * components/shared/EventImageUpload.jsx
 * Uploads event banner images directly to Cloudinary from the browser.
 *
 * Requires two env vars (set in .env):
 *   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
 *
 * On success, calls onChange(url) with the permanent Cloudinary HTTPS URL.
 * The URL (~80 chars) is what gets stored in the event record — not the image.
 *
 * Cloudinary free tier: 25 GB storage + 25 GB bandwidth/month.
 */
import { useRef, useState } from 'react';

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB input limit (Cloudinary handles resizing)
const ACCEPTED  = 'image/jpeg,image/png,image/webp';

// ─── Upload to Cloudinary ─────────────────────────────────────────────────────
async function uploadToCloudinary(file, onProgress) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and ' +
      'VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.'
    );
  }

  const fd = new FormData();
  fd.append('file',          file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder',        'events');
  // NOTE: 'transformation' is not allowed with unsigned upload presets.
  // Instead we build a resized delivery URL from the returned public_id after upload.

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', UPLOAD_URL);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        // Build a resized delivery URL using Cloudinary's URL transformation syntax.
        // Cloudinary resizes on the fly on first request then caches on CDN — nothing re-uploads.
        // c_fill = crop to exact size | w_800,h_400 | q_auto = auto quality | f_auto = best format (WebP etc)
        const resizedUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_800,h_400,q_auto,f_auto/${data.public_id}`;
        resolve(resizedUrl);
      } else {
        const err = JSON.parse(xhr.responseText || '{}');
        reject(new Error(err.error?.message || `Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload.'));
    xhr.send(fd);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export function EventImageUpload({ value, onChange, error }) {
  const inputRef          = useRef(null);
  const [progress, setProgress] = useState(null); // null | 0-100
  const [localErr, setLocalErr] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setLocalErr('');

    if (!file.type.startsWith('image/')) {
      setLocalErr('Please pick an image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalErr('Image must be under 10 MB.');
      return;
    }

    setProgress(0);
    try {
      const url = await uploadToCloudinary(file, setProgress);
      onChange(url);
    } catch (e) {
      setLocalErr(e.message || 'Upload failed — please try again.');
    } finally {
      setProgress(null);
      // Reset file input so the same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const isUploading   = progress !== null;
  const displayError  = error || localErr;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="input-label">
        Event banner image{' '}
        <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span>
      </label>

      {/* ── Preview (image already uploaded) ── */}
      {value && !isUploading ? (
        <div style={{ position: 'relative', borderRadius: 'var(--r2)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img
            src={value}
            alt="Event banner preview"
            style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
          />
          {/* Hover overlay */}
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0)', opacity: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.opacity = 1; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)';   e.currentTarget.style.opacity = 0; }}
          >
            <button
              onClick={() => inputRef.current?.click()}
              style={{ padding: '6px 14px', background: '#fff', color: '#111', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              Change
            </button>
            <button
              onClick={() => onChange(null)}
              style={{ padding: '6px 14px', background: 'var(--error,#dc2626)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              Remove
            </button>
          </div>
        </div>

      /* ── Upload in progress ── */
      ) : isUploading ? (
        <div style={{
          border: '2px dashed var(--border-2,#4b5563)',
          borderRadius: 'var(--r2)', padding: '32px 24px',
          textAlign: 'center', background: 'var(--surface)',
        }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>☁️</div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
            Uploading to Cloudinary… {progress}%
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'var(--accent,#2563eb)',
              borderRadius: 3, transition: 'width 0.2s',
            }} />
          </div>
        </div>

      /* ── Empty drop zone ── */
      ) : (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${displayError ? 'var(--error,#dc2626)' : 'var(--border-2,#4b5563)'}`,
            borderRadius: 'var(--r2)', padding: '32px 24px',
            textAlign: 'center', cursor: 'pointer',
            background: 'var(--surface)', transition: 'border-color 0.15s',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
            Click or drag & drop an image
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
            JPG, PNG or WebP · max 10 MB · stored on Cloudinary CDN
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />

      {displayError && (
        <div style={{ fontSize: 11, color: 'var(--error,#dc2626)' }}>{displayError}</div>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
        Uploaded images are stored on Cloudinary and served via global CDN.
        A default banner is shown if none is uploaded.
      </div>
    </div>
  );
}
