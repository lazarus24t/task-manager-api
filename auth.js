const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SALT_ROUNDS = 10

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS)
}

async function checkPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword)
}

function createToken(user) {
  const payload = { userId: user.id, username: user.username }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' })
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { hashPassword, checkPassword, createToken, verifyToken }