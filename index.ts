import express from 'express';
import { PORT, SECRET_JWT_KEY } from './config';
import { UserRepository } from './user-repository';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';


const app = express();

declare const process: {
  env: { [key: string]: string | undefined };
};

app.use(express.json());
app.use(cookieParser());

// Configurar CORS si el frontend está en otro origen
app.use(cors({
  origin: 'http://localhost:4200', // Cambiar al origen de tu frontend
  credentials: true
}));

// Middleware para verificar JWT
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

// Ruta de prueba
app.get('/', authenticateToken, (req, res) => {
  const user = (req as any).user;
  res.json({ valid: true, user });
});

// Login
app.post('/login', async (req, res) => {
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
app.post('/register', async (req, res) => {
  const { dni, nombre, email, password } = req.body;

  try {
    const user = await UserRepository.create({ dni, nombre, email, password });
    res.status(201).json({ user });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// Logout
app.post('/logout', (req, res) => {
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
app.get('/protected', authenticateToken, (req, res) => {
  const user = (req as any).user;
  res.json({ message: 'Protected resource', user });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
