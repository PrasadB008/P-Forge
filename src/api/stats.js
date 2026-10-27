// Average number of tasks per list. Returns 0 for a missing or empty `lists`;
// a list without a `tasks` array counts as having no tasks.
function averageTaskCount(lists) {
  if (!Array.isArray(lists) || lists.length === 0) return 0;
  const total = lists.reduce(
    (sum, list) => sum + (Array.isArray(list && list.tasks) ? list.tasks.length : 0),
    0
  );
  return total / lists.length;
}

module.exports = { averageTaskCount };
