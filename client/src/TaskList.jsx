import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3000'

function TaskList({ token, username, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [error, setError] = useState('')

  async function fetchTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        setError('Failed to load tasks')
        return
      }

      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError('Could not reach the server')
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  async function handleAddTask(e) {
    e.preventDefault()
    if (!newTask.trim()) return

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ task: newTask }),
      })

      if (!response.ok) {
        setError('Failed to add task')
        return
      }

      setNewTask('')
      fetchTasks()
    } catch (err) {
      setError('Could not reach the server')
    }
  }

  async function handleComplete(id) {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        setError('Failed to update task')
        return
      }

      fetchTasks()
    } catch (err) {
      setError('Could not reach the server')
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        setError('Failed to delete task')
        return
      }

      fetchTasks()
    } catch (err) {
      setError('Could not reach the server')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <p>Logged in as {username}</p>
        <button onClick={onLogout}>Log out</button>
      </div>

      <form onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="New task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map((task) => (
          <li key={task.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
              {task.task}
            </span>
            {!task.done && <button onClick={() => handleComplete(task.id)}>Done</button>}
            <button onClick={() => handleDelete(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TaskList