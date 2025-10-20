/**
 * Extracts date string from a URL pathname.
 * If a valid date is provided in the path (format: /path/YYYY-MM-DD),
 * returns that date. Otherwise, returns today's date.
 * @param {string} fullPath - The full URL pathname
 * @returns {Promise<string>} ISO date string (YYYY-MM-DD)
 */
export async function getDateString(fullPath) {
  let date = new Date();
  const pathTokens = fullPath.split("/");
  if (pathTokens.length > 2) {
    const dateCandidate = new Date(pathTokens[2]);
    if (await isValidDate(dateCandidate)) {
      date = dateCandidate;
    }
  }
  return date.toISOString().substring(0, 10);
}

/**
 * Validates if a given value is a valid Date object.
 * @param {*} d - The value to validate
 * @returns {Promise<boolean>} True if valid Date, false otherwise
 */
export async function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}
