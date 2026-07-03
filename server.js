#!/usr/bin/env node

const express = require('express')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

app.use(express.json())

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany()
    res.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

app.post('/tasks', async (req, res) => {
  try {
    const { task } = req.body
    if (!task) {
      return res.status(400).json({ error: 'Task description is required' })
    }

    const newTask = await prisma.task.create({ data: { task } })
    res.status(201).json(newTask)
  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: 'Failed to create task' })
  }
})

app.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const taskId = Number(id)

    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' })
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { done: true }
    })

    res.json(task)
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' })
    }

    console.error('Error updating task:', error)
    res.status(500).json({ error: 'Failed to update task' })
  }
})

app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const taskId = Number(id)

    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' })
    }

    await prisma.task.delete({ where: { id: taskId } })
    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' })
    }

    console.error('Error deleting task:', error)
    res.status(500).json({ error: 'Failed to delete task' })
  }
})
app.listen(3000, () => {
  console.log(' Server running on http://localhost:3000')
})