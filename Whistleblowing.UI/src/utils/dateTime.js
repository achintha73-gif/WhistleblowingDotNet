export const APP_TIME_ZONE = 'Asia/Colombo';

export const parseUtcDate = value => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value).replace(/\.(\d{3})\d+(?=(?:Z|[+-]\d{2}:?\d{2})?$)/i, '.$1');
  const hasExplicitZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  const date = new Date(hasExplicitZone ? raw : `${raw}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatColomboDate = (value, options = {}) => {
  const date = parseUtcDate(value);
  return date ? date.toLocaleDateString('en-US', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }) : '—';
};

export const formatColomboDateTime = (value, options = {}) => {
  const date = parseUtcDate(value);
  return date ? date.toLocaleString('en-US', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }) : '—';
};

export const getColomboGreeting = (value = new Date()) => {
  const hour = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIME_ZONE,
    hour: 'numeric',
    hourCycle: 'h23',
  }).format(value));
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};
