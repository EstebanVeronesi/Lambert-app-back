import { pool } from '../../db';
import { ProyectoCompletoParaGuardar } from '../types/proyecto.types';

export class ProyectoRepository {

  // ==========================================================================
  // 1. LISTAR TODOS (ADMIN)
  // ==========================================================================
  static async findAll() {
    try {
      // --- QUERY 1: PEDIDOS ORIGINALES ---
      const queryOriginales = `
        SELECT 
          p.id, 
          c.razon_social as cliente, 
          cam.marca_camion || ' ' || cam.modelo_camion as camion,
          p.estado, 
          p.fecha_entrega,
          false as es_modificado,
          
          json_build_object(
            'distancia_entre_ejes', cc.distancia_entre_ejes,
            'distancia_primer_eje_espalda_cabina', cc.distancia_primer_eje_espalda_cabina,
            'voladizo_delantero', cc.voladizo_delantero,
            'voladizo_trasero', cc.voladizo_trasero,
            'peso_eje_delantero', cc.peso_eje_delantero,
            'peso_eje_trasero', cc.peso_eje_trasero,
            'pbt', cc.pbt,
            'ancho_chasis_1', cc.ancho_chasis_1,
            'ancho_chasis_2', cc.ancho_chasis_2
          ) as configuracion,

          json_build_object(
            'resultado_peso_bruto_total_maximo', calc.resultado_peso_bruto_total_maximo,
            'resultado_modificacion_chasis', calc.resultado_modificacion_chasis,
            'resultado_largo_final_camion', calc.resultado_largo_final_camion,
            'verificacion_distribucion_carga_ok', calc.verificacion_distribucion_carga_ok,
            'verificacion_voladizo_trasero_ok', calc.verificacion_voladizo_trasero_ok,
            'recomendaciones', calc.recomendaciones
          ) as calculos

        FROM pedido p
        JOIN cliente c ON p.fk_cuit_cliente = c.cuit
        JOIN camion cam ON p.fk_id_camion = cam.id
        LEFT JOIN LATERAL (
          SELECT * FROM camion_configuracion 
          WHERE fk_id_camion = cam.id 
          ORDER BY id DESC LIMIT 1
        ) cc ON true
        LEFT JOIN calculos calc ON calc.fk_id_pedido = p.id
      `;

      // --- QUERY 2: PEDIDOS MODIFICADOS ---
      const queryModificados = `
        SELECT 
          pm.id, 
          pm.cliente_razon_social as cliente, 
          cm.marca_camion || ' ' || cm.modelo_camion as camion, 
          pm.estado_proyecto as estado, 
          pm.fecha_entrega,
          true as es_modificado,
          
          json_build_object(
            'distancia_entre_ejes', conf_m.distancia_entre_ejes,
            'distancia_primer_eje_espalda_cabina', conf_m.distancia_primer_eje_espalda_cabina,
            'voladizo_delantero', conf_m.voladizo_delantero,
            'voladizo_trasero', conf_m.voladizo_trasero,
            'peso_eje_delantero', conf_m.peso_eje_delantero,
            'peso_eje_trasero', conf_m.peso_eje_trasero,
            'pbt', conf_m.pbt,
            'ancho_chasis_1', conf_m.ancho_chasis_1,
            'ancho_chasis_2', conf_m.ancho_chasis_2
          ) as configuracion,

          json_build_object(
            'resultado_peso_bruto_total_maximo', calc_m.resultado_peso_bruto_total_maximo,
            'resultado_modificacion_chasis', calc_m.resultado_modificacion_chasis,
            'resultado_largo_final_camion', calc_m.resultado_largo_final_camion,
            'verificacion_distribucion_carga_ok', calc_m.verificacion_distribucion_carga_ok,
            'verificacion_voladizo_trasero_ok', calc_m.verificacion_voladizo_trasero_ok,
            'recomendaciones', calc_m.recomendaciones
          ) as calculos

        FROM proyecto_modificado pm
        LEFT JOIN camion_modificado cm ON cm.fk_proyecto_modificado_id = pm.id
        LEFT JOIN LATERAL (
           SELECT * FROM configuracion_modificada WHERE fk_id_camion_modificado = cm.id ORDER BY id DESC LIMIT 1
        ) conf_m ON true
        LEFT JOIN calculos_modificado calc_m ON calc_m.fk_proyecto_modificado_id = pm.id
      `;

      const finalQuery = `${queryOriginales} UNION ALL ${queryModificados} ORDER BY id DESC`;
      
      const result = await pool.query(finalQuery);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw new Error('Error al listar los pedidos');
    }
  }

