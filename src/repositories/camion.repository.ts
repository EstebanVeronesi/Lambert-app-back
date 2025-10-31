// src/repositories/camion.repository.ts
import { pool } from '../../db';

// Tipo para la lista de camiones (ya existe)
export interface CamionVerificado {
  id: number;
  marca_camion: string;
  modelo_camion: string;
  ano_camion: string;
}

// --- ¡NUEVO TIPO AÑADIDO! ---
// Tipo para la configuración de un camión
export interface ConfiguracionCamion {
  distancia_entre_ejes: number;
  distancia_primer_eje_espalda_cabina: number;
  voladizo_delantero: number;
  voladizo_trasero: number;
  peso_eje_delantero: number;
  peso_eje_trasero: number;
  pbt: number;
}

export class CamionRepository {

  /**
   * Busca en la BD todos los camiones que están marcados como 'verificado'.
   * (Esta función ya existe)
   */
  static async findVerificados(): Promise<CamionVerificado[]> {
    try {
      const query = `
        SELECT id, marca_camion, modelo_camion, ano_camion 
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

  // --- ¡NUEVA FUNCIÓN AÑADIDA! ---
  /**
   * Busca la configuración más reciente de un camión verificado específico.
   * Se une con 'pedido' para encontrar el ID de camión y se ordena por el ID de pedido
   * más alto (el más reciente) que NO sea modificado.
   */
  static async findConfiguracionByCamionId(camionId: number): Promise<ConfiguracionCamion | null> {
    try {
      const query = `
        SELECT 
          cc.distancia_entre_ejes,
          cc.distancia_primer_eje_espalda_cabina,
          cc.voladizo_delantero,
          cc.voladizo_trasero,
          cc.peso_eje_delantero,
          cc.peso_eje_trasero,
          cc.pbt
        FROM camion_configuracion cc
        JOIN pedido p ON cc.fk_id_pedido = p.id
        WHERE 
          p.fk_id_camion = $1 AND
          cc.es_modificado = false
        ORDER BY
          p.id DESC -- Ordenamos por el pedido más reciente
        LIMIT 1;     -- Solo queremos la última configuración usada
      `;
      const result = await pool.query(query, [camionId]);

      if (result.rows.length === 0) {
        // No se encontró una configuración previa para este camión
        return null;
      }
      
      // Devuelve los datos de configuración
      return result.rows[0];

    } catch (error) {
      console.error(`Error al buscar configuración para el camión ID ${camionId}:`, error);
      throw new Error("No se pudo obtener la configuración del camión.");
    }
  }
}