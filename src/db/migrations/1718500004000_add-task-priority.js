exports.up = (pgm) => {
  pgm.addColumn('tasks', {
    priority: {
      type: 'text',
      notNull: true,
      default: 'medium',
      check: "priority IN ('low', 'medium', 'high')",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('tasks', 'priority');
};
