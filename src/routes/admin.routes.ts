import { Router } from 'express';
import authenticateToken from '../login'; // O tu middleware de auth
// Importar los controladores nuevos
import { listarPedidos, actualizarPedido, obtenerPedido } from '../controllers/pedido.controller';

const router = Router();

// ... otras rutas de admin ...

// GET /api/admin/pedidos -> Trae TODOS los pedidos
router.get('/pedidos', authenticateToken, listarPedidos);

// GET /api/admin/pedidos/:id -> Trae UNO (requiere ?es_modificado=...)
router.get('/pedidos/:id', authenticateToken, obtenerPedido);

// PUT /api/admin/pedidos/:id -> Actualiza estado, fecha o cálculos
router.put('/pedidos/:id', authenticateToken, actualizarPedido);

export default router;