import { pool } from '../../db';
import { Cliente } from '../types/proyecto.types';

export const listarClientesRepo = async (): Promise<Cliente[]> => {
  const result = await pool.query(
    'SELECT cuit, razon_social FROM cliente ORDER BY razon_social ASC'
  );
  return result.rows;
};

export const crearClienteRepo = async (cliente: Cliente): Promise<Cliente> => {
  const result = await pool.query(
    'INSERT INTO cliente (cuit, razon_social) VALUES ($1, $2) RETURNING cuit, razon_social',
    [cliente.cuit, cliente.razon_social]
  );
  return result.rows[0];
};

export const actualizarClienteRepo = async (cliente: Cliente): Promise<Cliente> => {
  const result = await pool.query(
    'UPDATE cliente SET razon_social = $2 WHERE cuit = $1 RETURNING cuit, razon_social',
    [cliente.cuit, cliente.razon_social]
  );
  return result.rows[0];
};

export const eliminarClienteRepo = async (cuit: number): Promise<void> => {
  await pool.query('DELETE FROM cliente WHERE cuit = $1', [cuit]);
};
