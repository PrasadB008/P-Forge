const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./db');
const authMiddleware = require('./middleware');
const { generateToken } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ============ AUTH ENDPOINTS (NO AUTHENTICATION REQUIRED) ============

// POST /auth/register — register a new user
app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'email is required' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }

  try {
    // Check if user already exists
    const { rows: existing } = await db.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { rows } = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email.trim().toLowerCase(), passwordHash]
    );

    const user = rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login — login user
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'email is required' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'password is required' });
  }

  try {
    // Find user
    const { rows } = await db.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============ TASK ENDPOINTS (AUTHENTICATION REQUIRED) ============

// GET /tasks — list all tasks for the authenticated user
app.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, title, completed, created_at FROM tasks WHERE user_id = $1 ORDER BY created_at ASC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /tasks — create a task for the authenticated user
app.post('/tasks', authMiddleware, async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO tasks (user_id, title) VALUES ($1, $2) RETURNING id, title, completed, created_at',
      [req.userId, title.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /tasks/:id — update a task (must belong to authenticated user)
app.patch('/tasks/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { completed, title } = req.body;

  try {
    // Check if task exists and belongs to user
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    const current = rows[0];
    const newCompleted = completed !== undefined ? Boolean(completed) : current.completed;
    const newTitle = title !== undefined ? title.trim() : current.title;

    const { rows: updated } = await db.query(
      'UPDATE tasks SET completed = $1, title = $2 WHERE id = $3 AND user_id = $4 RETURNING id, title, completed, created_at',
      [newCompleted, newTitle, id, req.userId]
    );
    res.json(updated[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /tasks/:id — delete a task (must belong to authenticated user)
app.delete('/tasks/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    // Check if task exists and belongs to user
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
