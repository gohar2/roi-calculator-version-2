// Utility functions for depreciation schedules

// MACRS 5-Year (percentages for each year, 6 years due to half-year convention)
const MACRS_5_YEAR = [0.20, 0.32, 0.192, 0.1152, 0.1152, 0.0576];
// MACRS 7-Year (percentages for each year, 8 years due to half-year convention)
const MACRS_7_YEAR = [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446];

/**
 * Returns an array of depreciation values for each year.
 * @param {number} investment - Initial investment amount
 * @param {number} assetClass - 3 for 5-year, 4 for 7-year
 * @param {string} method - 'macrs' or 'straight-line'
 * @param {number} years - Number of years to return (length of benefits array)
 * @returns {number[]} Array of depreciation values per year
 */
export function getDepreciationSchedule(investment, assetClass, method, years) {
  let schedule = [];
  // Normalize assetClass to handle new codes and direct life values
  let normalizedClass = assetClass;
  if (assetClass === 48 || assetClass === 7) normalizedClass = 4; // 7-year
  else if (assetClass === 57.0 || assetClass === 5) normalizedClass = 3; // 5-year
  // If assetClass is not 3 or 4, treat as straight-line with assetClass as life
  if (method === 'macrs') {
    if (normalizedClass === 3) {
      // 5-year MACRS
      schedule = MACRS_5_YEAR.map(p => investment * p);
    } else if (normalizedClass === 4) {
      // 7-year MACRS
      schedule = MACRS_7_YEAR.map(p => investment * p);
    }
  } else if (method === 'straight-line') {
    let life = 0;
    if (normalizedClass === 3) life = 5;
    else if (normalizedClass === 4) life = 7;
    else if (assetClass === 48 || assetClass === 7) life = 7;
    else if (assetClass === 57.0 || assetClass === 5) life = 5;
    else if (typeof assetClass === 'number' && assetClass > 0) life = assetClass;
    if (life > 0) {
      const annual = investment / life;
      schedule = Array(life).fill(annual);
    }
  }
  // Pad or trim to match requested years
  if (schedule.length < years) {
    schedule = [...schedule, ...Array(years - schedule.length).fill(0)];
  } else if (schedule.length > years) {
    schedule = schedule.slice(0, years);
  }
  return schedule;
} 