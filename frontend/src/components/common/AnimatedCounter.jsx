import React, { useEffect, useState } from 'react';

export default function AnimatedCounter({ value = 0, duration = 800, decimals = 0, prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = displayValue;
    const targetValue = Number(value) || 0;

    // If values are equal, no need to animate
    if (Math.abs(targetValue - startValue) < 0.001) {
      setDisplayValue(targetValue);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (targetValue - startValue) * ease;

      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value, duration]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <span>
      {prefix}{formatted}{suffix}
    </span>
  );
}
