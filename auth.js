// auth.js
//
// Small helper module for the two things auth needs to do:
// 1. Safely hash/check passwords (never store or compare plain text)
// 2. Create/verify JWTs (proof that a request "is" a specific logged-in user)

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// bcrypt "salt rounds" — how many times the hashing algorithm runs internally.
// Higher = slower to compute = harder to brute-force, but also slower for
// real logins. 10 is a well-established, sane default for most apps.
const SALT_ROUNDS = 10

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS)
}

async function checkPassword(plainPassword, hashedPassword) {
  // bcrypt.compare hashes the plain password the same way and checks if it
  // matches the stored hash. We NEVER reverse the hash back into a password
  // — that's not mathematically possible by design. We only ever compare.
  return bcrypt.compare(plainPassword, hashedPassword)
}

function createToken(user) {
  // The "payload" is the data we embed inside the token. Keep it small and
  // non-sensitive — a JWT is signed (tamper-proof) but NOT encrypted, meaning
  // anyone can decode and read it, they just can't forge or alter it without
  // knowing JWT_SECRET. Never put a password in here.
  const payload = { userId: user.id, username: user.username }

  // jwt.sign creates the token. expiresIn means the token stops being valid
  // after 24 hours — after that, the user has to log in again. This limits
  // how long a stolen token could be misused.
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' })
}

function verifyToken(token) {
  // Throws an error if the token is invalid, expired, or was signed with a
  // different secret (i.e. forged). We let that error bubble up to
  // whatever middleware calls this.
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { hashPassword, checkPassword, createToken, verifyToken }