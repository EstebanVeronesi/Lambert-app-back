import DBLocal from 'db-local'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

import { SALT_ROUNDS } from './config.ts'

const { Schema } = new DBLocal({ path: './db' })

const User = Schema('User', {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

export class UserRepository {
  static async create ({ username, password }) {
    // Validar username y password
    Validation.username(username)
    Validation.password(password)

    // 1. Verificar si el username ya existe
    const user = await User.findOne({ username })
    if (user) {
      throw new Error('Username already exists')
    }

    const id = crypto.randomUUID()

    // 2. Hashear password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    User.create({ _id: id, username, password: hashedPassword }).save()
    return { id, username }
  }

  static async login ({ username, password }) {
    Validation.username(username)
    Validation.password(password)

    const user = await User.findOne({ username })
    if (!user) throw new Error('Invalid username or password')

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error('Invalid username or password')

    return {
      id: user._id,
      username: user.username
    }
  }
}

class Validation {
  static username (username) {
    if (typeof username !== 'string' || username.trim().length < 3) throw new Error('Invalid username')}

  static password (password) {
    if (typeof password !== 'string' || password.length < 6) throw new Error('Invalid password')}
}
