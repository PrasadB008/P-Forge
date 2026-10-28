// Percentage of work done, clamped to 0-100.
// Returns 0 when the inputs are not usable (e.g. an empty list has total 0),
// so the result is always a finite number that survives JSON.stringify.
function percentDone(done, total) {
  if (typeof done !== 'number' || typeof total !== 'number') return 0;
  if (!Number.isFinite(done) || !Number.isFinite(total) || total <= 0) return 0;
  const percent = (done / total) * 100;
  return Math.min(100, Math.max(0, percent));
}

module.exports = { percentDone };
