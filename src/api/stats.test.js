const { averageTaskCount } = require('./stats');

describe('averageTaskCount', () => {
  it('averages the task counts across lists', () => {
    expect(averageTaskCount([{ tasks: [1, 2, 3] }, { tasks: [1] }])).toBe(2);
  });

  it('returns 0 for an empty list of lists (not NaN)', () => {
    expect(averageTaskCount([])).toBe(0);
  });

  it('returns 0 when lists is not an array', () => {
    expect(averageTaskCount(undefined)).toBe(0);
    expect(averageTaskCount(null)).toBe(0);
  });

  it('counts lists without a tasks array as having 0 tasks', () => {
    expect(averageTaskCount([{ tasks: [1, 2] }, {}, null])).toBeCloseTo(2 / 3);
  });
});
