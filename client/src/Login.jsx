import { useState } from 'react'

const API_URL = 'http://localhost:3000'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const endpoint = isRegistering ? '/register' : '/login'

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      onLogin(data.token, data.username)
    } catch (err) {
      setError('Could not reach the server')
    }
  }

  return (
    <div>
      <h2>{isRegistering ? 'Register' : 'Log in'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">{isRegistering ? 'Register' : 'Log in'}</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register"}
      </button>
    </div>
  )
}

export default Login