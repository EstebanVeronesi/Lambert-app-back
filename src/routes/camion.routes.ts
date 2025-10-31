// src/routes/camion.routes.ts
import { Router } from 'express';
import { getCamionesVerificados, getConfiguracionPorCamionId } from '../controllers/camion.controller';
import authenticateToken from '../middleware/auth'; // Importamos el middleware

const router = Router();

// GET /api/camiones
// Devuelve la lista de camiones verificados para los dropdowns
router.get('/', authenticateToken, getCamionesVerificados);

// --- ¡NUEVA RUTA AÑADIDA! ---
// GET /api/camiones/configuracion/1
// Devuelve la última configuración verificada para el camión con ID 1
router.get('/configuracion/:id', authenticateToken, getConfiguracionPorCamionId);

export default router;