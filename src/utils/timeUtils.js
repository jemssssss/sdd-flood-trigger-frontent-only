/**
 * Returns the latest available forecast hour in local time.
 *
 * Example:
 * 2026-07-02T16:37:25
 * -> 2026-07-02T15:00:00
 *
 * Uses the previous hour because weather products are often
 * published a short time after the top of the hour.
 */
export function getLatestForecastTime() {
  const now = new Date();

  // Round down
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:00:00`;
}

export function getLatestTimeDate() {
  const now = new Date();

  // Round down
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:00:00`;
}