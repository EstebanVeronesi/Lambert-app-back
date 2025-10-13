// src/login.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../user-repository'; // Asegúrate que la ruta al archivo sea correcta
import { SECRET_JWT_KEY } from '../config';      // Asegúrate que la ruta al archivo sea correcta

const router = express.Router();

// Middleware para verificar JWT (ahora pertenece a este router)
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, SECRET_JWT_KEY);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token.' });
  }
}

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserRepository.login({ email, password });

    const token = jwt.sign(
      { dni: user.dni, email: user.email },
      SECRET_JWT_KEY,
      { expiresIn: '1h' }
    );

    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60,
      })
      .json({ email: user.email });

  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Login failed' });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { dni, nombre, email, password } = req.body;

  try {
    const user = await UserRepository.create({ dni, nombre, email, password });
    res.status(201).json({ user });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res
    .clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .status(200)
    .json({ message: 'Logged out' });
});

// Endpoint protegido
router.get('/protected', authenticateToken, (req, res) => {
  const user = (req as any).user;
  res.json({ message: 'Protected resource', user });
});

// Exportamos el router para que index.ts pueda usarlo
export default router;