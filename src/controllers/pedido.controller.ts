import { Request, Response } from 'express';
import { ProyectoRepository } from '../repositories/proyecto.repository';

export const listarPedidos = async (req: Request, res: Response) => {
  try {
    const pedidos = await ProyectoRepository.findAll();
    res.json(pedidos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const actualizarPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // El frontend debe enviar si es modificado o no para saber qué tabla tocar
    const { es_modificado, ...datosAActualizar } = req.body;

    if (es_modificado === undefined) {
      return res.status(400).json({ error: "Se requiere el campo 'es_modificado' (true/false)" });
    }

    const resultado = await ProyectoRepository.updatePedido(Number(id), es_modificado, datosAActualizar);
    res.json(resultado);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --- NUEVO: Obtener un solo pedido por ID ---
export const obtenerPedido = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { es_modificado } = req.query; // Leemos el query param ?es_modificado=true/false
  
      if (es_modificado === undefined) {
        return res.status(400).json({ error: "Falta el parámetro query 'es_modificado' (true/false)" });
      }
  
      const isMod = String(es_modificado) === 'true';
      const pedido = await ProyectoRepository.findById(Number(id), isMod);
  
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
  
      res.json(pedido);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };