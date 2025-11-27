import { ProyectoCompletoParaGuardar, DatosFormularioProyecto } from '../types/proyecto.types';
import { pool } from '../../db';

export class ProyectoRepository {

  // Inserción basada en si es original o modificada
  async create(proyecto: ProyectoCompletoParaGuardar) {
    const {configuracion, camion} = proyecto.datosEntrada;
    
    const query = `
      INSERT INTO public.camion_configuracion
      (distancia_entre_ejes, distancia_primer_eje_espalda_cabina,
       voladizo_delantero, voladizo_trasero, peso_eje_delantero, peso_eje_trasero,
       pbt, original, es_modificado, fk_id_camion, ancho_chasis_1, ancho_chasis_2)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *;
    `;

    const values = [
      configuracion.distancia_entre_ejes,
      configuracion.distancia_primer_eje_espalda_cabina,
      configuracion.voladizo_delantero,
      configuracion.voladizo_trasero,
      configuracion.peso_eje_delantero,
      configuracion.peso_eje_trasero,
      configuracion.pbt,
      configuracion.original ?? true,         // original
      configuracion.es_modificado ?? false,         // es_modificado
      camion.id!,
      configuracion.ancho_chasis_1,
      configuracion.ancho_chasis_2 ?? null // si no viene, insertamos NULL
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async update(id: number, config: DatosFormularioProyecto['configuracion']) {
    const query = `
      UPDATE public.camion_configuracion
      SET distancia_entre_ejes=$1,
          distancia_primer_eje_espalda_cabina=$2,
          voladizo_delantero=$3,
          voladizo_trasero=$4,
          peso_eje_delantero=$5,
          peso_eje_trasero=$6,
          pbt=$7,
          ancho_chasis_1=$8,
          ancho_chasis_2=$9
      WHERE id=$10
      RETURNING *;
    `;
    const values = [
      config.distancia_entre_ejes,
      config.distancia_primer_eje_espalda_cabina,
      config.voladizo_delantero,
      config.voladizo_trasero,
      config.peso_eje_delantero,
      config.peso_eje_trasero,
      config.pbt,
      config.ancho_chasis_1,
      config.ancho_chasis_2 ?? null,
      id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}