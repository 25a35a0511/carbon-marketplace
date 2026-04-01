/**
 * Format a number as USD currency string.
 * @param {number} amount
 * @param {number} decimals
 */
export const formatCurrency = (amount, decimals = 2) => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/**
 * Format a number with thousand separators.
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format an ISO date string to a human-readable date.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

/**
 * Format date with time.
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/**
 * Truncate a string to maxLength, appending ellipsis.
 */
export const truncate = (str, maxLength = 100) => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
};

/**
 * Calculate environmental equivalents for N tons of CO₂.
 */
export const co2Equivalents = (tons) => ({
  trees:       Math.round(tons * 5),
  carMiles:    Math.round(tons * 2481),
  homeYears:   parseFloat((tons / 7.5).toFixed(1)),
  flightHours: parseFloat((tons / 0.255).toFixed(1)),
});

/**
 * Get gradient style for a project impact type.
 */
export const impactGradient = (impactType) => {
  const gradients = {
    'Forest Conservation':       'linear-gradient(135deg, #0d3320, #1a5c38)',
    'Renewable Energy':          'linear-gradient(135deg, #0d2a3a, #1a4a6a)',
    'Blue Carbon':               'linear-gradient(135deg, #0d1a3a, #1a3a6a)',
    'Clean Cooking':             'linear-gradient(135deg, #3a2a0a, #6a4a1a)',
    'Peatland Conservation':     'linear-gradient(135deg, #1a1a3a, #2a2a5a)',
    'Biodiversity Conservation': 'linear-gradient(135deg, #3a1a0a, #5a2a10)',
    'Soil Carbon':               'linear-gradient(135deg, #2a1a0a, #4a3010)',
    'Methane Capture':           'linear-gradient(135deg, #0a1a2a, #1a3050)',
  };
  return gradients[impactType] || 'linear-gradient(135deg, #1a4a2a, #0a2e1a)';
};
