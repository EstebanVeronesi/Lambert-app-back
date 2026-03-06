import { Request, Response } from 'express';
import { listarClientesRepo, crearClienteRepo, actualizarClienteRepo, eliminarClienteRepo } from '../repositories/cliente.repository';
import { Cliente } from '../types/proyecto.types';

export const listarClientes = async (req: Request, res: Response) => {
  try {
    const clientes = await listarClientesRepo();
    res.json(clientes);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

export const crearCliente = async (req: Request, res: Response) => {
  const { cuit, razon_social } = req.body;
  try {
    const nuevo = await crearClienteRepo({ cuit, razon_social } as Cliente);
    res.status(201).json(nuevo);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

export const actualizarCliente = async (req: Request, res: Response) => {
  const { cuit, razon_social } = req.body;
  try {
    const actualizado = await actualizarClienteRepo({ cuit, razon_social } as Cliente);
    res.json(actualizado);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

export const eliminarCliente = async (req: Request, res: Response) => {
  const { cuit } = req.params;
  try {
    await eliminarClienteRepo(Number(cuit));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};
