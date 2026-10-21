const caseStatuses = ['OPEN', 'INVESTIGATING', 'PENDING_REVIEW', 'CLOSED', 'ARCHIVED'];
const casePriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const normalizeEnum = (value, values) => Number.isInteger(value) ? values[value] || 'UNKNOWN' : value;

export const normalizeCase = item => ({
  ...item,
  status: normalizeEnum(item.status, caseStatuses),
  priority: normalizeEnum(item.priority, casePriorities),
});

export const normalizeCases = items => Array.isArray(items) ? items.map(normalizeCase) : [];
