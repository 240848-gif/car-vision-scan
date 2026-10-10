export const colors = {
  bg: '#05070D',
  surface: '#0D1220',
  surface2: '#141B2E',
  border: '#1E2842',
  text: '#F2F5FF',
  muted: '#7E89A8',
  accent: '#00E5FF',
  accent2: '#7C4DFF',
  good: '#2BFF9A',
  warn: '#FFB020',
  bad: '#FF4D6D',
};

export const radius = { sm: 10, md: 16, lg: 24, xl: 32 };

export const glow = (color = colors.accent, r = 18) => ({
  shadowColor: color,
  shadowOpacity: 0.7,
  shadowRadius: r,
  shadowOffset: { width: 0, height: 0 },
  elevation: 10,
});

// map common color names to swatch hex values
export const swatch = (name = '') => {
  const n = name.toLowerCase();
  const map = {
    white: '#F5F5F5', black: '#111111', silver: '#C0C4CC', gray: '#7A7F8A', grey: '#7A7F8A',
    red: '#E53935', blue: '#1E63E9', green: '#2E9E5B', yellow: '#F5C518', orange: '#FB8C00',
    brown: '#7B4A2B', beige: '#D8C8A8', gold: '#C9A227', purple: '#7B3FE4', pink: '#F06292',
    maroon: '#7A1F2B', navy: '#14213D', teal: '#14A3A3', bronze: '#A9713A',
  };
  const key = Object.keys(map).find((k) => n.includes(k));
  return key ? map[key] : '#8892A6';
};
