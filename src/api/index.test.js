const request = require('supertest');
const express = require('express');
const db = require('./db');

// Mock the db module
jest.mock('./db');

// Create a test app
const createApp = () => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/tasks', async (_req, res) => {
    const { rows } = await db.query('SELECT * FROM tasks ORDER BY created_at ASC');
    res.json(rows);
  });

  return app;
};

describe('GET /tasks', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  it('should return an empty array when no tasks exist', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(db.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY created_at ASC');
  });

  it('should return all tasks ordered by created_at', async () => {
    const mockTasks = [
      { id: 1, name: 'Task 1', completed: false, created_at: '2024-01-01T00:00:00Z' },
      { id: 2, name: 'Task 2', completed: true, created_at: '2024-01-02T00:00:00Z' },
    ];
    db.query.mockResolvedValue({ rows: mockTasks });

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTasks);
    expect(db.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY created_at ASC');
  });

  it('should handle database errors gracefully', async () => {
    db.query.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(500);
  });
});
