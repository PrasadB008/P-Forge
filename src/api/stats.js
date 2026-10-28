function averageTaskCount(lists) {
  if (lists.length === 0) return 0;
  const total = lists.reduce((sum, list) => sum + list.tasks.length, 0);
  return total / lists.length;
}

module.exports = { averageTaskCount };
