// src/services/proyecto.service.ts

import { DatosFormularioProyecto, ResultadosCalculo, ProyectoCompletoParaGuardar } from '../types/proyecto.types';
import { ProyectoRepository } from '../repositories/proyecto.repository';

// ============================================================================
// Constantes normativas y parámetros fijos
// ============================================================================
const NORMAS = {
  PBT_MAX_4x2: 16500, // kg
  PBT_MAX_6x2: 24000, // kg
  PORCENTAJE_4x2: 36, // %
  PORCENTAJE_6x2: 25, // %
  PORCENTAJE_1S3D: 20, // %
  VOLADIZO_TRASERO_MAX_PORCENTAJE: 0.60, // 60% de la distancia entre ejes
  TOLERANCIA_CHASIS: 10, // mm de margen para considerar "sin cambio"
};

// ============================================================================
// Servicio principal
// ============================================================================
export class ProyectoService {

  // Punto de entrada principal del cálculo
  public async generarSimulacion(datos: DatosFormularioProyecto): Promise<ResultadosCalculo> {

    // (PBT)
    const pesoBrutoTotalMaximo = this.calcularPBT(datos.camion.tipo_camion, datos.configuracion.pbt);
    
    // (a, b)
    const { cargaMaxEjeDelantero, cargaMaxEjeTrasero, porcentajeUsado } =
      this.calcularCargasMaximasPorNorma(datos.camion.tipo_camion, pesoBrutoTotalMaximo);
    
    // (c, d)
    const cargaEjeDelantero = cargaMaxEjeDelantero - datos.configuracion.peso_eje_delantero;
    const cargaEjeTrasero = cargaMaxEjeTrasero - datos.configuracion.peso_eje_trasero;
    
    // (e)
    const cargaExtra = this.calcularCargaExtraTotal(datos);
    const cargaTotal = cargaEjeDelantero + cargaEjeTrasero - cargaExtra;
    
    // (f)
    const centroCargaTotal = this.calcularCentroDeCarga(
      datos,
      pesoBrutoTotalMaximo,
      cargaMaxEjeTrasero,
      cargaExtra,
      cargaTotal
    );
    
    // (g)
    const centroCargaCarroceria = this.calcularCentroCargaCarroceria(datos);
    
    // (h)
    const modificacionChasis = this.calcularModificacionChasis(datos);
    
    // (i)
    const nuevaDistanciaEntreEjes = this.calcularNuevaDistanciaEjes(
      datos,
      cargaExtra,
      centroCargaCarroceria,
      cargaMaxEjeTrasero,
      cargaTotal
    );
    
    // (j)
    const desplazamientoEje = nuevaDistanciaEntreEjes - datos.configuracion.distancia_entre_ejes;
    
    // (Extras)
    const verificacionDistribucion = this.verificarDistribucionCarga(
      datos.camion.tipo_camion,
      porcentajeUsado
    );
    const voladizoTraseroCalculado = this.calcularVoladizoTrasero(datos);
    const verificacionVoladizo = this.verificarVoladizoTrasero(
      datos.configuracion.distancia_entre_ejes,
      voladizoTraseroCalculado
    );
    
    // ¡RECOMENDACIÓN CORREGIDA!
    const recomendaciones = this.generarRecomendaciones(
      verificacionDistribucion,
      verificacionVoladizo,
      modificacionChasis,
      desplazamientoEje
    );

    // ------------------------------------------------------------------------
    // Construir objeto final de resultados
    // ------------------------------------------------------------------------
    return {
      resultado_peso_bruto_total_maximo: pesoBrutoTotalMaximo,
      resultado_carga_maxima_eje_delantero: cargaMaxEjeDelantero,
      resultado_carga_maxima_eje_trasero: cargaMaxEjeTrasero,
      resultado_carga_total_calculada: cargaTotal,
      resultado_carga_eje_delantero_calculada: cargaEjeDelantero,
      resultado_carga_eje_trasero_calculada: cargaEjeTrasero,
      resultado_porcentaje_carga_eje_delantero: porcentajeUsado,
      resultado_modificacion_chasis: modificacionChasis,
      resultado_voladizo_trasero_calculado: voladizoTraseroCalculado,
      resultado_largo_final_camion:
        datos.configuracion.voladizo_delantero +
        datos.configuracion.distancia_entre_ejes +
        voladizoTraseroCalculado,
      
      resultado_centro_carga_total: centroCargaTotal,
      resultado_centro_carga_carroceria: centroCargaCarroceria,
      resultado_nueva_distancia_entre_ejes: nuevaDistanciaEntreEjes,
      resultado_desplazamiento_eje: desplazamientoEje,
      
      verificacion_distribucion_carga_ok: verificacionDistribucion.ok,
      verificacion_voladizo_trasero_ok: verificacionVoladizo.ok,
      recomendaciones,
    };
  }

