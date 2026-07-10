import { useState } from 'react'
import Login from './Login'
import TaskList from './TaskList'

function App() {
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState(null)

  function handleLogin(newToken, newUsername) {
    setToken(newToken)
    setUsername(newUsername)
  }

  function handleLogout() {
    setToken(null)
    setUsername(null)
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Task Manager</h1>
      {token ? (
        <TaskList token={token} username={username} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App