 // ==========================================================================
  // 2. BUSCAR POR ID (MEJORADO PARA SIMULACIÓN)
  // ==========================================================================
  static async findById(id: number, esModificado: boolean) {
    try {
      let query = '';
      
      if (!esModificado) {
        // --- PEDIDO ORIGINAL (Recuperamos TODO para poder re-simular) ---
        query = `
          SELECT 
            p.id, 
            c.razon_social, c.cuit, -- Datos Cliente
            p.estado, p.fecha_entrega, false as es_modificado,
            
            -- Datos Camión (Raw para el formulario)
            json_build_object(
                'id', cam.id, 'marca_camion', cam.marca_camion, 
                'modelo_camion', cam.modelo_camion, 'tipo_camion', cam.tipo_camion
            ) as camion,

            -- Configuración
            json_build_object(
              'distancia_entre_ejes', cc.distancia_entre_ejes,
              'distancia_primer_eje_espalda_cabina', cc.distancia_primer_eje_espalda_cabina,
              'voladizo_delantero', cc.voladizo_delantero, 'voladizo_trasero', cc.voladizo_trasero,
              'peso_eje_delantero', cc.peso_eje_delantero, 'peso_eje_trasero', cc.peso_eje_trasero,
              'pbt', cc.pbt, 'ancho_chasis_1', cc.ancho_chasis_1, 'ancho_chasis_2', cc.ancho_chasis_2,
              'es_modificado', false
            ) as configuracion,

            -- Carrocería (NECESARIA PARA RE-SIMULAR)
            json_build_object(
                'tipo_carroceria', carr.tipo_carroceria, 'largo_carroceria', carr.largo_carroceria,
                'alto_carroceria', carr.alto_carroceria, 'ancho_carroceria', carr.ancho_carroceria,
                'separacion_cabina_carroceria', carr.separacion_cabina_carroceria,
                'equipo_frio_marca_modelo', carr.equipo_frio_marca_modelo
            ) as carroceria,

            -- Cálculos Actuales
            row_to_json(calc.*) as calculos

          FROM pedido p
          JOIN cliente c ON p.fk_cuit_cliente = c.cuit
          JOIN camion cam ON p.fk_id_camion = cam.id
          LEFT JOIN LATERAL (SELECT * FROM camion_configuracion WHERE fk_id_camion = cam.id ORDER BY id DESC LIMIT 1) cc ON true
          LEFT JOIN carroceria carr ON carr.fk_id_pedido = p.id
          LEFT JOIN calculos calc ON calc.fk_id_pedido = p.id
          WHERE p.id = $1
        `;
      } else {
        // --- PEDIDO MODIFICADO ---
        query = `
          SELECT 
            pm.id, 
            pm.cliente_razon_social, pm.fk_cuit_cliente as cuit,
            pm.estado_proyecto as estado, pm.fecha_entrega, true as es_modificado,
            
            json_build_object(
                'marca_camion', cm.marca_camion, 'modelo_camion', cm.modelo_camion, 
                'tipo_camion', cm.tipo_camion, 'ano_camion', cm.ano_camion
            ) as camion,

            json_build_object(
              'distancia_entre_ejes', conf_m.distancia_entre_ejes,
              'distancia_primer_eje_espalda_cabina', conf_m.distancia_primer_eje_espalda_cabina,
              'voladizo_delantero', conf_m.voladizo_delantero, 'voladizo_trasero', conf_m.voladizo_trasero,
              'peso_eje_delantero', conf_m.peso_eje_delantero, 'peso_eje_trasero', conf_m.peso_eje_trasero,
              'pbt', conf_m.pbt, 'ancho_chasis_1', conf_m.ancho_chasis_1, 'ancho_chasis_2', conf_m.ancho_chasis_2,
              'es_modificado', true
            ) as configuracion,

            json_build_object(
                'tipo_carroceria', carr_m.tipo_carroceria, 'largo_carroceria', carr_m.largo_carroceria,
                'alto_carroceria', carr_m.alto_carroceria, 'ancho_carroceria', carr_m.ancho_carroceria,
                'separacion_cabina_carroceria', carr_m.separacion_cabina_carroceria,
                'equipo_frio_marca_modelo', carr_m.equipo_frio_marca_modelo
            ) as carroceria,

            row_to_json(calc_m.*) as calculos

          FROM proyecto_modificado pm
          LEFT JOIN camion_modificado cm ON cm.fk_proyecto_modificado_id = pm.id
          LEFT JOIN LATERAL (SELECT * FROM configuracion_modificada WHERE fk_id_camion_modificado = cm.id ORDER BY id DESC LIMIT 1) conf_m ON true
          LEFT JOIN carroceria_modificada carr_m ON carr_m.fk_proyecto_modificado_id = pm.id
          LEFT JOIN calculos_modificado calc_m ON calc_m.fk_proyecto_modificado_id = pm.id
          WHERE pm.id = $1
        `;
      }

      const result = await pool.query(query, [id]);
      return result.rows[0] || null;

    } catch (error) {
      console.error('Error al buscar pedido por ID:', error);
      throw new Error('Error al obtener el pedido');
    }
  }

