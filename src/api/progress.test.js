const { percentDone } = require('./progress');

describe('percentDone', () => {
  it('returns the percentage of done over total', () => {
    expect(percentDone(1, 4)).toBe(25);
    expect(percentDone(3, 3)).toBe(100);
    expect(percentDone(0, 5)).toBe(0);
  });

  it('returns 0 when total is 0', () => {
    expect(percentDone(0, 0)).toBe(0);
    expect(percentDone(3, 0)).toBe(0);
  });

  it('clamps the result to 0-100', () => {
    expect(percentDone(6, 4)).toBe(100);
    expect(percentDone(-1, 4)).toBe(0);
  });
});
