/**
 * components/shared/ImageSlider.jsx
 * A self-contained auto-playing image carousel with prev/next controls
 * and dot indicators. No external dependencies — pure React + inline styles.
 *
 * Usage:
 *   import { ImageSlider } from '../components/shared/ImageSlider';
 *
 *   const SLIDES = [
 *     { url: 'https://...', caption: 'Mumbai Tech Summit' },
 *     { url: 'https://...', caption: 'Jazz Night Live'    },
 *   ];
 *
 *   <ImageSlider slides={SLIDES} />
 *
 * Props:
 *   slides        — array of { url: string, caption?: string }
 *   interval      — ms between auto-advances (default 4000)
 *   height        — slider height in px (default 380)
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export function ImageSlider({ slides = [], interval = 4000, height = 380 }) {
  const [current,   setCurrent]   = useState(0);
  const [animDir,   setAnimDir]   = useState('next'); // 'next' | 'prev'
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((idx, dir = 'next') => {
    if (animating || idx === current) return;
    setAnimDir(dir);
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 450);
  }, [animating, current]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, 'next');
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, 'prev');
  }, [current, slides.length, goTo]);

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [next, interval, slides.length]);

  // Pause on hover
  const pause  = () => clearInterval(timerRef.current);
  const resume = () => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(next, interval);
  };

  if (!slides.length) return null;

  return (
    <div
      onMouseEnter={pause}
      onMouseLeave={resume}
      style={{
        position:     'relative',
        width:        '100%',
        height:       height,
        borderRadius: 'var(--r3)',
        overflow:     'hidden',
        background:   'var(--surface)',
        userSelect:   'none',
      }}
    >
      {/* Slides */}
      {slides.map((slide, i) => {
        const isActive = i === current;
        let translateX = '100%';
        if (isActive) translateX = '0%';
        else if (
          (animDir === 'next' && i === (current - 1 + slides.length) % slides.length) ||
          (animDir === 'prev' && i === (current + 1) % slides.length)
        ) {
          translateX = animDir === 'next' ? '-100%' : '100%';
        }

        return (
          <div
            key={i}
            style={{
              position:   'absolute',
              inset:      0,
              transform:  `translateX(${translateX})`,
              transition: animating ? 'transform 0.45s cubic-bezier(0.4,0,0.2,1)' : 'none',
              willChange: 'transform',
            }}
          >
            <img
              src={slide.url}
              alt={slide.caption || `Slide ${i + 1}`}
              style={{
                width:      '100%',
                height:     '100%',
                objectFit:  'cover',
                display:    'block',
              }}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            {/* Gradient overlay */}
            <div style={{
              position:   'absolute',
              inset:      0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
            }} />
            {/* Caption */}
            {slide.caption && (
              <div style={{
                position:   'absolute',
                bottom:     0,
                left:       0,
                right:      0,
                padding:    '20px 24px',
                color:      '#fff',
                fontSize:   15,
                fontWeight: 500,
                letterSpacing: '-0.2px',
                lineHeight: 1.4,
              }}>
                {slide.caption}
                {slide.sub && (
                  <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.7, marginTop: 3 }}>
                    {slide.sub}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Prev / Next buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            style={btnStyle('left')}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
          >‹</button>
          <button
            onClick={next}
            aria-label="Next slide"
            style={btnStyle('right')}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
          >›</button>
        </>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div style={{
          position:       'absolute',
          bottom:         14,
          right:          20,
          display:        'flex',
          gap:            6,
          alignItems:     'center',
        }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 'next' : 'prev')}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width:        i === current ? 20 : 6,
                height:       6,
                borderRadius: 3,
                border:       'none',
                padding:      0,
                cursor:       'pointer',
                background:   i === current ? 'var(--accent)' : 'rgba(255,255,255,0.35)',
                transition:   'width 0.3s ease, background 0.3s ease',
                flexShrink:   0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function btnStyle(side) {
  return {
    position:       'absolute',
    top:            '50%',
    [side]:         14,
    transform:      'translateY(-50%)',
    width:          38,
    height:         38,
    borderRadius:   '50%',
    border:         'none',
    background:     'rgba(0,0,0,0.35)',
    color:          '#fff',
    fontSize:       22,
    lineHeight:     1,
    cursor:         'pointer',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    transition:     'background 0.15s ease',
    zIndex:         2,
  };
}
