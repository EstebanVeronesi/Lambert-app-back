// src/repositories/camion.repository.ts
import { pool } from '../../db';

// Tipo para la lista de camiones 
export interface CamionVerificado {
  id: number;
  marca_camion: string;
  modelo_camion: string;
  ano_camion: string;
  tipo_camion: string;
}

// Interface para el body del request de nuevo camión
export interface NuevoCamion {
  marca_camion: string;
  modelo_camion: string;
  ano_camion: string;
  tipo_camion: string;
  configuracion: ConfiguracionCamion;
}

// Tipo completo para la configuración (Incluye anchos)
export interface ConfiguracionCamion {
  distancia_entre_ejes: number;
  distancia_primer_eje_espalda_cabina: number;
  voladizo_delantero: number;
  voladizo_trasero: number;
  peso_eje_delantero: number;
  peso_eje_trasero: number;
  pbt: number;
  // Campos nuevos necesarios
  ancho_chasis_1: number;       // NOT NULL en tu DB
  ancho_chasis_2?: number | null;
  original?: boolean;
  es_modificado?: boolean;
}

export class CamionRepository {

  static async findVerificados(): Promise<CamionVerificado[]> {
    try {
      const query = `
        SELECT id, marca_camion, modelo_camion, ano_camion, tipo_camion 
        FROM camion
        WHERE estado_verificacion = 'verificado' OR estado_verificacion IS NULL
        ORDER BY marca_camion, modelo_camion;
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error al buscar camiones verificados:", error);
      throw new Error("No se pudo obtener la lista de camiones.");
    }
  }

  static async findConfiguracionByCamionId(camionId: number): Promise<ConfiguracionCamion | null> {
    try {
      const query = `
        SELECT 
          distancia_entre_ejes,
          distancia_primer_eje_espalda_cabina,
          voladizo_delantero,
          voladizo_trasero,
          peso_eje_delantero,
          peso_eje_trasero,
          pbt,
          ancho_chasis_1,
          ancho_chasis_2,
          original,
          es_modificado
        FROM camion_configuracion
        WHERE 
          fk_id_camion = $1 AND
          es_modificado = false
        ORDER BY id DESC
        LIMIT 1;
      `;
      
      const result = await pool.query(query, [camionId]);
      if (result.rows.length === 0) return null;
      return result.rows[0];

    } catch (error) {
      console.error(`Error al buscar configuración para el camión ID ${camionId}:`, error);
      throw new Error("No se pudo obtener la configuración del camión.");
    }
  }

  // --- MÉTODO CREATE CORREGIDO ---
  static async create(nuevoCamion: NuevoCamion): Promise<any> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insertar Camion
      const camionQuery = `
        INSERT INTO camion (marca_camion, modelo_camion, ano_camion, tipo_camion, estado_verificacion)
        VALUES ($1, $2, $3, $4, 'verificado') 
        RETURNING id;
      `;
      const camionRes = await client.query(camionQuery, [
        nuevoCamion.marca_camion,
        nuevoCamion.modelo_camion,
        nuevoCamion.ano_camion,
        nuevoCamion.tipo_camion
      ]);
      const camionId = camionRes.rows[0].id;

      // 2. Insertar Configuración (INCLUYENDO anchos y flags)
      const config = nuevoCamion.configuracion;
      const configQuery = `
        INSERT INTO camion_configuracion (
          fk_id_camion, 
          distancia_entre_ejes, distancia_primer_eje_espalda_cabina, 
          voladizo_delantero, voladizo_trasero, 
          peso_eje_delantero, peso_eje_trasero, pbt,
          ancho_chasis_1, ancho_chasis_2,
          original, es_modificado
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12);
      `;
      
      await client.query(configQuery, [
        camionId,
        config.distancia_entre_ejes,
        config.distancia_primer_eje_espalda_cabina,
        config.voladizo_delantero,
        config.voladizo_trasero,
        config.peso_eje_delantero,
        config.peso_eje_trasero,
        config.pbt,
        config.ancho_chasis_1,        // <-- ¡ESTO FALTABA!
        config.ancho_chasis_2 ?? null,
        config.original ?? true,
        config.es_modificado ?? false
      ]);

      await client.query('COMMIT');
      return { message: 'Camión creado exitosamente', id: camionId };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error creando camión:", error);
      throw error;
    } finally {
      client.release();
    }
  }
}