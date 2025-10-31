// index.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { PORT } from './config'; // Asegúrate que la ruta al archivo sea correcta
import loginRoutes from './src/login'; // Importamos nuestro nuevo archivo de rutas
import proyectosRoutes from './src/routes/proyectos.routes';
import camionRoutes from './src/routes/camion.routes';

const app = express();

// Middlewares globales
app.use(cors({
  origin: 'http://localhost:4200', // El origen de tu frontend
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Le decimos a la app que use todas las rutas definidas en login.ts
// He agregado el prefijo '/api' por buena práctica.
app.use('/api', loginRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/camiones', camionRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Forzando el reinicio de nodemonn