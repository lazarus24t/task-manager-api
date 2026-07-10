// middleware/auth.js
//
// Express middleware that runs BEFORE a route handler. Its job: check that
// the incoming request has a valid JWT, and if so, attach the logged-in
// user's info to `req` so the route handler knows WHO is making the request.
// If the token is missing or invalid, it stops the request here with a 401
// — the route handler never even runs.

const { verifyToken } = require('../auth')

function requireAuth(req, res, next) {
  // Convention: the client sends the token in a header like:
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  // Strip off the "Bearer " prefix to get just the token itself.
  const token = authHeader.split(' ')[1]

  try {
    const payload = verifyToken(token)
    // Attach the decoded info to req.user so every route handler after this
    // middleware can access req.user.userId to know whose data to work with.
    req.user = payload
    next() // Move on to the actual route handler.
  } catch (error) {
    req.log.warn({ err: error }, 'Invalid or expired token')
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = requireAuth