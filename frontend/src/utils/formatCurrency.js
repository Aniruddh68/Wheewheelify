/**
 * formatIndianPrice
 * -----------------
 * Accepts a raw price string (e.g. "140.00 Lakh", "140", "80 - 120 Lakh",
 * "TBA", "Contact for Details") or a plain numeric Lakh value and returns a
 * correctly formatted Indian price string:
 *   < 100 Lakh  →  "₹X.XX Lakh"
 *   >= 100 Lakh →  "₹X.XX Cr"
 *
 * Handles price ranges separated by " - " and formats each side independently.
 *
 * @param {string|number} priceInput - Raw price value from CSV or computed price.
 * @returns {string} - Formatted price string.
 */
export function formatIndianPrice(priceInput) {
  if (priceInput === null || priceInput === undefined) return 'TBA';

  const str = String(priceInput).trim();

  // Pass-through for special strings
  if (!str || str === '—' || str === '-') return 'TBA';
  const lower = str.toLowerCase();
  if (
    lower === 'tba' ||
    lower.includes('contact') ||
    lower.includes('on request')
  ) {
    return str;
  }

  // Handle ranges: "80 Lakh - 120 Lakh" or "80 - 120"
  // Split on the separator " - " (with spaces) to avoid confusion with negative numbers
  const rangeSep = str.includes(' - ') ? ' - ' : (str.includes('-') && !str.match(/^\d+(\.\d+)?$/) ? '-' : null);
  if (rangeSep) {
    const parts = str.split(rangeSep);
    if (parts.length === 2) {
      const formatted = parts.map((p) => _formatSingle(p.trim()));
      // Only emit as range if both sides parsed correctly
      if (formatted[0] !== 'TBA' && formatted[1] !== 'TBA') {
        return `${formatted[0]} – ${formatted[1]}`;
      }
    }
  }

  return _formatSingle(str);
}

/**
 * Formats a single (non-range) price token.
 * @param {string} token
 * @returns {string}
 */
function _formatSingle(token) {
  // Extract the first numeric float from the string
  const match = token.match(/[\d,]+\.?\d*/);
  if (!match) return 'TBA';

  let numeric = parseFloat(match[0].replace(/,/g, ''));
  if (isNaN(numeric) || numeric <= 0) return 'TBA';

  // Normalize if value is in absolute Rupees (> 1000)
  if (numeric > 1000) {
    numeric = +(numeric / 100000).toFixed(2);
  }

  return _convertLakh(numeric);
}

/**
 * Converts a numeric Lakh value to the correct display format.
 * @param {number} lakhValue
 * @returns {string}
 */
function _convertLakh(lakhValue) {
  if (lakhValue >= 100) {
    const crore = lakhValue / 100;
    return `₹${crore.toFixed(2)} Cr`;
  }
  return `₹${lakhValue.toFixed(2)} Lakh`;
}

/**
 * Converts a raw numeric price (in Lakhs) to a formatted display string.
 * Convenience wrapper for use directly with numeric values from the data layer.
 *
 * @param {number} lakhValue
 * @returns {string}
 */
export function formatLakhPrice(lakhValue) {
  if (!lakhValue || isNaN(lakhValue) || lakhValue <= 0) return 'TBA';
  
  let val = lakhValue;
  if (val > 1000) {
    val = +(val / 100000).toFixed(2);
  }
  
  return _convertLakh(val);
}

/**
 * Builds a formatted price label for a vehicle group given its min and max prices (both in Lakhs).
 *
 * @param {number} minPrice - Min price in Lakhs.
 * @param {number} maxPrice - Max price in Lakhs.
 * @returns {string}
 */
export function formatPriceRange(minPrice, maxPrice) {
  if (!minPrice || minPrice <= 0) return 'TBA';
  const minFmt = _convertLakh(minPrice);
  if (!maxPrice || maxPrice <= 0 || minPrice === maxPrice) return minFmt;
  const maxFmt = _convertLakh(maxPrice);
  return `${minFmt} – ${maxFmt}`;
}
