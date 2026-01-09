import { Router } from 'express';
import authenticateToken from '../middleware/auth'; // Tu middleware
import { checkLoginStatus } from '../controllers/auth.controller';

const router = Router();

// ... tus rutas de login/register ...

// GET /api/auth/status
router.get('/status', authenticateToken, checkLoginStatus);

export default router;