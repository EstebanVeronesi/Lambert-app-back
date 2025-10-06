import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lambert',
  password: '159753',
  port: 5432, // puerto por defecto de PostgreSQL
});

// Ejemplo de uso:
// const res = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
