// Percentage (0-100) of `done` out of `total`.
// Returns 0 when either argument is not a finite number or `total` is not positive
// (e.g. an empty task list), and clamps the result to the range 0-100.
function percentDone(done, total) {
  if (!Number.isFinite(done) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, (done / total) * 100));
}

module.exports = { percentDone };
