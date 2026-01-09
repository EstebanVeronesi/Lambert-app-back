import { Request, Response } from 'express';

export const checkLoginStatus = (req: Request, res: Response) => {
  // 1. Primero extraemos el usuario (variable afuera)
  const user = (req as any).user;

  // 2. Luego enviamos la respuesta usando esa variable
  res.json({ 
    loggedIn: true, 
    user: user // Aquí asignamos la variable a la propiedad 'user'
  });
};