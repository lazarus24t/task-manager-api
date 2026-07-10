import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3000'

function TaskList({ token, username, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [newPriority, setNewPriority] = useState('MEDIUM')
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
        body: JSON.stringify({ task: newTask, priority: newPriority }),
      })

      if (!response.ok) {
        setError('Failed to add task')
        return
      }

      setNewTask('')
      setNewPriority('MEDIUM')
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

  const activeTasks = tasks.filter((t) => !t.done)
  const completedTasks = tasks.filter((t) => t.done)

  const priorityColor = { HIGH: '#d33', MEDIUM: '#e69500', LOW: '#3a3' }

  function renderTask(task) {
    return (
      <li key={task.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: priorityColor[task.priority] || '#666',
            border: `1px solid ${priorityColor[task.priority] || '#666'}`,
            borderRadius: 4,
            padding: '2px 6px',
          }}
        >
          {task.priority}
        </span>
        <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
          {task.task}
        </span>
        {!task.done && <button onClick={() => handleComplete(task.id)}>Done</button>}
        <button onClick={() => handleDelete(task.id)}>Delete</button>
      </li>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <p>Logged in as {username}</p>
        <button onClick={onLogout}>Log out</button>
      </div>

      <form onSubmit={handleAddTask} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="New task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <button type="submit">Add</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>Active</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {activeTasks.length === 0 ? <p>No active tasks</p> : activeTasks.map(renderTask)}
      </ul>

      <h3>Completed</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {completedTasks.length === 0 ? <p>No completed tasks</p> : completedTasks.map(renderTask)}
      </ul>
    </div>
  )
}

export default TaskList