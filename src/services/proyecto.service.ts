// src/services/proyecto.service.ts
import { DatosFormularioProyecto, ResultadosCalculo, ProyectoCompletoParaGuardar } from '../types/proyecto.types';
import { ProyectoRepository } from '../repositories/proyecto.repository';

// Definimos las constantes de las normativas extraídas del documento para fácil mantenimiento.
const NORMAS = {
  PBT_MAX_4x2: 16500, // kg
  PBT_MAX_6x2: 24000, // kg
  VOLADIZO_TRASERO_MAX_PORCENTAJE: 0.60, // 60% de la distancia entre ejes [cite: 50]
  AITA_4x2: { min: 30, max: 36 }, // % para 1s1d (4x2) [cite: 38]
  AITA_6x2: { min: 25, max: 25 }, // % para 1s2d (6x2) [cite: 39]
};

export class ProyectoService {

  public async generarSimulacion(datos: DatosFormularioProyecto): Promise<ResultadosCalculo> {
    
    // --- 1. CÁLCULOS PRIMARIOS ---
    const pesoBrutoTotalMaximo = this.calcularPesoBrutoMaximo(datos.camion.tipo_camion, datos.configuracion.pbt);
    const { cargaDelantera, cargaTrasera } = this.calcularCargasEnEjes(datos, pesoBrutoTotalMaximo);
    const porcentajeCargaDelantero = (cargaDelantera / pesoBrutoTotalMaximo) * 100;
    const modificacionChasis = this.calcularModificacionChasis(datos);
    const voladizoTraseroCarroceria = this.calcularVoladizoTraseroCarroceria(datos);
    const largoFinalCamion = datos.configuracion.voladizo_delantero + datos.configuracion.distancia_entre_ejes + voladizoTraseroCarroceria;

    // --- 2. VERIFICACIONES DE NORMATIVA ---
    const verificacionDistribucion = this.verificarDistribucionCarga(datos.camion.tipo_camion, porcentajeCargaDelantero);
    const verificacionVoladizo = this.verificarVoladizoTrasero(datos.configuracion.distancia_entre_ejes, voladizoTraseroCarroceria);
    
    // --- 3. GENERACIÓN DE RECOMENDACIONES ---
    const recomendaciones = this.generarRecomendaciones(verificacionDistribucion, verificacionVoladizo, modificacionChasis);
    
    // --- 4. CONSTRUCCIÓN DEL OBJETO DE RESPUESTA ---
    return {
      resultado_peso_bruto_total_maximo: pesoBrutoTotalMaximo,
      resultado_carga_eje_delantero_calculada: parseFloat(cargaDelantera.toFixed(2)),
      resultado_carga_eje_trasero_calculada: parseFloat(cargaTrasera.toFixed(2)),
      resultado_porcentaje_carga_eje_delantero: parseFloat(porcentajeCargaDelantero.toFixed(2)),
      resultado_modificacion_chasis: modificacionChasis,
      resultado_voladizo_trasero_calculado: parseFloat(voladizoTraseroCarroceria.toFixed(2)),
      resultado_largo_final_camion: parseFloat(largoFinalCamion.toFixed(2)),
      verificacion_distribucion_carga_ok: verificacionDistribucion.ok,
      verificacion_voladizo_trasero_ok: verificacionVoladizo.ok,
      recomendaciones,
    };
  }

  public async guardarProyectoCompleto(proyecto: ProyectoCompletoParaGuardar): Promise<any> {
    return ProyectoRepository.create(proyecto);
  }

  // ===================================================================================
  // == MÉTODOS PRIVADOS (La "inteligencia" basada en el documento)
  // ===================================================================================

  private calcularPesoBrutoMaximo(tipoCamion: string, pbtCamion: number): number {
    let pbtNormativa = pbtCamion;
    if (tipoCamion === '4x2') pbtNormativa = NORMAS.PBT_MAX_4x2;
    if (tipoCamion === '6x2') pbtNormativa = NORMAS.PBT_MAX_6x2;
    return Math.min(pbtCamion, pbtNormativa);
  }

