// src/routes/camion.routes.ts
import { Router } from 'express';
import { getCamionesVerificados, getConfiguracionPorCamionId, crearCamion } from '../controllers/camion.controller';
import authenticateToken from '../middleware/auth'; // Importamos el middleware

const router = Router();

// GET /api/camiones
// Devuelve la lista de camiones verificados para los dropdowns
router.get('/', authenticateToken, getCamionesVerificados);

// --- ¡NUEVA RUTA AÑADIDA! ---
// GET /api/camiones/configuracion/1
// Devuelve la última configuración verificada para el camión con ID 1
router.get('/configuracion/:id', authenticateToken, getConfiguracionPorCamionId);

// POST /api/camiones (Crear nuevo camión y su configuración)
router.post('/', authenticateToken, crearCamion);

export default router;