exports.up = (pgm) => {
  pgm.addColumn('tasks', {
    due_date: { type: 'timestamp', notNull: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('tasks', 'due_date');
};
