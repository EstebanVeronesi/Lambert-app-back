import express from 'express'
import { PORT, SECRET_JWT_KEY } from './config.ts'
import { UserRepository } from './user-repository.ts'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { json } from 'stream/consumers'

const app = express()

app.use(express.json()) // Middleware para parsear JSON
app.use(cookieParser()) // Middleware para parsear cookies

// Middleware para verificar el token en cada peticion
app.use((req, res, next) => {
  const token = req.cookies.access_token //recuperamos la cookie
  req.session = { user: null }

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY) //verificamos el token
    req.session.user = data //si el token es valido guardamos los datos del usuario en la sesion
  } catch {}

  next() //continuamos con la siguiente ruta o middleware
})

app.get('/', (req, res) => {
  const { user } = req.session
  res.json({ valid: true, user: user }) //si el token es valido devolvemos datos del usuario
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await UserRepository.login({ email, password })
    const token = jwt.sign({ dni: user.dni, email: user.email}, SECRET_JWT_KEY, {expiresIn: '1h'})
    res
    .cookie('access_token', token, {
      httpOnly: true, //la cookie solo se puede acceder desde el servidor
      secure: process.env.NODE_ENV === 'production',  //solo se envia por https
      sameSite: 'strict', //la cookie solo se envia si la peticion viene del mismo sitio
      maxAge: 1000 * 60 * 60}) //1 hora
      .json({ email }) // enviamos solo el usuario, Angular puede usarlo para UI
  } catch (error) {
    res.status(401).json({ error: error.message || 'Login failed' })
  }
})

app.post('/register', async (req, res) => {
  const { dni, nombre, email, password } = req.body

  try {
    const user = await UserRepository.create({ dni, nombre, email, password })
    res.status(201).json({ user }) // 201: Created
  } catch (error) {
    res.status(400).json({ error: error.message || 'Registration failed' })
  }
})

app.post('/logout', (req, res) => {
  res
  .clearCookie('access_token') //borramos la cookie
  .status(200)
  .json({ message: 'Logged out' })
})

app.get('/protected', (req, res) => {
  const { user } = req.session
  if (!user) return res.status(401).json({ error: 'Access denied. No token provided.' })
  res.json({ message: 'Protected resource', user: user }) // devolvemos JSON
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
