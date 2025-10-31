// src/middleware/auth.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY } from '../../config'; // Ajusta la ruta si 'config' no está en la raíz

export function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  
  // --- AÑADIDO ---
  console.log(`[DEBUG] auth.ts -> Verificando token para: ${req.originalUrl}`);
  // --- FIN ---
  
  const token = req.cookies?.access_token;
  if (!token) {
    // --- AÑADIDO ---
    console.error('[DEBUG] auth.ts -> ¡FALLÓ! No se encontró token en cookies.');
    // --- FIN ---
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_JWT_KEY);
    (req as any).user = decoded;
    
    // --- AÑADIDO ---
    console.log('[DEBUG] auth.ts -> ¡ÉXITO! Token verificado.');
    // --- FIN ---
    next();
  
  } catch(err) {
    // --- AÑADIDO ---
    console.error('[DEBUG] auth.ts -> ¡FALLÓ! Token inválido o expirado.');
    // --- FIN ---
    return res.status(403).json({ error: 'Invalid token.' });
  }
}

export default authenticateToken;