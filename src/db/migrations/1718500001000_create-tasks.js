exports.up = (pgm) => {
  pgm.createTable('tasks', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'integer', notNull: true, references: '"users"' },
    title: { type: 'varchar(500)', notNull: true },
    completed: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('tasks', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('tasks');
};
