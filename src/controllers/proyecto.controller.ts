// src/controllers/proyecto.controller.ts
import { Request, Response } from 'express';
import { ProyectoService } from '../services/proyecto.service';
import { DatosFormularioProyecto, ProyectoCompletoParaGuardar } from '../types/proyecto.types';

// ¡Este archivo NO debe importar 'CamionRepository'!

const proyectoService = new ProyectoService();

export const simularCalculo = async (req: Request, res: Response) => {
  try {
    const datosDeEntrada: DatosFormularioProyecto = req.body;
    const resultadoSimulacion = await proyectoService.generarSimulacion(datosDeEntrada);
    res.status(200).json(resultadoSimulacion);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const guardarProyecto = async (req: Request, res: Response) => {
  try {
    const proyectoCompleto: ProyectoCompletoParaGuardar = req.body;
    const resultadoGuardado = await proyectoService.guardarProyectoCompleto(proyectoCompleto);
    res.status(201).json(resultadoGuardado);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --- La función 'getConfiguracionPorCamionId' NO va en este archivo ---