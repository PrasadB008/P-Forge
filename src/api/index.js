const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const MAX_NAME_LENGTH = 100;

app.use(express.json());

// Returns the id as a positive integer, or null if the param is not one.
function parseId(raw) {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// GET /tasks — list all tasks
app.get('/tasks', async (_req, res) => {
  const { rows } = await db.query('SELECT * FROM tasks ORDER BY created_at ASC');
  res.json(rows);
});

// POST /tasks — create a task
app.post('/tasks', async (req, res) => {
  const { name } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    return res.status(400).json({ error: `name must be ${MAX_NAME_LENGTH} characters or less` });
  }
  const { rows } = await db.query(
    'INSERT INTO tasks (name) VALUES ($1) RETURNING *',
    [name.trim()]
  );
  res.status(201).json(rows[0]);
});

// PATCH /tasks/:id — update a task (complete/uncomplete or rename)
app.patch('/tasks/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'invalid id' });

  const { completed, name } = req.body || {};

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'completed must be a boolean' });
  }
  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (name.trim().length > MAX_NAME_LENGTH) {
      return res.status(400).json({ error: `name must be ${MAX_NAME_LENGTH} characters or less` });
    }
  }

  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  const current = rows[0];
  const newCompleted = completed !== undefined ? completed : current.completed;
  const newName = name !== undefined ? name.trim() : current.name;

  const { rows: updated } = await db.query(
    'UPDATE tasks SET completed = $1, name = $2 WHERE id = $3 RETURNING *',
    [newCompleted, newName, id]
  );
  res.json(updated[0]);
});

// DELETE /tasks/:id — delete a task
app.delete('/tasks/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'invalid id' });

  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  await db.query('DELETE FROM tasks WHERE id = $1', [id]);
  res.status(204).send();
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API listening on port ${PORT}`);
  });
}

module.exports = app;
