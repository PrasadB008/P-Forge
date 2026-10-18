const test = require('node:test');
const assert = require('node:assert');
const { sum } = require('./sum.cjs');

test('sum(2, 3) === 5', () => {
  assert.strictEqual(sum(2, 3), 5);
});
