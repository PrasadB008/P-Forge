const request = require('supertest');
const db = require('./db');
const app = require('./index');

// Mock the db module (no real database or pool is created)
jest.mock('./db');

const task = (overrides = {}) => ({
  id: 1,
  name: 'Task 1',
  completed: false,
  created_at: '2024-01-01T00:00:00Z',
  priority: 'medium',
  ...overrides,
});

beforeEach(() => {
  jest.resetAllMocks();
});

describe('GET /health', () => {
  it('returns ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('GET /stats/average-task-count', () => {
  it('averages tasks across the low, medium and high priority lists', async () => {
    db.query.mockResolvedValue({
      rows: [
        task({ id: 1, priority: 'low' }),
        task({ id: 2, priority: 'high' }),
        task({ id: 3, priority: 'high' }),
        task({ id: 4, priority: 'high' }),
        task({ id: 5, priority: 'high' }),
      ],
    });

    const response = await request(app).get('/stats/average-task-count');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ averageTaskCount: 5 / 3 });
  });

  it('returns 0 when there are no tasks', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const response = await request(app).get('/stats/average-task-count');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ averageTaskCount: 0 });
  });
});

describe('GET /tasks', () => {
  it('returns an empty array when no tasks exist', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(db.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY created_at ASC');
  });

  it('returns all tasks ordered by created_at, including priority', async () => {
    const mockTasks = [task(), task({ id: 2, name: 'Task 2', priority: 'high' })];
    db.query.mockResolvedValue({ rows: mockTasks });

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTasks);
  });

  it.each(['low', 'medium', 'high'])('filters by ?priority=%s', async (priority) => {
    const mockTasks = [task({ priority })];
    db.query.mockResolvedValue({ rows: mockTasks });

    const response = await request(app).get('/tasks').query({ priority });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTasks);
    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM tasks WHERE priority = $1 ORDER BY created_at ASC',
      [priority]
    );
  });

  it.each(['urgent', 'HIGH', ''])('returns 400 for invalid ?priority=%j', async (priority) => {
    const response = await request(app).get('/tasks').query({ priority });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'invalid priority' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 400 when priority is given more than once', async () => {
    const response = await request(app).get('/tasks?priority=low&priority=high');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'invalid priority' });
  });

  it('returns 500 on database errors', async () => {
    db.query.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(500);
  });
});

describe('POST /tasks', () => {
  it('defaults priority to medium when omitted', async () => {
    db.query.mockResolvedValue({ rows: [task({ name: 'New' })] });

    const response = await request(app).post('/tasks').send({ name: ' New ' });

    expect(response.status).toBe(201);
    expect(response.body.priority).toBe('medium');
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO tasks (name, priority) VALUES ($1, $2) RETURNING *',
      ['New', 'medium']
    );
  });

  it.each(['low', 'medium', 'high'])('accepts priority %s', async (priority) => {
    db.query.mockResolvedValue({ rows: [task({ name: 'New', priority })] });

    const response = await request(app).post('/tasks').send({ name: 'New', priority });

    expect(response.status).toBe(201);
    expect(response.body.priority).toBe(priority);
    expect(db.query).toHaveBeenCalledWith(expect.any(String), ['New', priority]);
  });

  it.each([['urgent'], [''], [null], [1], [['low']], [{}]])(
    'returns 400 for invalid priority %j',
    async (priority) => {
      const response = await request(app).post('/tasks').send({ name: 'New', priority });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'invalid priority' });
      expect(db.query).not.toHaveBeenCalled();
    }
  );

  it('returns 400 when name is missing', async () => {
    const response = await request(app).post('/tasks').send({ priority: 'low' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'name is required' });
  });

  it('returns 400 when name is too long', async () => {
    const response = await request(app).post('/tasks').send({ name: 'a'.repeat(201) });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'name must be 200 characters or less' });
  });
});

describe('PATCH /tasks/:id', () => {
  it.each(['low', 'medium', 'high'])('updates priority to %s', async (priority) => {
    db.query
      .mockResolvedValueOnce({ rows: [task()] })
      .mockResolvedValueOnce({ rows: [task({ priority })] });

    const response = await request(app).patch('/tasks/1').send({ priority });

    expect(response.status).toBe(200);
    expect(response.body.priority).toBe(priority);
    expect(db.query).toHaveBeenLastCalledWith(
      'UPDATE tasks SET completed = $1, name = $2, priority = $3 WHERE id = $4 RETURNING *',
      [false, 'Task 1', priority, 1]
    );
  });

  it('keeps the current priority when priority is omitted', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [task({ priority: 'high' })] })
      .mockResolvedValueOnce({ rows: [task({ priority: 'high', completed: true })] });

    const response = await request(app).patch('/tasks/1').send({ completed: true });

    expect(response.status).toBe(200);
    expect(db.query).toHaveBeenLastCalledWith(expect.any(String), [true, 'Task 1', 'high', 1]);
  });

  it.each([['urgent'], [''], [null], [2]])('returns 400 for invalid priority %j', async (priority) => {
    const response = await request(app).patch('/tasks/1').send({ priority });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'invalid priority' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 404 when the task does not exist', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).patch('/tasks/99').send({ priority: 'low' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Not found' });
  });

  it('returns 400 for a non-numeric id', async () => {
    const response = await request(app).patch('/tasks/abc').send({ priority: 'low' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'invalid id' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it.each([['false'], ['0'], [0], [null]])('returns 400 for non-boolean completed %j', async (completed) => {
    const response = await request(app).patch('/tasks/1').send({ completed });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'completed must be a boolean' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it.each([[5], [null], [''], ['   ']])('returns 400 for invalid name %j', async (name) => {
    const response = await request(app).patch('/tasks/1').send({ name });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'name is required' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 400 when name is too long', async () => {
    const response = await request(app).patch('/tasks/1').send({ name: 'a'.repeat(201) });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'name must be 200 characters or less' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('renames a task with a trimmed name', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [task()] })
      .mockResolvedValueOnce({ rows: [task({ name: 'New' })] });

    const response = await request(app).patch('/tasks/1').send({ name: ' New ' });

    expect(response.status).toBe(200);
    expect(db.query).toHaveBeenLastCalledWith(expect.any(String), [false, 'New', 'medium', 1]);
  });
});

describe('DELETE /tasks/:id', () => {
  it('returns 400 for a non-numeric id', async () => {
    const response = await request(app).delete('/tasks/abc');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'invalid id' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('deletes an existing task', async () => {
    db.query.mockResolvedValueOnce({ rows: [task()] }).mockResolvedValueOnce({ rows: [] });

    const response = await request(app).delete('/tasks/1');

    expect(response.status).toBe(204);
  });

  it('returns 404 when the task does not exist', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).delete('/tasks/1');

    expect(response.status).toBe(404);
  });
});