  // ==========================================================================
  // 3. ACTUALIZAR PEDIDO (MEJORADO PARA GUARDAR RESULTADOS DE SIMULACIÓN)
  // ==========================================================================
  static async updatePedido(id: number, esModificado: boolean, data: any) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // A. CABECERA
      const tablaPedido = esModificado ? 'proyecto_modificado' : 'pedido';
      const colEstado = esModificado ? 'estado_proyecto' : 'estado';
      
      if (data.estado !== undefined || data.fecha_entrega !== undefined) {
        const updateHeader = `
          UPDATE ${tablaPedido} 
          SET ${colEstado} = COALESCE($1, ${colEstado}), 
              fecha_entrega = COALESCE($2, fecha_entrega)
          WHERE id = $3
        `;
        await client.query(updateHeader, [data.estado, data.fecha_entrega, id]);
      }

      // B. CARROCERÍA (Si cambió en la simulación)
      if (data.carroceria) {
        const tablaCarr = esModificado ? 'carroceria_modificada' : 'carroceria';
        const fkColCarr = esModificado ? 'fk_proyecto_modificado_id' : 'fk_id_pedido';
        const c = data.carroceria;
        
        await client.query(`
          UPDATE ${tablaCarr} SET 
            tipo_carroceria = COALESCE($1, tipo_carroceria), largo_carroceria = COALESCE($2, largo_carroceria),
            alto_carroceria = COALESCE($3, alto_carroceria), ancho_carroceria = COALESCE($4, ancho_carroceria),
            separacion_cabina_carroceria = COALESCE($5, separacion_cabina_carroceria)
          WHERE ${fkColCarr} = $6
        `, [c.tipo_carroceria, c.largo_carroceria, c.alto_carroceria, c.ancho_carroceria, c.separacion_cabina_carroceria, id]);
      }

      // C. CONFIGURACIÓN (Solo si es Modificado, los originales no se tocan por acá)
      if (esModificado && data.configuracion) {
          // Obtener ID de camión modificado
          const resCamion = await client.query(`SELECT id FROM camion_modificado WHERE fk_proyecto_modificado_id = $1`, [id]);
          if (resCamion.rows.length > 0) {
              const conf = data.configuracion;
              await client.query(`
                  UPDATE configuracion_modificada SET
                    distancia_entre_ejes = COALESCE($1, distancia_entre_ejes),
                    distancia_primer_eje_espalda_cabina = COALESCE($2, distancia_primer_eje_espalda_cabina),
                    voladizo_delantero = COALESCE($3, voladizo_delantero),
                    voladizo_trasero = COALESCE($4, voladizo_trasero),
                    peso_eje_delantero = COALESCE($5, peso_eje_delantero),
                    peso_eje_trasero = COALESCE($6, peso_eje_trasero),
                    pbt = COALESCE($7, pbt)
                  WHERE fk_id_camion_modificado = $8
              `, [conf.distancia_entre_ejes, conf.distancia_primer_eje_espalda_cabina, conf.voladizo_delantero, conf.voladizo_trasero, conf.peso_eje_delantero, conf.peso_eje_trasero, conf.pbt, resCamion.rows[0].id]);
          }
      }

