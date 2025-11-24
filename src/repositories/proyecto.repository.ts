// src/repositories/proyecto.repository.ts
import { pool } from '../../db';
import { ProyectoCompletoParaGuardar } from '../types/proyecto.types';

export class ProyectoRepository {

  /**
   * Punto de entrada principal para guardar.
   */
  static async create(proyecto: ProyectoCompletoParaGuardar): Promise<any> {
    const { datosEntrada } = proyecto;

    if (datosEntrada.configuracion.es_modificado) {
      console.log("[DEBUG] Repositorio: Detectado 'es_modificado: true'. Llamando a createModificado.");
      return this.createModificado(proyecto);
    } else {
      console.log("[DEBUG] Repositorio: Detectado 'es_modificado: false'. Llamando a createVerificado.");
      return this.createVerificado(proyecto);
    }
  }

  /**
   * FLUJO OPCIÓN 2: Camión Modificado
   * La configuración ahora apuntará al 'camion_modificado'.
   */
  private static async createModificado(proyecto: ProyectoCompletoParaGuardar): Promise<any> {
    const { datosEntrada, resultados } = proyecto;
    const { cliente, vendedor, camion, configuracion, carroceria } = datosEntrada;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Crear el 'proyecto_modificado' (Equivalente a Pedido)
      const proyectoQuery = `
        INSERT INTO proyecto_modificado (fk_id_vendedor, fk_cuit_cliente, cliente_razon_social)
        VALUES ($1, $2, $3) RETURNING id;
      `;
      const proyectoRes = await client.query(proyectoQuery, [vendedor.id, cliente.cuit, cliente.razon_social]);
      const proyectoModificadoId = proyectoRes.rows[0].id;

      // 2. Insertar en 'camion_modificado' y OBTENER ID
      // Ahora necesitamos el ID para vincular la configuración
      const camionQuery = `
        INSERT INTO camion_modificado (
          fk_proyecto_modificado_id, marca_camion, modelo_camion, ano_camion, tipo_camion
        ) VALUES ($1, $2, $3, $4, $5) RETURNING id; 
      `;
      const camionRes = await client.query(camionQuery, [
        proyectoModificadoId, camion.marca_camion, camion.modelo_camion, 
        camion.ano_camion, camion.tipo_camion
      ]);
      const camionModificadoId = camionRes.rows[0].id;

      // 3. Insertar en 'configuracion_modificada'
      // CAMBIO: Ahora usa fk_id_camion_modificado en lugar del id del proyecto
      const configQuery = `
        INSERT INTO configuracion_modificada (
          fk_id_camion_modificado, distancia_entre_ejes, distancia_primer_eje_espalda_cabina, 
          voladizo_delantero, voladizo_trasero, peso_eje_delantero, 
          peso_eje_trasero, pbt
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `;
      await client.query(configQuery, [
        camionModificadoId, // <-- Apunta al camión
        configuracion.distancia_entre_ejes, 
        configuracion.distancia_primer_eje_espalda_cabina, 
        configuracion.voladizo_delantero, configuracion.voladizo_trasero, 
        configuracion.peso_eje_delantero, configuracion.peso_eje_trasero, 
        configuracion.pbt
      ]);

      // 4. Insertar en 'carroceria_modificada' (Sigue vinculada al proyecto/pedido)
      const carroceriaQuery = `
        INSERT INTO carroceria_modificada (
          fk_proyecto_modificado_id, tipo_carroceria, largo_carroceria, alto_carroceria, 
          ancho_carroceria, separacion_cabina_carroceria, equipo_frio_marca_modelo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;
      await client.query(carroceriaQuery, [
          proyectoModificadoId, carroceria.tipo_carroceria, carroceria.largo_carroceria,
          carroceria.alto_carroceria, carroceria.ancho_carroceria,
          carroceria.separacion_cabina_carroceria, carroceria.equipo_frio_marca_modelo
      ]);
      
      // 5. Insertar en 'calculos_modificado'
      const calculosQuery = `
        INSERT INTO calculos_modificado (
          fk_proyecto_modificado_id, resultado_peso_bruto_total_maximo, resultado_carga_maxima_eje_delantero, 
          resultado_carga_maxima_eje_trasero, resultado_carga_total_calculada, resultado_carga_eje_delantero_calculada, 
          resultado_carga_eje_trasero_calculada, resultado_porcentaje_carga_eje_delantero, resultado_modificacion_chasis, 
          resultado_voladizo_trasero_calculado, resultado_largo_final_camion, resultado_centro_carga_total, 
          resultado_centro_carga_carroceria, resultado_nueva_distancia_entre_ejes, resultado_desplazamiento_eje, 
          verificacion_distribucion_carga_ok, verificacion_voladizo_trasero_ok, recomendaciones
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING id;
      `;
      
      const calculosRes = await client.query(calculosQuery, [
        proyectoModificadoId, resultados.resultado_peso_bruto_total_maximo, resultados.resultado_carga_maxima_eje_delantero, 
        resultados.resultado_carga_maxima_eje_trasero, resultados.resultado_carga_total_calculada, resultados.resultado_carga_eje_delantero_calculada, 
        resultados.resultado_carga_eje_trasero_calculada, resultados.resultado_porcentaje_carga_eje_delantero, resultados.resultado_modificacion_chasis, 
        resultados.resultado_voladizo_trasero_calculado, resultados.resultado_largo_final_camion, resultados.resultado_centro_carga_total, 
        resultados.resultado_centro_carga_carroceria, resultados.resultado_nueva_distancia_entre_ejes, resultados.resultado_desplazamiento_eje, 
        resultados.verificacion_distribucion_carga_ok, resultados.verificacion_voladizo_trasero_ok, resultados.recomendaciones
      ]);

      await client.query('COMMIT');
      
      return { 
        mensaje: "Proyecto Modificado guardado correctamente", 
        id_proyecto_modificado: proyectoModificadoId,
        id_calculo_modificado: calculosRes.rows[0].id 
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error en transacción (Modificado), rollback ejecutado:", error);
      throw new Error("No se pudo guardar el proyecto modificado.");
    } finally {
      client.release();
    }
  }


  /**
   * FLUJO OPCIÓN 1: Camión Verificado
   * La configuración ahora apuntará a la tabla 'camion'.
   */
  private static async createVerificado(proyecto: ProyectoCompletoParaGuardar): Promise<any> {
    const { datosEntrada, resultados } = proyecto;
    const { cliente, vendedor, camion, configuracion, carroceria } = datosEntrada;

    let camionId: number;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Insertar o actualizar cliente
      const clienteQuery = `
        INSERT INTO cliente (cuit, razon_social) VALUES ($1, $2)
        ON CONFLICT (cuit) DO UPDATE SET razon_social = $2;
      `;
      await client.query(clienteQuery, [cliente.cuit, cliente.razon_social]);


      // 2. Determinar el ID del camión
      if (camion.id) {
        console.log(`[DEBUG] Repositorio (Verificado): Usando ID de camión existente: ${camion.id}`);
        camionId = camion.id;
        
        // Verificar existencia
        const verifyQuery = `SELECT 1 FROM camion WHERE id = $1`;
        const verifyRes = await client.query(verifyQuery, [camionId]);
        if (verifyRes.rows.length === 0) {
          throw new Error(`El ID de camión ${camionId} no existe.`);
        }
        
      } else if (camion.marca_camion && camion.modelo_camion && camion.ano_camion) {
        console.log(`[DEBUG] Repositorio (Verificado): Buscando o creando camión por nombre...`);
        
        const upsertCamionQuery = `
          INSERT INTO camion (marca_camion, modelo_camion, ano_camion, tipo_camion)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (marca_camion, modelo_camion, ano_camion) 
          DO UPDATE SET marca_camion = EXCLUDED.marca_camion
          RETURNING id;
        `;
        const camionRes = await client.query(upsertCamionQuery, [
          camion.marca_camion, 
          camion.modelo_camion, 
          camion.ano_camion,
          camion.tipo_camion
        ]);
        camionId = camionRes.rows[0].id;

      } else {
        throw new Error("Datos de camión incompletos.");
      }

      // 3. Insertar la configuración (CAMBIO IMPORTANTE: Ahora usa fk_id_camion)
      const configQuery = `
        INSERT INTO camion_configuracion (
          fk_id_camion, distancia_entre_ejes, distancia_primer_eje_espalda_cabina, 
          voladizo_delantero, voladizo_trasero, peso_eje_delantero, 
          peso_eje_trasero, pbt, es_modificado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `;
      await client.query(configQuery, [
        camionId, // <-- Ahora apuntamos al camión, no al pedido
        configuracion.distancia_entre_ejes, configuracion.distancia_primer_eje_espalda_cabina,
        configuracion.voladizo_delantero, configuracion.voladizo_trasero, 
        configuracion.peso_eje_delantero, configuracion.peso_eje_trasero, 
        configuracion.pbt, false 
      ]);

      // 4. Insertar el pedido (Vinculado al camión)
      const pedidoQuery = `
        INSERT INTO pedido (fk_id_camion, fk_cuit_cliente, fk_id_vendedor)
        VALUES ($1, $2, $3) RETURNING id;
      `;
      const pedidoRes = await client.query(pedidoQuery, [camionId, cliente.cuit, vendedor.id]);
      const pedidoId = pedidoRes.rows[0].id;

      // 5. Insertar la carrocería (Sigue vinculada al pedido)
      const carroceriaQuery = `
        INSERT INTO carroceria (fk_id_pedido, tipo_carroceria, largo_carroceria, alto_carroceria, ancho_carroceria, separacion_cabina_carroceria, equipo_frio_marca_modelo)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;
      await client.query(carroceriaQuery, [
        pedidoId, carroceria.tipo_carroceria, carroceria.largo_carroceria, 
        carroceria.alto_carroceria, carroceria.ancho_carroceria, 
        carroceria.separacion_cabina_carroceria, carroceria.equipo_frio_marca_modelo
      ]);

      // 6. Insertar los cálculos (Vinculados al pedido)
      const calculosQuery = `
        INSERT INTO calculos (
          fk_id_pedido, resultado_peso_bruto_total_maximo, resultado_carga_maxima_eje_delantero, 
          resultado_carga_maxima_eje_trasero, resultado_carga_total_calculada, resultado_carga_eje_delantero_calculada, 
          resultado_carga_eje_trasero_calculada, resultado_porcentaje_carga_eje_delantero, resultado_modificacion_chasis, 
          resultado_voladizo_trasero_calculado, resultado_largo_final_camion, resultado_centro_carga_total, 
          resultado_centro_carga_carroceria, resultado_nueva_distancia_entre_ejes, resultado_desplazamiento_eje, 
          verificacion_distribucion_carga_ok, verificacion_voladizo_trasero_ok, recomendaciones
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
        RETURNING id;
      `;
      const calculosRes = await client.query(calculosQuery, [
        pedidoId, resultados.resultado_peso_bruto_total_maximo, resultados.resultado_carga_maxima_eje_delantero, 
        resultados.resultado_carga_maxima_eje_trasero, resultados.resultado_carga_total_calculada, resultados.resultado_carga_eje_delantero_calculada, 
        resultados.resultado_carga_eje_trasero_calculada, resultados.resultado_porcentaje_carga_eje_delantero, resultados.resultado_modificacion_chasis, 
        resultados.resultado_voladizo_trasero_calculado, resultados.resultado_largo_final_camion, resultados.resultado_centro_carga_total, 
        resultados.resultado_centro_carga_carroceria, resultados.resultado_nueva_distancia_entre_ejes, resultados.resultado_desplazamiento_eje, 
        resultados.verificacion_distribucion_carga_ok, resultados.verificacion_voladizo_trasero_ok, resultados.recomendaciones
      ]);

      await client.query('COMMIT');
      
      return { pedido_id: pedidoId, calculo_id: calculosRes.rows[0].id };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error en transacción (Verificado), rollback ejecutado:", error);
      throw new Error("No se pudo guardar el proyecto. La operación fue revertida.");
    } finally {
      client.release();
    }
  }
}