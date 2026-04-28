import { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// useCountUp — animates a number from 0 (or previous value) to `end`
// Uses requestAnimationFrame + ease-out cubic for smooth, premium feel
// ─────────────────────────────────────────────────────────────────────────────

export function useCountUp(end, duration = 1000) {
  const [count, setCount]  = useState(0);
  const rafRef  = useRef(null);
  const prevRef = useRef(0);

  useEffect(() => {
    // Only animate real numbers
    if (end == null || isNaN(Number(end))) return;

    const target    = Number(end);
    const startVal  = prevRef.current;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current  = Math.round(startVal + (target - startVal) * ease);

      setCount(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, duration]);

  return count;
}
