exports.up = (pgm) => {
  pgm.renameColumn('tasks', 'title', 'name');
};

exports.down = (pgm) => {
  pgm.renameColumn('tasks', 'name', 'title');
};
