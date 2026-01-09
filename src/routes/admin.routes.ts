import { Router } from 'express';
// 1. CORREGIMOS LA RUTA DE IMPORTACIÓN (Asegúrate que la ruta sea correcta según tu estructura)
import authenticateToken from '../middleware/auth'; 

import { listarPedidos, actualizarPedido, obtenerPedido } from '../controllers/pedido.controller';

const router = Router();

// ... otras rutas de admin ...

// GET /api/admin/pedidos
router.get('/pedidos', authenticateToken, listarPedidos);

// GET /api/admin/pedidos/:id
router.get('/pedidos/:id', authenticateToken, obtenerPedido);

// PUT /api/admin/pedidos/:id
router.put('/pedidos/:id', authenticateToken, actualizarPedido);

export default router;