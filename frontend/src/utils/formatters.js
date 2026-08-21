/**
 * Map raw API factor names to human-readable display labels.
 */
const FACTOR_NAME_MAP = {
  amount: 'Transaction Amount',
  amount_ratio: 'Amount Ratio',
  age: 'Customer Age',
  city_pop: 'City Population',
  customer_txn_count: 'Transaction Count',
  customer_avg_amount: 'Avg. Transaction Amount',
  time_since_last_txn: 'Time Since Last Transaction',
  distance_km: 'Distance (km)',
  has_customer_history: 'Customer History',
  transaction_hour: 'Transaction Hour',
  day_of_week: 'Day of Week',
  gender: 'Gender',

  // Category factors
  category_entertainment: 'Entertainment',
  category_food_dining: 'Food & Dining',
  category_gas_transport: 'Gas Transport',
  category_grocery_net: 'Grocery Network',
  category_grocery_pos: 'Grocery POS',
  category_health_fitness: 'Health & Fitness',
  category_home: 'Home',
  category_kids_pets: 'Kids & Pets',
  category_misc_net: 'Miscellaneous Online',
  category_misc_pos: 'Miscellaneous POS',
  category_personal_care: 'Personal Care',
  category_shopping_net: 'Online Shopping',
  category_shopping_pos: 'Shopping POS',
  category_travel: 'Travel',
};

/**
 * Converts a raw API factor name to a display-friendly label.
 * Falls back to a title-cased, underscore-replaced version.
 * @param {string} name
 * @returns {string}
 */
export const formatFactorName = (name) => {
  if (!name) return '';
  if (FACTOR_NAME_MAP[name]) return FACTOR_NAME_MAP[name];

  // Fallback: replace underscores with spaces and title-case
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Returns styling classes based on risk level.
 * @param {string} riskLevel - 'LOW' | 'MEDIUM' | 'HIGH'
 */
export const getRiskStyling = (riskLevel) => {
  switch ((riskLevel || '').toUpperCase()) {
    case 'LOW':
      return {
        badge: 'risk-badge-low',
        accent: 'text-emerald-400',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        meter: '#10b981',
        glow: 'shadow-emerald-500/20',
      };
    case 'MEDIUM':
      return {
        badge: 'risk-badge-medium',
        accent: 'text-amber-400',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        meter: '#f59e0b',
        glow: 'shadow-amber-500/20',
      };
    case 'HIGH':
      return {
        badge: 'risk-badge-high',
        accent: 'text-red-400',
        border: 'border-red-500/30',
        bg: 'bg-red-500/10',
        meter: '#ef4444',
        glow: 'shadow-red-500/20',
      };
    default:
      return {
        badge: 'risk-badge-unknown',
        accent: 'text-slate-400',
        border: 'border-slate-500/30',
        bg: 'bg-slate-500/10',
        meter: '#64748b',
        glow: 'shadow-slate-500/20',
      };
  }
};

/**
 * Format a number to 2 decimal places.
 */
export const fmt2 = (val) =>
  val !== undefined && val !== null ? Number(val).toFixed(2) : '—';

/**
 * Format a percentage value.
 */
export const fmtPct = (val) =>
  val !== undefined && val !== null ? `${Number(val).toFixed(2)}%` : '—';