  private calcularCargasEnEjes(datos: DatosFormularioProyecto, pesoBrutoTotal: number): { cargaDelantera: number, cargaTrasera: number } {
    const { configuracion, carroceria } = datos;
    const pesoTotalVacio = configuracion.peso_eje_delantero + configuracion.peso_eje_trasero;
    const pesoCargaUtil = pesoBrutoTotal - pesoTotalVacio;

    const distInicioCarroceria_EjeDel = configuracion.distancia_primer_eje_espalda_cabina + carroceria.separacion_cabina_carroceria;
    const distCGCargaUtil_EjeDel = distInicioCarroceria_EjeDel + (carroceria.largo_carroceria / 2);
    
    const momentoEjeDelanteroVacio = configuracion.peso_eje_delantero * configuracion.distancia_entre_ejes;
    
    const distCGCargaUtil_EjeTras = configuracion.distancia_entre_ejes - distCGCargaUtil_EjeDel;
    const momentoCargaUtil = pesoCargaUtil * distCGCargaUtil_EjeTras;
    
    let momentoCargasExtra = 0;
    if (datos.cargas_extra) {
      datos.cargas_extra.forEach(carga => {
        // La fórmula del documento es F2 = (W * d1) / (d1 + d2), donde d1+d2 es la distancia entre ejes.
        // El momento respecto al eje trasero es W * (distancia_entre_ejes - d1), que es lo mismo que W * d2
        const distCargaExtra_EjeTras = configuracion.distancia_entre_ejes - carga.distancia_eje_delantero;
        momentoCargasExtra += carga.peso * distCargaExtra_EjeTras;
      });
    }

    const sumaDeMomentos = momentoEjeDelanteroVacio + momentoCargaUtil + momentoCargasExtra;
    
    // Según el principio de momentos, la carga final en el eje delantero es la suma de todos los momentos
    // (tomados desde el eje trasero) dividida por la distancia entre ejes.
    const cargaDelanteraFinal = sumaDeMomentos / configuracion.distancia_entre_ejes;
    const cargaTraseraFinal = pesoBrutoTotal - cargaDelanteraFinal;

    return { cargaDelantera: cargaDelanteraFinal, cargaTrasera: cargaTraseraFinal };
  }

  private calcularModificacionChasis(datos: DatosFormularioProyecto): string {
    const { configuracion, carroceria } = datos;
    // El "largo carrozable" es el espacio disponible para montar la carrocería [cite: 12]
    const largoCarrozableNecesario = carroceria.separacion_cabina_carroceria + carroceria.largo_carroceria;
    const largoCarrozableDisponible = configuracion.distancia_entre_ejes + configuracion.voladizo_trasero - configuracion.distancia_primer_eje_espalda_cabina;
    const diferencia = largoCarrozableNecesario - largoCarrozableDisponible;

    if (diferencia > 10) return `Alargar ${Math.round(diferencia)} mm`; // Como en "alargue de 912mm" [cite: 134]
    if (diferencia < -10) return `Cortar ${Math.round(Math.abs(diferencia))} mm`;
    return "Sin cambios";
  }

  private calcularVoladizoTraseroCarroceria(datos: DatosFormularioProyecto): number {
    const { configuracion, carroceria } = datos;
    const largoTotalDesdeEjeDelantero = configuracion.distancia_primer_eje_espalda_cabina + carroceria.separacion_cabina_carroceria + carroceria.largo_carroceria;
    return largoTotalDesdeEjeDelantero - configuracion.distancia_entre_ejes;
  }
  
  private verificarDistribucionCarga(tipoCamion: string, porcentaje: number): { ok: boolean, mensaje: string } {
    const limites = tipoCamion === '4x2' ? NORMAS.AITA_4x2 : NORMAS.AITA_6x2;
    const ok = porcentaje >= limites.min && porcentaje <= limites.max;
    const mensaje = ok ? 'Correcto' : `Fuera de norma. El porcentaje de carga en el eje delantero es ${porcentaje.toFixed(1)}%, debe estar entre ${limites.min}% y ${limites.max}%.`; // Como en el ejemplo "estamos en un 28%" [cite: 128]
    return { ok, mensaje };
  }

  private verificarVoladizoTrasero(distanciaEjes: number, voladizoCalculado: number): { ok: boolean, mensaje: string } {
    const limite = distanciaEjes * NORMAS.VOLADIZO_TRASERO_MAX_PORCENTAJE;
    const ok = voladizoCalculado <= limite;
    const mensaje = ok ? 'Correcto' : `Excedido. El voladizo trasero (${voladizoCalculado.toFixed(0)} mm) supera el límite de ${limite.toFixed(0)} mm (${(NORMAS.VOLADIZO_TRASERO_MAX_PORCENTAJE * 100)}% de la distancia entre ejes).`;
    return { ok, mensaje };
  }
  
  private generarRecomendaciones(verificacionCarga: {ok: boolean, mensaje: string}, verificacionVoladizo: {ok: boolean, mensaje: string}, modificacionChasis: string): string[] {
    const recomendaciones: string[] = [];

    if (!verificacionCarga.ok) {
      recomendaciones.push(verificacionCarga.mensaje);
      recomendaciones.push("Recomendación: Realizar un desplazamiento del eje trasero para corregir la distribución."); // Como en "se debe desplazar el eje trasero 400mm" [cite: 129]
    }
    if (!verificacionVoladizo.ok) {
      recomendaciones.push(verificacionVoladizo.mensaje);
      recomendaciones.push("Recomendación: Acortar la carrocería o desplazar el eje trasero hacia atrás.");
    }
    if (modificacionChasis !== "Sin cambios") {
      recomendaciones.push(`Se requiere modificar el chasis: ${modificacionChasis}.`); // Como en "se requiere un alargue de chasis de 912mm" [cite: 134]
    }
    
    if (recomendaciones.length === 0) {
      recomendaciones.push("El diseño cumple con todas las normativas verificadas.");
    }

    return recomendaciones;
  }
}