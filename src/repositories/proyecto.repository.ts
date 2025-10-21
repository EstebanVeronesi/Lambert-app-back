// src/repositories/proyecto.repository.ts
import { pool } from '../../db';
import { ProyectoCompletoParaGuardar } from '../types/proyecto.types';

export class ProyectoRepository {
  /**
   * Crea un proyecto completo (cliente, camion, pedido, config, carrocería y cálculo)
   * utilizando una transacción de base de datos para garantizar la integridad de los datos.
   * Si alguna de las inserciones falla, se revierten todos los cambios.
   */
  static async create(proyecto: ProyectoCompletoParaGuardar): Promise<any> {
    const { datosEntrada, resultados } = proyecto;
    const { cliente, vendedor, camion, configuracion, carroceria } = datosEntrada;

    // Obtenemos un "cliente" de la pool de conexiones. Esto es esencial para las transacciones.
    const client = await pool.connect();

    try {
      // 1. Iniciar la transacción
      await client.query('BEGIN');

      // 2. Insertar o actualizar el cliente (UPSERT)
      const clienteQuery = `
        INSERT INTO cliente (cuit, razon_social) VALUES ($1, $2)
        ON CONFLICT (cuit) DO UPDATE SET razon_social = $2;
      `;
      await client.query(clienteQuery, [cliente.cuit, cliente.razon_social]);

      // 3. Insertar el camión y obtener su ID
      const camionQuery = `
        INSERT INTO camion (marca_camion, modelo_camion, ano_camion)
        VALUES ($1, $2, $3) RETURNING id;
      `;
      const camionRes = await client.query(camionQuery, [camion.marca_camion, camion.modelo_camion, camion.ano_camion]);
      const camionId = camionRes.rows[0].id;

      // 4. Insertar el pedido y obtener su ID
      const pedidoQuery = `
        INSERT INTO pedido (fk_id_camion, fk_cuit_cliente, fk_id_vendedor)
        VALUES ($1, $2, $3) RETURNING id;
      `;
      const pedidoRes = await client.query(pedidoQuery, [camionId, cliente.cuit, vendedor.id]);
      const pedidoId = pedidoRes.rows[0].id;

      // 5. Insertar la configuración del camión
      const configQuery = `
        INSERT INTO camion_configuracion (fk_id_pedido, distancia_entre_ejes, distancia_primer_eje_espalda_cabina, voladizo_delantero, voladizo_trasero, peso_eje_delantero, peso_eje_trasero, pbt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `;
      await client.query(configQuery, [pedidoId, configuracion.distancia_entre_ejes, configuracion.distancia_primer_eje_espalda_cabina, configuracion.voladizo_delantero, configuracion.voladizo_trasero, configuracion.peso_eje_delantero, configuracion.peso_eje_trasero, configuracion.pbt]);

      // 6. Insertar la carrocería
      // NOTA: Se ha añadido el campo 'separacion_cabina_carroceria' a la consulta.
      const carroceriaQuery = `
        INSERT INTO carroceria (fk_id_pedido, tipo_carroceria, largo_carroceria, alto_carroceria, ancho_carroceria, separacion_cabina_carroceria, equipo_frio_marca_modelo)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;
      await client.query(carroceriaQuery, [pedidoId, carroceria.tipo_carroceria, carroceria.largo_carroceria, carroceria.alto_carroceria, carroceria.ancho_carroceria, carroceria.separacion_cabina_carroceria, carroceria.equipo_frio_marca_modelo]);
      
      // 7. Insertar los resultados del cálculo (CORREGIDO)
      const calculosQuery = `
      INSERT INTO calculos (
        fk_id_pedido, 
        resultado_peso_bruto_total_maximo, 
        resultado_carga_eje_delantero_calculada, 
        resultado_carga_eje_trasero_calculada, 
        resultado_porcentaje_carga_eje_delantero, 
        resultado_modificacion_chasis, 
        resultado_voladizo_trasero_calculado, 
        verificacion_distribucion_carga_ok, 
        verificacion_voladizo_trasero_ok, 
        recomendaciones
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;
      `;
      const calculosRes = await client.query(calculosQuery, [
      pedidoId, 
      resultados.resultado_peso_bruto_total_maximo, 
      resultados.resultado_carga_eje_delantero_calculada, 
      resultados.resultado_carga_eje_trasero_calculada, 
      resultados.resultado_porcentaje_carga_eje_delantero, 
      resultados.resultado_modificacion_chasis, 
      resultados.resultado_voladizo_trasero_calculado, 
      resultados.verificacion_distribucion_carga_ok, 
      resultados.verificacion_voladizo_trasero_ok, 
      resultados.recomendaciones
      // Se eliminaron las 3 propiedades que no existen
      ]);

      // 8. Si todo fue exitoso, confirmar la transacción
      await client.query('COMMIT');
      
      // Devolvemos un objeto combinado con el ID del pedido y los resultados del cálculo
      return { pedido_id: pedidoId, ...calculosRes.rows[0] };

    } catch (error) {
      // 9. Si algo falló, deshacer todos los cambios ejecutados en esta transacción
      await client.query('ROLLBACK');
      console.error("Error en la transacción, rollback ejecutado:", error);
      throw new Error("No se pudo guardar el proyecto. La operación fue revertida.");
    } finally {
      // 10. Liberar el cliente para que vuelva a la pool de conexiones, independientemente de si hubo éxito o error.
      client.release();
    }
  }

  // Aquí se podrían añadir otros métodos en el futuro, como:
  // static async findByUserId(userId: number) { ... }
  // static async findById(pedidoId: number) { ... }
  // static async update(pedidoId: number, data: any) { ... }
}