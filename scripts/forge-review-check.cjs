// Review-test fixture. Not imported anywhere.
// Intended behavior: return the numeric sum of a and b (a + b).
function sumNumbers(a, b) {
  return a + b;
}

// Intended behavior: return the numeric product of a and b (a * b).
function multiplyNumbers(a, b) {
  return a * b;
}

// Intended behavior: return the numeric difference of a and b (a - b).
function subtractNumbers(a, b) {
  return a - b;
}

module.exports = { sumNumbers, multiplyNumbers, subtractNumbers };