      // D. CÁLCULOS (ACTUALIZAR TODO EL RESULTADO DE LA SIMULACIÓN)
      if (data.resultados) {
        const tablaCalculos = esModificado ? 'calculos_modificado' : 'calculos';
        const fkColCalc = esModificado ? 'fk_proyecto_modificado_id' : 'fk_id_pedido';
        const r = data.resultados;

        // Actualizamos TODAS las columnas importantes de cálculo
        const updateCalculos = `
          UPDATE ${tablaCalculos}
          SET 
            resultado_peso_bruto_total_maximo = COALESCE($1, resultado_peso_bruto_total_maximo),
            resultado_carga_maxima_eje_delantero = COALESCE($2, resultado_carga_maxima_eje_delantero),
            resultado_carga_maxima_eje_trasero = COALESCE($3, resultado_carga_maxima_eje_trasero),
            resultado_carga_total_calculada = COALESCE($4, resultado_carga_total_calculada),
            resultado_carga_eje_delantero_calculada = COALESCE($5, resultado_carga_eje_delantero_calculada),
            resultado_carga_eje_trasero_calculada = COALESCE($6, resultado_carga_eje_trasero_calculada),
            resultado_porcentaje_carga_eje_delantero = COALESCE($7, resultado_porcentaje_carga_eje_delantero),
            resultado_modificacion_chasis = COALESCE($8, resultado_modificacion_chasis),
            resultado_voladizo_trasero_calculado = COALESCE($9, resultado_voladizo_trasero_calculado),
            resultado_largo_final_camion = COALESCE($10, resultado_largo_final_camion),
            verificacion_distribucion_carga_ok = COALESCE($11, verificacion_distribucion_carga_ok),
            verificacion_voladizo_trasero_ok = COALESCE($12, verificacion_voladizo_trasero_ok),
            recomendaciones = COALESCE($13, recomendaciones)
          WHERE ${fkColCalc} = $14
        `;

        await client.query(updateCalculos, [
          r.resultado_peso_bruto_total_maximo, r.resultado_carga_maxima_eje_delantero, r.resultado_carga_maxima_eje_trasero,
          r.resultado_carga_total_calculada, r.resultado_carga_eje_delantero_calculada, r.resultado_carga_eje_trasero_calculada,
          r.resultado_porcentaje_carga_eje_delantero, r.resultado_modificacion_chasis, r.resultado_voladizo_trasero_calculado,
          r.resultado_largo_final_camion, r.verificacion_distribucion_carga_ok, r.verificacion_voladizo_trasero_ok,
          r.recomendaciones,
          id
        ]);
      }

