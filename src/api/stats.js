function averageTaskCount(lists) {
  if (!Array.isArray(lists)) {
    throw new TypeError('lists must be an array');
  }
  if (lists.length === 0) return 0;

  const total = lists.reduce((sum, list) => {
    if (!list || !Array.isArray(list.tasks)) {
      throw new TypeError('each list must have a tasks array');
    }
    return sum + list.tasks.length;
  }, 0);
  return total / lists.length;
}

module.exports = { averageTaskCount };