  // Guardado del proyecto completo
  public async guardarProyectoCompleto(proyecto: ProyectoCompletoParaGuardar): Promise<any> {
    return ProyectoRepository.create(proyecto);
  }

  // ============================================================================
  // Métodos privados
  // ============================================================================

  // (1) Calcular el PBT aplicable
  private calcularPBT(tipoCamion: string, pbtCamion: number): number {
    let pbtNorma = pbtCamion;
    if (tipoCamion === '4x2') pbtNorma = NORMAS.PBT_MAX_4x2;
    if (tipoCamion === '6x2') pbtNorma = NORMAS.PBT_MAX_6x2;
    return Math.min(pbtCamion, pbtNorma);
  }

  // (2) (a, b) Calcular cargas máximas por norma
  private calcularCargasMaximasPorNorma(tipoCamion: string, pbt: number) {
    let porcentaje = 0;
    if (tipoCamion === '4x2') porcentaje = NORMAS.PORCENTAJE_4x2;
    if (tipoCamion === '6x2') porcentaje = NORMAS.PORCENTAJE_6x2;
    if (tipoCamion === 'otro') porcentaje = NORMAS.PORCENTAJE_1S3D;

    const cargaMaxEjeDelantero = (pbt * porcentaje) / 100;
    const cargaMaxEjeTrasero = pbt - cargaMaxEjeDelantero;

    return { cargaMaxEjeDelantero, cargaMaxEjeTrasero, porcentajeUsado: porcentaje };
  }

  // (3) Carga extra total (accesorios, frío, etc.)
  private calcularCargaExtraTotal(datos: DatosFormularioProyecto): number {
    if (!datos.cargas_extra) return 0;
    return datos.cargas_extra.reduce((acc, c) => acc + c.peso, 0);
  }

  // (4) (f) Calcular centro de carga total
  private calcularCentroDeCarga(
    datos: DatosFormularioProyecto,
    pbt: number,
    cargaMaxEjeTrasero: number,
    cargaExtra: number,
    cargaTotal: number
  ): number {
    const dEjes = datos.configuracion.distancia_entre_ejes;
    const cargaExtraDist = datos.cargas_extra?.[0]?.distancia_eje_delantero || 0;
    const pesoEjeTras = datos.configuracion.peso_eje_trasero;
    // Fórmula oficial (f)
    return ((dEjes * cargaMaxEjeTrasero) - (cargaExtra * cargaExtraDist) - (pesoEjeTras * dEjes)) / cargaTotal;
  }

  // (5) (g) Centro de carga de la carrocería
  private calcularCentroCargaCarroceria(datos: DatosFormularioProyecto): number {
    const { configuracion, carroceria } = datos;
    return configuracion.distancia_primer_eje_espalda_cabina +
      carroceria.separacion_cabina_carroceria +
      (carroceria.largo_carroceria / 2);
  }

  // (6) (h) Modificación de chasis
  private calcularModificacionChasis(datos: DatosFormularioProyecto): string {
    const { configuracion, carroceria } = datos;
    const necesario = configuracion.distancia_primer_eje_espalda_cabina +
      carroceria.separacion_cabina_carroceria +
      carroceria.largo_carroceria;
    const disponible = configuracion.distancia_entre_ejes + configuracion.voladizo_trasero;
    const diferencia = necesario - disponible;

    if (diferencia > NORMAS.TOLERANCIA_CHASIS) return `Alargar ${Math.round(diferencia)} mm`;
    if (diferencia < -NORMAS.TOLERANCIA_CHASIS) return `Cortar ${Math.round(Math.abs(diferencia))} mm`;
    return 'Sin cambios';
  }

