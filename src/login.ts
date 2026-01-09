// src/login.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../user-repository'; // Asegúrate que la ruta al archivo sea correcta
import { SECRET_JWT_KEY } from '../config';      // Asegúrate que la ruta al archivo sea correcta
import authenticateToken from './middleware/auth';

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserRepository.login({ email, password });

    // Generamos el token
    // user.id ya contiene el DNI gracias al cambio en el repository
    const token = jwt.sign(
      { 
        id: user.id,      // Esto es el DNI
        dni: user.dni, 
        email: user.email,
        rol: user.rol     
      },
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
      .json({ 
        email: user.email, 
        rol: user.rol, 
        id: user.id  // El frontend recibe el DNI en este campo 'id'
      });

  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Login failed' });
  }
});

// STATUS / IS LOGGED IN
router.get('/status', authenticateToken, (req, res) => {
  const user = (req as any).user;
  res.json({ 
    loggedIn: true, 
    user: {
      id: user.id,   // DNI
      email: user.email,
      rol: user.rol,
      dni: user.dni
    }
  });
});

// REGISTER (Igual que antes)
router.post('/register', async (req, res) => {
  const { dni, nombre, email, password, rol } = req.body;
  try {
    const userId = await UserRepository.create({ dni, nombre, email, password, rol });
    res.status(201).json({ message: 'Usuario creado', id: userId });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// LOGOUT (Igual que antes)
router.post('/logout', (req, res) => {
  res.clearCookie('access_token').status(200).json({ message: 'Logged out' });
});

export default router;