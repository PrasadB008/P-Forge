// Percentage of work done, clamped to 0-100. An empty total (0, NaN, undefined) gives 0.
function percentDone(done, total) {
  if (!total) return 0;
  const percent = (done / total) * 100;
  if (!Number.isFinite(percent)) return 0;
  return Math.min(100, Math.max(0, percent));
}

module.exports = { percentDone };
