const { percentDone } = require('./progress');

describe('percentDone', () => {
  it('returns 0 when total is 0', () => {
    expect(percentDone(0, 0)).toBe(0);
    expect(percentDone(3, 0)).toBe(0);
  });

  it('returns 0 for a negative or non-finite total', () => {
    expect(percentDone(1, -5)).toBe(0);
    expect(percentDone(1, Infinity)).toBe(0);
    expect(percentDone(1, NaN)).toBe(0);
  });

  it('returns 0 for non-number arguments', () => {
    expect(percentDone('1', 2)).toBe(0);
    expect(percentDone(1, undefined)).toBe(0);
    expect(percentDone(NaN, 2)).toBe(0);
  });

  it('returns the percentage for partial progress', () => {
    expect(percentDone(1, 4)).toBe(25);
    expect(percentDone(0, 10)).toBe(0);
  });

  it('returns 100 when everything is done', () => {
    expect(percentDone(5, 5)).toBe(100);
  });

  it('clamps the result to 0-100', () => {
    expect(percentDone(8, 4)).toBe(100);
    expect(percentDone(-1, 4)).toBe(0);
  });
});
