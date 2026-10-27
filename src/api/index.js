const express = require('express');
const db = require('./db');
const { averageTaskCount } = require('./stats');

const app = express();
const PORT = process.env.PORT || 3001;

const PRIORITIES = ['low', 'medium', 'high'];
const isValidPriority = (value) => typeof value === 'string' && PRIORITIES.includes(value);

// Returns an error message when the task name is invalid, otherwise null.
const validateName = (name) => {
  if (!name || typeof name !== 'string' || !name.trim()) return 'name is required';
  if (name.trim().length > 200) return 'name must be 200 characters or less';
  return null;
};

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// GET /stats/average-task-count — average number of tasks per priority list.
// The tasks table has no lists, so each priority (low, medium, high) is treated as one list.
app.get('/stats/average-task-count', async (_req, res) => {
  const { rows } = await db.query(
    'SELECT priority, COUNT(*)::int AS count FROM tasks GROUP BY priority'
  );
  const lists = PRIORITIES.map((priority) => {
    const row = rows.find((r) => r.priority === priority);
    return { priority, tasks: new Array(row ? Number(row.count) : 0) };
  });
  res.json({ averageTaskCount: averageTaskCount(lists) });
});

// GET /tasks — list all tasks, optionally filtered by ?priority=low|medium|high
app.get('/tasks', async (req, res) => {
  const { priority } = req.query;
  if (priority !== undefined) {
    if (!isValidPriority(priority)) {
      return res.status(400).json({ error: 'invalid priority' });
    }
    const { rows } = await db.query(
      'SELECT * FROM tasks WHERE priority = $1 ORDER BY created_at ASC',
      [priority]
    );
    return res.json(rows);
  }
  const { rows } = await db.query('SELECT * FROM tasks ORDER BY created_at ASC');
  res.json(rows);
});

// POST /tasks — create a task
app.post('/tasks', async (req, res) => {
  const { name, priority } = req.body || {};
  const nameError = validateName(name);
  if (nameError) return res.status(400).json({ error: nameError });
  if (priority !== undefined && !isValidPriority(priority)) {
    return res.status(400).json({ error: 'invalid priority' });
  }
  const { rows } = await db.query(
    'INSERT INTO tasks (name, priority) VALUES ($1, $2) RETURNING *',
    [name.trim(), priority === undefined ? 'medium' : priority]
  );
  res.status(201).json(rows[0]);
});

// PATCH /tasks/:id — update a task (complete/uncomplete, rename or change priority)
app.patch('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });
  const { completed, name, priority } = req.body || {};

  if (priority !== undefined && !isValidPriority(priority)) {
    return res.status(400).json({ error: 'invalid priority' });
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'completed must be a boolean' });
  }
  if (name !== undefined) {
    const nameError = validateName(name);
    if (nameError) return res.status(400).json({ error: nameError });
  }

  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  const current = rows[0];
  const newCompleted = completed !== undefined ? completed : current.completed;
  const newName = name !== undefined ? name.trim() : current.name;
  const newPriority = priority !== undefined ? priority : current.priority;

  const { rows: updated } = await db.query(
    'UPDATE tasks SET completed = $1, name = $2, priority = $3 WHERE id = $4 RETURNING *',
    [newCompleted, newName, newPriority, id]
  );
  res.json(updated[0]);
});

// DELETE /tasks/:id — delete a task
app.delete('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });
  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  await db.query('DELETE FROM tasks WHERE id = $1', [id]);
  res.status(204).send();
});

// Only listen when run directly (e.g. `node index.js`), so tests can import the app.
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API listening on port ${PORT}`);
  });
}

module.exports = app;
