// src/routes/user.routes.ts
import { Router } from 'express';
import authenticateToken from '../middleware/auth';
import { listarUsuarios } from '../controllers/user.controller';

const router = Router();

// GET /api/usuarios
// Solo accesible para admin
router.get('/', authenticateToken, listarUsuarios);

export default router;
