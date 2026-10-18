const request = require('supertest');

jest.mock('./db');

const app = require('./index');

describe('POST /tasks (real app)', () => {
  it('returns 400 when the name is 201 characters long', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ name: 'a'.repeat(201) });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'name must be 200 characters or less' });
  });
});
