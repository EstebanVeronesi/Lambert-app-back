// src/middleware/auth.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY } from '../../config';

export function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  
  console.log(`[DEBUG] auth.ts -> Verificando token para: ${req.originalUrl}`);
  
  // 1. Buscamos en la Cookie (para el navegador)
  let token = req.cookies?.access_token;

  // 2. Si no hay cookie, buscamos en el Header Authorization (para Yaak/Postman/Mobile)
  // El header suele venir como: "Bearer eyJhbGci..."
  if (!token) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1]; // Tomamos solo el código después de "Bearer"
      }
  }

  // Si después de buscar en los dos lados sigue vacío...
  if (!token) {
    console.error('[DEBUG] auth.ts -> ¡FALLÓ! No se encontró token en cookies ni headers.');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_JWT_KEY);
    (req as any).user = decoded;
    
    console.log('[DEBUG] auth.ts -> ¡ÉXITO! Token verificado.');
    next();
  
  } catch(err) {
    console.error('[DEBUG] auth.ts -> ¡FALLÓ! Token inválido o expirado.');
    return res.status(403).json({ error: 'Invalid token.' });
  }
}

export default authenticateToken;