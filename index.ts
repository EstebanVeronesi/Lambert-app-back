import express from 'express'
import { PORT, SECRET_JWT_KEY } from './config.ts'
import { UserRepository } from './user-repository.ts'
import jwt from 'jsonwebtoken'

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign({ id: user.id, username: user.username}, SECRET_JWT_KEY, {expiresIn: '1h'})
    res.send({ user })
  } catch (error) {
    res.status(401).send({ error: error.message || 'Login failed' })
  }
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body
  console.log(req.body)

  try {
    const id = await UserRepository.create({ username, password })
    res.send({ id })
  } catch (error) {
    res.status(400).send({ error: error.message || 'Registration failed' })
  }
})

app.post('/logout', (req, res) => {
  // Handle logout logic here
  res.send('Logout endpoint')
})

app.get('/protected', (req, res) => {
  // Handle protected retrieval logic here
  res.send('Protected endpoint')
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
