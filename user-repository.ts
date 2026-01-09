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

export interface UserOutput {
  id: number;       // El sistema espera un "id", le daremos el DNI
  dni: number;
  nombre: string;
  email: string;
  rol: string;      
}

export class UserRepository {
  
  static async login({ email, password }: { email: string, password: string }): Promise<UserOutput> {
    
    // 1. Buscamos por email. Pedimos dni, rol y password_hash
    const result = await pool.query(
      'SELECT dni, email, password_hash, nombre, rol FROM users WHERE email = $1', 
      [email]
    );

    if (result.rows.length === 0) throw new Error('Usuario no encontrado');

    const user = result.rows[0];

    // 2. Comparamos contraseña con 'password_hash' (según tu imagen)
    const passwordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!passwordCorrect) throw new Error('Contraseña incorrecta');

    // 3. RETORNAMOS EL OBJETO MAPEADO
    // Aquí es donde decimos que el ID es el DNI
    return {
      id: user.dni,           // <--- CLAVE: El ID del sistema ahora es el DNI
      dni: user.dni,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol           // Ahora sí existe porque agregaste la columna
    };
  }

  static async create({ dni, nombre, email, password, rol }: any): Promise<number> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insertamos usando password_hash y devolvemos el dni como id
    const result = await pool.query(
      `INSERT INTO users (dni, nombre, email, password_hash, rol, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING dni`,
      [dni, nombre, email, hashedPassword, rol || 'vendedor']
    );
    
    return result.rows[0].dni;
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
