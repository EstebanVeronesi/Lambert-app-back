import { pool } from './db'; // Tu cliente PostgreSQL
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from './config';

// Definimos tipos para los parámetros de los métodos
interface UserInput {
  dni: string;
  nombre: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface UserOutput {
  dni: string;
  nombre: string;
  email: string;
}

export class UserRepository {
  // Crear usuario (registro)
  static async create({ dni, nombre, email, password }: UserInput): Promise<{ email: string }> {
    // Validaciones
    Validation.nombre(nombre);
    Validation.dni(dni);
    Validation.email(email);
    Validation.password(password);

    // Verificar si el usuario ya existe (por email o dni)
    const existing = await pool.query(
      'SELECT 1 FROM users WHERE email = $1 OR dni = $2',
      [email, dni]
    );

    if (existing.rows.length > 0) {
      throw new Error('Email or DNI already exists');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insertar usuario en PostgreSQL
    await pool.query(
      `INSERT INTO users (dni, nombre, email, password_hash)
       VALUES ($1, $2, $3, $4)`,
      [dni, nombre, email, hashedPassword]
    );

    return { email };
  }

  // Login de usuario
  static async login({ email, password }: LoginInput): Promise<UserOutput> {
    // Validaciones
    Validation.email(email);
    Validation.password(password);

    // Buscar usuario por email
    const result = await pool.query(
      'SELECT dni, nombre, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) throw new Error('Invalid email or password');

    const user = result.rows[0];

    // Comparar contraseña con bcrypt
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new Error('Invalid email or password');

    return {
      dni: user.dni,
      nombre: user.nombre,
      email: user.email
    };
  }
}

// Validaciones de datos
class Validation {
  static dni(dni: string) {
    if (typeof dni !== 'string' || dni.trim().length < 7) throw new Error('Invalid DNI');
  }

  static nombre(nombre: string) {
    if (typeof nombre !== 'string' || nombre.trim().length < 2) throw new Error('Invalid name');
  }

  static email(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) throw new Error('Invalid email');
  }

  static password(password: string) {
    if (typeof password !== 'string' || password.length < 6) throw new Error('Invalid password');
  }
}