      await client.query('COMMIT');
      return { message: 'Pedido actualizado correctamente', id };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error actualizando pedido:', error);
      throw new Error('No se pudo actualizar el pedido');
    } finally {
      client.release();
    }
  }
  // ==========================================================================
  // 3. CREAR PROYECTO (Punto de Entrada)
  // ==========================================================================
  static async create(proyecto: ProyectoCompletoParaGuardar): Promise<any> {
    const { datosEntrada } = proyecto;

    // Usamos (configuracion as any) por si TypeScript se queja de que 'es_modificado' no existe en el type
    if ((datosEntrada.configuracion as any).es_modificado) {
      return this.createModificado(proyecto);
    } else {
      return this.createVerificado(proyecto);
    }
  }

  // ==========================================================================
  // 4. CREAR MODIFICADO
  // ==========================================================================
  private static async createModificado(proyecto: ProyectoCompletoParaGuardar): Promise<any> {
    const { datosEntrada, resultados } = proyecto;
    const { cliente, vendedor, camion, configuracion, carroceria } = datosEntrada;

    // Casteamos a any si faltan propiedades en el type estricto pero existen en el objeto
    const configAny = configuracion as any; 

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Proyecto Modificado
      const proyectoQuery = `
        INSERT INTO proyecto_modificado (fk_id_vendedor, fk_cuit_cliente, cliente_razon_social, estado_proyecto, created_at)
        VALUES ($1, $2, $3, 'Pendiente', NOW()) RETURNING id;
      `;
      const proyectoRes = await client.query(proyectoQuery, [vendedor.id, cliente.cuit, cliente.razon_social]);
      const proyectoModificadoId = proyectoRes.rows[0].id;

      // 2. Camión Modificado
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

      // 3. Configuración Modificada (Solo campos básicos + anchos si existen)
      const configQuery = `
        INSERT INTO configuracion_modificada (
          fk_id_camion_modificado, distancia_entre_ejes, distancia_primer_eje_espalda_cabina, 
          voladizo_delantero, voladizo_trasero, peso_eje_delantero, 
          peso_eje_trasero, pbt, ancho_chasis_1, ancho_chasis_2
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
      `;
      await client.query(configQuery, [
        camionModificadoId, 
        configuracion.distancia_entre_ejes, configuracion.distancia_primer_eje_espalda_cabina, 
        configuracion.voladizo_delantero, configuracion.voladizo_trasero, 
        configuracion.peso_eje_delantero, configuracion.peso_eje_trasero, 
        configuracion.pbt,
        configAny.ancho_chasis_1 || 850, // Valor por defecto si no viene
        configAny.ancho_chasis_2 ?? null
      ]);

      // 4. Carrocería Modificada
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
      
      // 5. Cálculos Modificados (SOLO LOS CAMPOS QUE DEVUELVE TU SERVICIO)
      const calculosQuery = `
        INSERT INTO calculos_modificado (
          fk_proyecto_modificado_id, 
          resultado_peso_bruto_total_maximo, 
          resultado_carga_eje_delantero_calculada, 
          resultado_carga_eje_trasero_calculada, 
          resultado_porcentaje_carga_eje_delantero, 
          resultado_modificacion_chasis, 
          resultado_voladizo_trasero_calculado, 
          resultado_largo_final_camion, 
          verificacion_distribucion_carga_ok, 
          verificacion_voladizo_trasero_ok, 
          recomendaciones
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING id;
      `;
      
      const calculosRes = await client.query(calculosQuery, [
        proyectoModificadoId, 
        resultados.resultado_peso_bruto_total_maximo, 
        resultados.resultado_carga_eje_delantero_calculada, 
        resultados.resultado_carga_eje_trasero_calculada, 
        resultados.resultado_porcentaje_carga_eje_delantero, 
        resultados.resultado_modificacion_chasis, 
        resultados.resultado_voladizo_trasero_calculado, 
        resultados.resultado_largo_final_camion, 
        resultados.verificacion_distribucion_carga_ok, 
        resultados.verificacion_voladizo_trasero_ok, 
        resultados.recomendaciones
      ]);

      await client.query('COMMIT');
      return { pedido_id: proyectoModificadoId, calculo_id: calculosRes.rows[0].id, tipo: 'modificado' };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error en transacción (Modificado):", error);
      throw new Error("No se pudo guardar el proyecto modificado.");
    } finally {
      client.release();
    }
  }


  /**
   * ==========================================================================
   * 5. CREAR VERIFICADO
   * ==========================================================================
   */
  private static async createVerificado(proyecto: ProyectoCompletoParaGuardar): Promise<any> {
    const { datosEntrada, resultados } = proyecto;
    const { cliente, vendedor, camion, configuracion, carroceria } = datosEntrada;

    // Casteamos a any para acceder a propiedades que quizás no están en el type estricto
    const configAny = configuracion as any;
    let camionId: number;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Cliente
      const clienteQuery = `
        INSERT INTO cliente (cuit, razon_social) VALUES ($1, $2)
        ON CONFLICT (cuit) DO UPDATE SET razon_social = $2;
      `;
      await client.query(clienteQuery, [cliente.cuit, cliente.razon_social]);

      // 2. Camión
      if (camion.id) {
        camionId = camion.id;
      } else if (camion.marca_camion && camion.modelo_camion) {
        const upsertCamionQuery = `
          INSERT INTO camion (marca_camion, modelo_camion, ano_camion, tipo_camion)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (marca_camion, modelo_camion, ano_camion) 
          DO UPDATE SET marca_camion = EXCLUDED.marca_camion
          RETURNING id;
        `;
        const camionRes = await client.query(upsertCamionQuery, [
          camion.marca_camion, camion.modelo_camion, camion.ano_camion, camion.tipo_camion
        ]);
        camionId = camionRes.rows[0].id;
      } else {
        throw new Error("Datos de camión incompletos.");
      }

      // 3. Configuración
      const configQuery = `
        INSERT INTO camion_configuracion (
          fk_id_camion, distancia_entre_ejes, distancia_primer_eje_espalda_cabina, 
          voladizo_delantero, voladizo_trasero, peso_eje_delantero, 
          peso_eje_trasero, pbt, es_modificado, ancho_chasis_1, ancho_chasis_2, 
          original
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
      `;
      await client.query(configQuery, [
        camionId, 
        configuracion.distancia_entre_ejes, configuracion.distancia_primer_eje_espalda_cabina,
        configuracion.voladizo_delantero, configuracion.voladizo_trasero, 
        configuracion.peso_eje_delantero, configuracion.peso_eje_trasero, 
        configuracion.pbt, 
        false,
        configAny.ancho_chasis_1 || 850,
        configAny.ancho_chasis_2 ?? null,
        configAny.original ?? true
      ]);

      // 4. Pedido
      const pedidoQuery = `
        INSERT INTO pedido (fk_id_camion, fk_cuit_cliente, fk_id_vendedor, estado, fecha_pedido)
        VALUES ($1, $2, $3, 'Pendiente', NOW()) RETURNING id;
      `;
      const pedidoRes = await client.query(pedidoQuery, [camionId, cliente.cuit, vendedor.id]);
      const pedidoId = pedidoRes.rows[0].id;

      // 5. Carrocería
      const carroceriaQuery = `
        INSERT INTO carroceria (
          fk_id_pedido, tipo_carroceria, largo_carroceria, alto_carroceria, 
          ancho_carroceria, separacion_cabina_carroceria, equipo_frio_marca_modelo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;
      await client.query(carroceriaQuery, [
        pedidoId, carroceria.tipo_carroceria, carroceria.largo_carroceria, 
        carroceria.alto_carroceria, carroceria.ancho_carroceria, 
        carroceria.separacion_cabina_carroceria, carroceria.equipo_frio_marca_modelo
      ]);

      // 6. Cálculos (SOLO LOS CAMPOS BÁSICOS QUE DEVUELVE EL SERVICIO)
      const calculosQuery = `
        INSERT INTO calculos (
          fk_id_pedido, 
          resultado_peso_bruto_total_maximo, 
          resultado_carga_eje_delantero_calculada, 
          resultado_carga_eje_trasero_calculada, 
          resultado_porcentaje_carga_eje_delantero, 
          resultado_modificacion_chasis, 
          resultado_voladizo_trasero_calculado, 
          resultado_largo_final_camion, 
          verificacion_distribucion_carga_ok, 
          verificacion_voladizo_trasero_ok, 
          recomendaciones
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING id;
      `;
      const calculosRes = await client.query(calculosQuery, [
        pedidoId, 
        resultados.resultado_peso_bruto_total_maximo, 
        resultados.resultado_carga_eje_delantero_calculada, 
        resultados.resultado_carga_eje_trasero_calculada, 
        resultados.resultado_porcentaje_carga_eje_delantero, 
        resultados.resultado_modificacion_chasis, 
        resultados.resultado_voladizo_trasero_calculado, 
        resultados.resultado_largo_final_camion, 
        resultados.verificacion_distribucion_carga_ok, 
        resultados.verificacion_voladizo_trasero_ok, 
        resultados.recomendaciones
      ]);

      await client.query('COMMIT');
      return { pedido_id: pedidoId, calculo_id: calculosRes.rows[0].id, tipo: 'verificado' };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error en transacción (Verificado):", error);
      throw new Error("No se pudo guardar el proyecto. La operación fue revertida.");
    } finally {
      client.release();
    }
  }
}