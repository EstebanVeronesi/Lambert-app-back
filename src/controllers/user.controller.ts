// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { pool } from '../../db'; // o usar UserRepository si querés

// Listar todos los usuarios (solo admin)
export const listarUsuarios = async (req: Request, res: Response) => {
  try {
    const usuario = (req as any).user;

    if (usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const result = await pool.query(
      'SELECT dni, nombre, email, rol FROM users ORDER BY nombre ASC'
    );

    const usuarios = result.rows.map((u: any) => ({
      id: u.dni,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol }));

    res.json(usuarios);
  } catch (error: any) {
    console.error('Error en listarUsuarios:', error);
    res.status(500).json({ error: error.message });
  }
};
