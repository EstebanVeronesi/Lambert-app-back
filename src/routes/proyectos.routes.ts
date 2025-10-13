// src/routes/proyectos.routes.ts
import { Router } from 'express';
import { simularCalculo, guardarProyecto } from '../controllers/proyecto.controller';
import  authenticateToken from '../login';

const router = Router();

// Endpoint para simular/verificar un proyecto
router.post('/simular', authenticateToken, simularCalculo);

// Endpoint para guardar un proyecto ya verificado
router.post('/guardar', authenticateToken, guardarProyecto);

export default router;