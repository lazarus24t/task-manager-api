#!/usr/bin/env node

const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const pinoHttp = require('pino-http')
const logger = require('./logger')
const { hashPassword, checkPassword, createToken } = require('./auth')
const requireAuth = require('./middleware/auth')

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())
app.use(pinoHttp({ logger }))

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    })

    const token = createToken(user)

    res.status(201).json({ token, username: user.username })
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Username already taken' })
    }

    req.log.error({ err: error }, 'Error registering user')
    res.status(500).json({ error: 'Failed to register' })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { username } })

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    const passwordMatches = await checkPassword(password, user.password)

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    const token = createToken(user)

    res.json({ token, username: user.username })
  } catch (error) {
    req.log.error({ err: error }, 'Error logging in')
    res.status(500).json({ error: 'Failed to log in' })
  }
})

app.get('/tasks', requireAuth, async (req, res) => {
  try {
    const { done } = req.query

    const where = { userId: req.user.userId }
    if (done === 'true') where.done = true
    if (done === 'false') where.done = false

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    res.json(tasks)
  } catch (error) {
    req.log.error({ err: error }, 'Error fetching tasks')
    res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

app.post('/tasks', requireAuth, async (req, res) => {
  try {
    const { task, priority } = req.body
    if (!task) {
      return res.status(400).json({ error: 'Task description is required' })
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH']
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Priority must be LOW, MEDIUM, or HIGH' })
    }

    const newTask = await prisma.task.create({
      data: {
        task,
        userId: req.user.userId,
        ...(priority && { priority }),
      },
    })
    res.status(201).json(newTask)
  } catch (error) {
    req.log.error({ err: error }, 'Error creating task')
    res.status(500).json({ error: 'Failed to create task' })
  }
})

app.patch('/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const taskId = Number(id)

    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' })
    }

    const result = await prisma.task.updateMany({
      where: { id: taskId, userId: req.user.userId },
      data: { done: true },
    })

    if (result.count === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } })
    res.json(task)
  } catch (error) {
    req.log.error({ err: error }, 'Error updating task')
    res.status(500).json({ error: 'Failed to update task' })
  }
})

app.delete('/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const taskId = Number(id)

    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' })
    }

    const result = await prisma.task.deleteMany({
      where: { id: taskId, userId: req.user.userId },
    })

    if (result.count === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    req.log.error({ err: error }, 'Error deleting task')
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

if (require.main === module) {
  app.listen(3000, () => {
    logger.info('Server running on http://localhost:3000')
  })
}

module.exports = app