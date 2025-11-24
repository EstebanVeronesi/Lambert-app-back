// src/controllers/camion.controller.ts
import { Request, Response } from 'express';
// ¡Asegúrate de que esta importación esté aquí!
import { CamionRepository } from '../repositories/camion.repository';

// Controlador para GET /api/camiones
export const getCamionesVerificados = async (req: Request, res: Response) => {
  try {
    const camiones = await CamionRepository.findVerificados();
    res.status(200).json(camiones);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para POST /api/camiones
export const crearCamion = async (req: Request, res: Response) => {
  try {
    const datosCamion = req.body;
    // Aquí podrías validar que vengan todos los campos necesarios
    
    const resultado = await CamionRepository.create(datosCamion);
    res.status(201).json(resultado);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para GET /api/camiones/configuracion/:id
export const getConfiguracionPorCamionId = async (req: Request, res: Response) => {
  try {
    const camionId = parseInt(req.params.id, 10);
    if (isNaN(camionId)) {
      return res.status(400).json({ error: 'ID de camión inválido.' });
    }

    const configuracion = await CamionRepository.findConfiguracionByCamionId(camionId);

    if (!configuracion) {
      return res.status(404).json({ error: 'No se encontró una configuración verificada para este camión.' });
    }
    
    res.status(200).json(configuracion);

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};