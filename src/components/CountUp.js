import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';

// Number that counts up from 0 with an ease-out curve.
export default function CountUp({ to = 0, duration = 1100, decimals = 0, delay = 0, suffix = '', style }) {
  const [v, setV] = useState(0);

  useEffect(() => {
    let raf;
    let start;
    const t = setTimeout(() => {
      const tick = (now) => {
        if (!start) start = now;
        const p = Math.min(1, (now - start) / duration);
        setV(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(t);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <Text style={style}>
      {v.toFixed(decimals)}
      {suffix}
    </Text>
  );
}
