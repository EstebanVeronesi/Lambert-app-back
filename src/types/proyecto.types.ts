// src/types/proyecto.types.ts

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
    marca_camion: string;
    modelo_camion: string;
    ano_camion: string;
    tipo_camion: '4x2' | '6x2' | 'otro'; // <-- El campo que faltaba
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
    separacion_cabina_carroceria: number; // <-- El campo que faltaba
    equipo_frio_marca_modelo?: string;
  };
  cargas_extra?: CargaExtra[]; // <-- El campo que faltaba
}

// Estructura de los resultados (sin cambios)
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
}

// Representa el objeto completo que se enviará para guardar.
export interface ProyectoCompletoParaGuardar {
  datosEntrada: DatosFormularioProyecto;
  resultados: ResultadosCalculo;
}