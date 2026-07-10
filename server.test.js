const request = require('supertest')
const app = require('./server')

let token

beforeAll(async () => {
  const uniqueUsername = `testuser_${Date.now()}`

  const response = await request(app)
    .post('/register')
    .send({ username: uniqueUsername, password: 'test1234' })

  token = response.body.token
})

describe('GET /tasks', () => {
  test('rejects requests with no token', async () => {
    const response = await request(app).get('/tasks')
    expect(response.status).toBe(401)
  })

  test('responds with 200 and an array of tasks when authenticated', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })
})

describe('POST /tasks', () => {
  test('creates a task with a valid priority', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ task: 'urgent fix', priority: 'HIGH' })

    expect(response.status).toBe(201)
    expect(response.body.priority).toBe('HIGH')
  })

  test('defaults to MEDIUM priority when none is provided', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ task: 'no priority set' })

    expect(response.status).toBe(201)
    expect(response.body.priority).toBe('MEDIUM')
  })

  test('rejects an invalid priority', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ task: 'bad priority', priority: 'URGENT' })

    expect(response.status).toBe(400)
  })
})

describe('GET /tasks?done=', () => {
  test('filters to only completed tasks', async () => {
    const createResponse = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ task: 'to be completed', priority: 'LOW' })

    const taskId = createResponse.body.id

    await request(app)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

    const response = await request(app)
      .get('/tasks?done=true')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.every((t) => t.done === true)).toBe(true)
  })
})