// src/types/proyecto.types.ts

// ... (las interfaces CargaExtra y DatosFormularioProyecto no cambian) ...
export interface CargaExtra {
  descripcion: string;
  peso: number; // en kg
  distancia_eje_delantero: number; // en mm
}

export interface DatosFormularioProyecto {
  cliente: {
    cuit: number;
    razon_social: string;
  };
  vendedor: {
    id: number;
  };
  camion: {
    marca_camion: string;
    modelo_camion: string;
    ano_camion: string;
    tipo_camion: '4x2' | '6x2' | 'otro'; 
  };
  configuracion: {
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


// Estructura de los resultados (MODIFICADA)
export interface ResultadosCalculo {
  resultado_peso_bruto_total_maximo: number;
  resultado_carga_eje_delantero_calculada: number;
  resultado_carga_eje_trasero_calculada: number;
  resultado_porcentaje_carga_eje_delantero: number;
  resultado_modificacion_chasis: string;
  resultado_voladizo_trasero_calculado: number;
  resultado_largo_final_camion?: number;
  verificacion_distribucion_carga_ok: boolean;
  verificacion_voladizo_trasero_ok: boolean;
  verificacion_largo_total_equipo_ok?: boolean;
  recomendaciones: string[];
  
  /**
   * NUEVO: Lista de campos (en formato "objeto.propiedad") 
   * que están implicados en el fallo de una verificación.
   * Ej: ["carroceria.largo_carroceria", "configuracion.distancia_entre_ejes"]
   */
  camposConError: string[]; 
}

// ... (la interfaz ProyectoCompletoParaGuardar no cambia) ...
export interface ProyectoCompletoParaGuardar {
  datosEntrada: DatosFormularioProyecto;
  resultados: ResultadosCalculo;
}