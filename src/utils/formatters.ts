export const formatDots = (num: number | string): string => {
  const n = Math.max(0, Math.round(Number(num) || 0));
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseDots = (str: string): number => {
  const digits = String(str || '').replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

export const formatIDR = (num: number): string => {
  const val = Math.round(num);
  return (val < 0 ? '-Rp ' : 'Rp ') + formatDots(Math.abs(val));
};

export const getOrdinalDay = (day: number | string): string => {
  const d = Math.max(1, Math.min(31, Math.round(Number(day) || 25)));
  const j = d % 10;
  const k = d % 100;
  if (j === 1 && k !== 11) return `${d}st`;
  if (j === 2 && k !== 12) return `${d}nd`;
  if (j === 3 && k !== 13) return `${d}rd`;
  return `${d}th`;
};

export const formatShortAxis = (num: number): string => {
  if (num <= 0) return '0';
  if (num >= 1e9) {
    const b = num / 1e9;
    return (Number.isInteger(b) ? b.toFixed(0) : b.toFixed(1).replace(/\.0$/, '')) + 'B';
  }
  if (num >= 1e6) {
    const m = num / 1e6;
    return (Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1).replace(/\.0$/, '')) + 'M';
  }
  if (num >= 1e3) {
    return Math.round(num / 1e3) + 'K';
  }
  return String(Math.round(num));
};
