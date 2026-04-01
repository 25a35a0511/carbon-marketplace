/**
 * currency.js — single source of truth for price formatting
 *
 * To switch currency: change SYMBOL and LOCALE below.
 *
 * Examples:
 *   Rupees  → SYMBOL = '₹', LOCALE = 'en-IN'
 *   Dollars → SYMBOL = '$', LOCALE = 'en-US'
 *   Euros   → SYMBOL = '€', LOCALE = 'de-DE'
 */

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_LOCALE  = 'en-IN';

/**
 * fmt(1234.5)  → "₹1,234.50"
 * fmt(0)       → "₹0.00"
 */
export const fmt = (n) =>
  `${CURRENCY_SYMBOL}${Number(n || 0).toLocaleString(CURRENCY_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * fmtCompact(1234.5) → "₹1,235"   (no decimals — for dashboards / stat cards)
 */
export const fmtCompact = (n) =>
  `${CURRENCY_SYMBOL}${Number(n || 0).toLocaleString(CURRENCY_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

/**
 * fmtN(1234567) → "12,34,567"   (Indian-format number, no symbol)
 */
export const fmtN = (n) =>
  Number(n || 0).toLocaleString(CURRENCY_LOCALE);