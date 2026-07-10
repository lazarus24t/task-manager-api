const request = require('supertest')
const app = require('./server')
describe('GET /tasks', () => {
  test('responds with 200 and an array of tasks', async () => {
    const response = await request(app).get('/tasks')
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })
})