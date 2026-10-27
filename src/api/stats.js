function averageTaskCount(lists) {
  if (!Array.isArray(lists) || lists.length === 0) {
    return 0;
  }
  const total = lists.reduce(
    (sum, list) => sum + (Array.isArray(list && list.tasks) ? list.tasks.length : 0),
    0
  );
  return total / lists.length;
}

module.exports = { averageTaskCount };
