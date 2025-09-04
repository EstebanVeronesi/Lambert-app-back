import DBLocal from 'db-local'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

import { SALT_ROUNDS } from './config.ts'

const { Schema } = new DBLocal({ path: './db' })

const User = Schema('User', {
  nombre: { type: String, required: true },
  dni: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
})

export class UserRepository {
  static async create ({ dni, nombre, email, password }) {
    // Validar username y password
    Validation.nombre(nombre)
    Validation.dni(dni)
    Validation.email(email)
    Validation.password(password)

    // Verificar si el email ya existe
    const user = await User.findOne({ email })
    if (user) {
      throw new Error('Email already exists')
    }

    // 2. Hashear password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    User.create({ dni, nombre, email, password: hashedPassword }).save()
    return { email }
  }

  static async login ({ email, password }) {
    Validation.email(email)
    Validation.password(password)

    const user = await User.findOne({ email })
    if (!user) throw new Error('Invalid email or password')

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error('Invalid username or password')

    return {
      dni: user.dni,
      nombre: user.nombre,
      email: user.email
    }
  }
}

class Validation {
  static dni(dni) {
    if (typeof dni !== 'string' || dni.trim().length < 7) throw new Error('Invalid DNI')
  }

  static nombre(nombre) {
    if (typeof nombre !== 'string' || nombre.trim().length < 2) throw new Error('Invalid name')
  }

  static email(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(email)) throw new Error('Invalid email')
  }

  static password(password) {
    if (typeof password !== 'string' || password.length < 6) throw new Error('Invalid password')
  }
}