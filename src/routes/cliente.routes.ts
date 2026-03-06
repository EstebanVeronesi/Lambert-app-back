import { Router } from 'express';
import authenticateToken from '../middleware/auth';
import { listarClientes, crearCliente, actualizarCliente, eliminarCliente } from '../controllers/cliente.controller';

const router = Router();

router.get('/', authenticateToken, listarClientes);
router.post('/', authenticateToken, crearCliente);
router.put('/', authenticateToken, actualizarCliente);
router.delete('/:cuit', authenticateToken, eliminarCliente);

export default router;
