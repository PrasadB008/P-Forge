const test = require('node:test');

test('slow test waits 120000ms then passes', { timeout: 150000 }, async () => {
  await new Promise((resolve) => setTimeout(resolve, 120000));
});
