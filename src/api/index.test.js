const request = require('supertest');
const db = require('./db');
const app = require('./index');

// Mock the db module
jest.mock('./db');

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

describe('GET /tasks', () => {
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
  });

  it('should handle database errors gracefully', async () => {
    db.query.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(500);
  });
});

describe('PATCH /tasks/:id', () => {
  const existing = { id: 5, name: 'Old', completed: false };

  describe('invalid id', () => {
    it.each(['abc', '0', '-1', '1.5', '1abc', '99999999999999999999'])(
      'returns 400 for id %s',
      async (id) => {
        const response = await request(app).patch(`/tasks/${id}`).send({ completed: true });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'invalid id' });
        expect(db.query).not.toHaveBeenCalled();
      }
    );
  });

  describe('completed validation', () => {
    it.each([
      ['string "false"', 'false'],
      ['string "true"', 'true'],
      ['number 1', 1],
      ['number 0', 0],
      ['null', null],
      ['object', {}],
      ['array', []],
    ])('returns 400 when completed is %s', async (_label, value) => {
      const response = await request(app).patch('/tasks/5').send({ completed: value });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(db.query).not.toHaveBeenCalled();
    });

    it.each([true, false])('accepts boolean %s and stores it as-is', async (value) => {
      db.query
        .mockResolvedValueOnce({ rows: [existing] })
        .mockResolvedValueOnce({ rows: [{ ...existing, completed: value }] });

      const response = await request(app).patch('/tasks/5').send({ completed: value });

      expect(response.status).toBe(200);
      expect(db.query).toHaveBeenLastCalledWith(
        'UPDATE tasks SET completed = $1, name = $2 WHERE id = $3 RETURNING *',
        [value, 'Old', 5]
      );
    });
  });

  describe('name validation', () => {
    it.each([
      ['empty string', ''],
      ['whitespace only', '   '],
      ['number', 123],
      ['null', null],
      ['boolean', true],
      ['object', {}],
      ['array', ['a']],
      ['201 characters', 'a'.repeat(201)],
      ['201 characters after padding', `  ${'a'.repeat(201)}  `],
    ])('returns 400 when name is %s', async (_label, value) => {
      const response = await request(app).patch('/tasks/5').send({ name: value });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(db.query).not.toHaveBeenCalled();
    });

    it('accepts a 200-character name and trims it', async () => {
      const name = 'a'.repeat(200);
      db.query
        .mockResolvedValueOnce({ rows: [existing] })
        .mockResolvedValueOnce({ rows: [{ ...existing, name }] });

      const response = await request(app).patch('/tasks/5').send({ name: `  ${name}  ` });

      expect(response.status).toBe(200);
      expect(db.query).toHaveBeenLastCalledWith(
        'UPDATE tasks SET completed = $1, name = $2 WHERE id = $3 RETURNING *',
        [false, name, 5]
      );
    });
  });

  it('returns 404 when the task does not exist', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).patch('/tasks/5').send({ completed: true });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Not found' });
  });
});

describe('DELETE /tasks/:id', () => {
  it.each(['abc', '0', '-1', '1.5', '1abc', '99999999999999999999'])(
    'returns 400 for id %s',
    async (id) => {
      const response = await request(app).delete(`/tasks/${id}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'invalid id' });
      expect(db.query).not.toHaveBeenCalled();
    }
  );

  it('returns 404 when the task does not exist', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).delete('/tasks/5');

    expect(response.status).toBe(404);
  });

  it('deletes an existing task with a valid id', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 5, name: 'x', completed: false }] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await request(app).delete('/tasks/5');

    expect(response.status).toBe(204);
    expect(db.query).toHaveBeenLastCalledWith('DELETE FROM tasks WHERE id = $1', [5]);
  });
});
