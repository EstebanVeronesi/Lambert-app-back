// src/types/proyecto.types.ts

// Carga adicional (grúa, equipo de frío, etc.)
export interface CargaExtra {
  descripcion: string;
  peso: number; // en kg
  distancia_eje_delantero: number; // en mm
}

// Datos que el usuario enviará a la API
export interface DatosFormularioProyecto {
  cliente: {
    cuit: number;
    razon_social: string;
  };
  vendedor: {
    id: number;
  };
  camion: {
    // Para Opción 1, el frontend puede enviar el ID.
    // Para Opción 2, debe enviar marca/modelo/año.
    id?: number; 
    marca_camion?: string;
    modelo_camion?: string;
    ano_camion?: string;
    tipo_camion: '4x2' | '6x2' | 'otro'; 
  };
  configuracion: {
    // --- ¡ESTE ES EL CAMPO CLAVE! ---
    es_modificado: boolean; // true = Opción 2 (Pendiente), false = Opción 1 (Verificado)
    // --- FIN ---

    distancia_entre_ejes: number;
    distancia_primer_eje_espalda_cabina: number;
    voladizo_delantero: number;
    voladizo_trasero: number;
    peso_eje_delantero: number;
    peso_eje_trasero: number;
    pbt: number;
  };
  carroceria: {
    tipo_carroceria: 'Metálica' | 'Térmica';
    largo_carroceria: number;
    alto_carroceria: number;
    ancho_carroceria: number;
    separacion_cabina_carroceria: number;
    equipo_frio_marca_modelo?: string;
  };
  cargas_extra?: CargaExtra[];
}

// Resultados completos generados por el cálculo técnico
export interface ResultadosCalculo {
  resultado_peso_bruto_total_maximo: number;
  resultado_carga_maxima_eje_delantero: number;    // (a)
  resultado_carga_maxima_eje_trasero: number;      // (b)
  resultado_carga_total_calculada: number;         // (e)
  resultado_carga_eje_delantero_calculada: number; // (c)
  resultado_carga_eje_trasero_calculada: number;   // (d)
  resultado_porcentaje_carga_eje_delantero: number;
  resultado_modificacion_chasis: string;           // (h)
  resultado_voladizo_trasero_calculado: number;
  resultado_largo_final_camion: number;
  resultado_centro_carga_total: number;             // (f)
  resultado_centro_carga_carroceria: number;        // (g)
  resultado_nueva_distancia_entre_ejes: number;     // (i)
  resultado_desplazamiento_eje: number;             // (j)
  verificacion_distribucion_carga_ok: boolean;
  verificacion_voladizo_trasero_ok: boolean;
  verificacion_largo_total_equipo_ok?: boolean;
  recomendaciones: string[];
}

// Objeto completo que se guarda o envía al backend
export interface ProyectoCompletoParaGuardar {
  datosEntrada: DatosFormularioProyecto;
  resultados: ResultadosCalculo;
}