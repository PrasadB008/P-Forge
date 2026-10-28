// Average number of tasks per list. Returns 0 for an empty (or non-array) input
// and counts a list without a `tasks` array as having 0 tasks.
function averageTaskCount(lists) {
  if (!Array.isArray(lists) || lists.length === 0) return 0;
  const total = lists.reduce(
    (sum, list) => sum + (Array.isArray(list && list.tasks) ? list.tasks.length : 0),
    0
  );
  return total / lists.length;
}

module.exports = { averageTaskCount };
