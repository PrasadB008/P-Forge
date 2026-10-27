function averageTaskCount(lists) {
  const total = lists.reduce((sum, list) => sum + list.tasks.length, 0);
  return total / lists.length;
}

module.exports = { averageTaskCount };
