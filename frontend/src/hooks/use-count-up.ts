import { useEffect, useState } from 'react';

export function useCountUp(target: number | null, duration = 700) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === null) return;
    let start: number | null = null;
    let frame: number;

    const safeTarget = target;
function step(timestamp: number) {
  if (start === null) start = timestamp;
  const progress = Math.min((timestamp - start) / duration, 1);
  setValue(Math.round(progress * safeTarget));
  if (progress < 1) frame = requestAnimationFrame(step);
}

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}