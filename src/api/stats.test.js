const { averageTaskCount } = require('./stats');

describe('averageTaskCount', () => {
  it('returns the sum of tasks.length divided by lists.length', () => {
    const lists = [{ tasks: [1, 2, 3] }, { tasks: [1] }];
    expect(averageTaskCount(lists)).toBe(2);
  });

  it('returns 0 for an empty array instead of NaN', () => {
    expect(averageTaskCount([])).toBe(0);
  });

  it('throws when lists is not an array', () => {
    expect(() => averageTaskCount(undefined)).toThrow(TypeError);
  });

  it('throws when a list has no tasks array', () => {
    expect(() => averageTaskCount([{ tasks: [1] }, {}])).toThrow(TypeError);
    expect(() => averageTaskCount([null])).toThrow(TypeError);
  });
});
