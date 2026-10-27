const { averageTaskCount } = require('./stats');

describe('averageTaskCount', () => {
  it('returns the sum of tasks divided by the number of lists', () => {
    const lists = [{ tasks: [1, 2, 3] }, { tasks: [1] }];
    expect(averageTaskCount(lists)).toBe(2);
  });

  it('returns 0 for an empty array', () => {
    expect(averageTaskCount([])).toBe(0);
  });

  it('returns 0 when lists is not an array', () => {
    expect(averageTaskCount(undefined)).toBe(0);
    expect(averageTaskCount(null)).toBe(0);
  });

  it('counts lists without a tasks array as having 0 tasks', () => {
    const lists = [{ tasks: [1, 2] }, {}, { tasks: null }, null];
    expect(averageTaskCount(lists)).toBe(0.5);
  });
});
