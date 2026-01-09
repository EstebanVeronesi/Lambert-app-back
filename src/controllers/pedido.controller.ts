import { Request, Response } from 'express';
import { ProyectoRepository } from '../repositories/proyecto.repository';

// Listar Pedidos (Inteligente: Admin ve todo, Vendedor ve lo suyo)
export const listarPedidos = async (req: Request, res: Response) => {
  try {
    // 1. Obtenemos el usuario del token (req as any para evitar error de TS)
    const usuario = (req as any).user; 
    
    // Debug: para que veas en consola quién está pidiendo los datos
    console.log("Usuario solicitante:", usuario);

    let pedidos;

    // 2. Verificamos Rol
    if (usuario.rol === 'admin' || usuario.rol === 'ingeniero') {
      // Si es Jefe/Ingeniero, ve TODO
      pedidos = await ProyectoRepository.findAll();
    } else {
      // Si es Vendedor, filtramos usando su DNI (que está en usuario.id)
      if (!usuario.id) {
         return res.status(400).json({ error: "Token inválido: falta identificación de usuario." });
      }
      
      console.log(`Filtrando pedidos para el vendedor DNI: ${usuario.id}`);
      pedidos = await ProyectoRepository.findByVendedor(usuario.id);
    }

    res.json(pedidos);

  } catch (error: any) {
    console.error("Error en listarPedidos:", error);
    res.status(500).json({ error: error.message || "Error al obtener la lista de pedidos" });
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