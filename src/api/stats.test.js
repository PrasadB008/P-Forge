const { averageTaskCount } = require('./stats');

describe('averageTaskCount', () => {
  it('averages the task counts across lists', () => {
    expect(averageTaskCount([{ tasks: [1, 2, 3] }, { tasks: [1] }])).toBe(2);
  });

  it('returns 0 for an empty array of lists', () => {
    expect(averageTaskCount([])).toBe(0);
  });
});