  // (7) (i) Nueva distancia entre ejes
  private calcularNuevaDistanciaEjes(
    datos: DatosFormularioProyecto,
    cargaExtra: number,
    centroCargaCarroceria: number,
    cargaMaxEjeTrasero: number,
    cargaTotal: number
  ): number {
    const cargaExtraDist = datos.cargas_extra?.[0]?.distancia_eje_delantero || 0;
    const pesoEjeTras = datos.configuracion.peso_eje_trasero;
    
    const numerador = (cargaExtra * cargaExtraDist) + (cargaTotal * centroCargaCarroceria);
    const denominador = cargaMaxEjeTrasero - pesoEjeTras;

    if (denominador === 0) return 0; 
    
    return numerador / denominador;
  }

  // (8) Voladizo trasero de la carrocería
  private calcularVoladizoTrasero(datos: DatosFormularioProyecto): number {
    const { configuracion, carroceria } = datos;
    return configuracion.distancia_primer_eje_espalda_cabina +
      carroceria.separacion_cabina_carroceria +
      carroceria.largo_carroceria -
      configuracion.distancia_entre_ejes;
  }

  // (9) Verificaciones normativas
  private verificarDistribucionCarga(tipoCamion: string, porcentaje: number) {
    let min = 0, max = 0;
    if (tipoCamion === '4x2') { min = 30; max = 36; }
    if (tipoCamion === '6x2') { min = 25; max = 25; }
    if (tipoCamion === 'otro') { min = 20; max = 20; }

    const ok = porcentaje >= min && porcentaje <= max;
    return { ok, mensaje: ok ?
      'Distribución dentro de norma' :
      `Fuera de norma (${porcentaje.toFixed(1)}%). Debe estar entre ${min}% y ${max}%.` };
  }

  private verificarVoladizoTrasero(distEjes: number, voladizo: number) {
    const limite = distEjes * NORMAS.VOLADIZO_TRASERO_MAX_PORCENTAJE;
    const ok = voladizo <= limite;
    return { ok, mensaje: ok ?
      'Voladizo dentro de norma' :
      `Voladizo excedido (${voladizo.toFixed(0)} mm), máximo permitido ${limite.toFixed(0)} mm.` };
  }

  // --- (10) FUNCIÓN DE RECOMENDACIONES (MODIFICADA) ---
  private generarRecomendaciones(
    verifCarga: { ok: boolean; mensaje: string },
    verifVoladizo: { ok: boolean; mensaje: string },
    modifChasis: string,
    desplazamientoEje: number
  ): string[] {
    const rec: string[] = [];
    if (!verifCarga.ok) {
      rec.push(verifCarga.mensaje);
      rec.push('Recomendación: revisar distribución de carga y considerar desplazamiento de eje.');
    }

    if (!verifVoladizo.ok) {
      rec.push(verifVoladizo.mensaje);
      rec.push('Recomendación: acortar carrocería o desplazar eje trasero hacia atrás.');
    }

    if (modifChasis !== 'Sin cambios') {
      rec.push(`Modificación de chasis requerida: ${modifChasis}.`);
    }

    // --- ¡BLOQUE CORREGIDO! ---
    // Ahora solo muestra el número redondeado. El signo (positivo o negativo)
    // ya indica la dirección (atrás o adelante).
    if (Math.abs(desplazamientoEje) > 10) {
      rec.push(`Desplazamiento estimado del eje: ${Math.round(desplazamientoEje)} mm.`);
    }
    // --- FIN DEL BLOQUE CORREGIDO ---

    if (rec.length === 0) {
      rec.push('El diseño cumple con todas las normativas verificadas.');
    }

    return rec;
  }
}