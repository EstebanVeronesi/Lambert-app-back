import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lambert',
  password: 'fransql',
  port: 5432, // puerto por defecto de PostgreSQL
});

// Ejemplo de uso:
// const res = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
