const { verifyToken } = require('../auth')

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  const token = authHeader.split(' ')[1]

  try {
    const payload = verifyToken(token)
    req.user = payload
    next() 
  } catch (error) {
    req.log.warn({ err: error }, 'Invalid or expired token')
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = requireAuth