// src/services/proyecto.service.ts
import { ProyectoRepository } from '../repositories/proyecto.repository';
import { DatosFormularioProyecto, ResultadosCalculo, ProyectoCompletoParaGuardar } from '../types/proyecto.types';

// ============================================================================
// Constantes normativas y parámetros fijos
// ============================================================================
const NORMAS = {
  PBT_MAX_4x2: 16500, // kg
  PBT_MAX_6x2: 24000, // kg
  PORCENTAJE_4x2: 36, // %
  PORCENTAJE_6x2: 25, // %
  VOLADIZO_TRASERO_MAX_PORCENTAJE: 0.60, // 60% de la distancia entre ejes
  TOLERANCIA_CHASIS: 10, // mm de margen para considerar "sin cambio"
};

export class ProyectoService {

  public async generarSimulacion(datos: DatosFormularioProyecto): Promise<ResultadosCalculo> {
    const tipoEntrada = (datos.camion && datos.camion.tipo_camion)
      ? String(datos.camion.tipo_camion).toLowerCase()
      : '4x2';

    const tipo = tipoEntrada === '6x2' ? '6x2' : '4x2';

    // ------------------------------------------------------------------------
    // Determinar PBT: menor entre el informado y el normativo
    // ------------------------------------------------------------------------
    const maxNormativo = tipo === '6x2'
      ? NORMAS.PBT_MAX_6x2
      : NORMAS.PBT_MAX_4x2;

    const pbtEntrada = datos?.configuracion?.pbt;

    const pbt =
      typeof pbtEntrada === 'number' && !isNaN(pbtEntrada)
        ? Math.min(pbtEntrada, maxNormativo)
        : maxNormativo;

    // ------------------------------------------------------------------------
    // CARGAS MÁXIMAS POR EJE SEGÚN NORMA
    // ------------------------------------------------------------------------
    const porcentajeDelantero =
      tipo === '6x2'
        ? NORMAS.PORCENTAJE_6x2 / 100
        : NORMAS.PORCENTAJE_4x2 / 100;

    const porcentajeTrasero = 1 - porcentajeDelantero;

    const cargaMaxEjeDelantero = pbt * porcentajeDelantero;
    const cargaMaxEjeTrasero = pbt * porcentajeTrasero;

    // ------------------------------------------------------------------------
    // CARGAS REALES
    // ------------------------------------------------------------------------
    const cargaEjeDelantero = cargaMaxEjeDelantero - datos.configuracion.peso_eje_delantero;
    const cargaEjeTrasero = cargaMaxEjeTrasero - datos.configuracion.peso_eje_trasero;

    // ------------------------------------------------------------------------
    // CARGA EXTRA TOTAL
    // ------------------------------------------------------------------------
    const cargaExtraTotal = (datos.cargas_extra || []).reduce(
      (sum, c) => sum + (c.peso || 0),
      0
    );

    // ------------------------------------------------------------------------
    // CARGA TOTAL
    // ------------------------------------------------------------------------
    const cargaTotal = cargaEjeDelantero + cargaEjeTrasero - cargaExtraTotal;

    // ------------------------------------------------------------------------
    // CENTRO DE CARGA TOTAL
    // ------------------------------------------------------------------------
    const distanciaEjes = datos.configuracion.distancia_entre_ejes;
    const distanciaCargaExtra =
      (datos.cargas_extra && datos.cargas_extra.length > 0)
        ? datos.cargas_extra[0].distancia_eje_delantero
        : 0;

    const centroCargaTotal =
      ((distanciaEjes * cargaMaxEjeTrasero) -
        (cargaExtraTotal * distanciaCargaExtra) -
        (datos.configuracion.peso_eje_trasero * distanciaEjes)) /
      (cargaTotal || 1);

    // ------------------------------------------------------------------------
    // CENTRO DE CARGA CARROCERÍA
    // ------------------------------------------------------------------------
    const centroCargaCarroceria =
      datos.configuracion.distancia_primer_eje_espalda_cabina +
      datos.carroceria.separacion_cabina_carroceria +
      datos.carroceria.largo_carroceria / 2;

    // ------------------------------------------------------------------------
    // ALARGAR / CORTAR CHASIS
    // ------------------------------------------------------------------------
    const diferenciaChasis =
      (datos.configuracion.distancia_primer_eje_espalda_cabina +
        datos.carroceria.separacion_cabina_carroceria +
        datos.carroceria.largo_carroceria) -
      (datos.configuracion.distancia_entre_ejes + datos.configuracion.voladizo_trasero);

    const modificacionChasis =
      diferenciaChasis > NORMAS.TOLERANCIA_CHASIS
        ? `alargar ${Math.round(diferenciaChasis)} mm el chasis`
        : diferenciaChasis < -NORMAS.TOLERANCIA_CHASIS
          ? `cortar ${Math.abs(Math.round(diferenciaChasis))} mm el chasis`
          : 'Sin cambios';

    // ------------------------------------------------------------------------
    // NUEVA DISTANCIA ENTRE EJES
    // ------------------------------------------------------------------------
    const nuevaDistanciaEntreEjes =
      ((cargaExtraTotal * distanciaCargaExtra) +
        (cargaTotal * centroCargaCarroceria)) /
      ((cargaMaxEjeTrasero - datos.configuracion.peso_eje_trasero) || 1);

    // ------------------------------------------------------------------------
    // DESPLAZAMIENTO DEL EJE
    // ------------------------------------------------------------------------
    const desplazamientoEje =
      nuevaDistanciaEntreEjes - datos.configuracion.distancia_entre_ejes;

    // ------------------------------------------------------------------------
    // VERIFICACIONES
    // ------------------------------------------------------------------------
    const verificacionDistribucion = this.verificarDistribucionCarga(
      tipo,
      porcentajeDelantero * 100
    );

    const voladizoTraseroCalculado =
      (datos.configuracion.distancia_primer_eje_espalda_cabina +
        datos.carroceria.separacion_cabina_carroceria +
        datos.carroceria.largo_carroceria) -
      datos.configuracion.distancia_entre_ejes;

    const verificacionVoladizo = this.verificarVoladizoTrasero(
      datos.configuracion.distancia_entre_ejes,
      voladizoTraseroCalculado
    );

    // ------------------------------------------------------------------------
    // RECOMENDACIONES
    // ------------------------------------------------------------------------
    const recomendaciones = this.generarRecomendaciones(
      verificacionDistribucion,
      verificacionVoladizo,
      modificacionChasis,
      desplazamientoEje
    );

    // ------------------------------------------------------------------------
    // RESULTADOS
    // ------------------------------------------------------------------------
    return {
      resultado_peso_bruto_total_maximo: pbt,
      resultado_carga_eje_delantero_calculada: cargaEjeDelantero,
      resultado_carga_eje_trasero_calculada: cargaEjeTrasero,
      resultado_porcentaje_carga_eje_delantero: porcentajeDelantero * 100,
      resultado_modificacion_chasis: modificacionChasis,
      resultado_voladizo_trasero_calculado: voladizoTraseroCalculado,
      resultado_largo_final_camion:
        datos.configuracion.voladizo_delantero +
        distanciaEjes +
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

  // ==========================================================================
  // GUARDAR PROYECTO COMPLETO
  // ==========================================================================
  public async guardarProyectoCompleto(proyecto: ProyectoCompletoParaGuardar) {
    console.log("[SERVICE] Guardando proyecto...");
    const repo = new ProyectoRepository();
    return await ProyectoRepository.create(proyecto);
  }

  // ==========================================================================
  // Validaciones
  // ==========================================================================
  private verificarDistribucionCarga(tipoCamion: string, porcentaje: number) {
    let min = 0, max = 0;
    if (tipoCamion === '4x2') { min = 30; max = 36; }
    if (tipoCamion === '6x2') { min = 25; max = 25; }

    const ok = porcentaje >= min && porcentaje <= max;
    return {
      ok,
      mensaje: ok
        ? `Distribución dentro de norma (${porcentaje.toFixed(1)}%).`
        : `Distribución fuera de norma (${porcentaje.toFixed(1)}%). Debe estar entre ${min}% y ${max}%.`,
      rango: { min, max },
      porcentaje
    };
  }

  private verificarVoladizoTrasero(distEjes: number, voladizo: number) {
    const limite = distEjes * NORMAS.VOLADIZO_TRASERO_MAX_PORCENTAJE;
    const ok = voladizo <= limite;
    const exceso = ok ? 0 : voladizo - limite;

    return {
      ok,
      mensaje: ok
        ? 'Voladizo dentro de norma.'
        : `Voladizo excedido en ${exceso.toFixed(0)} mm (actual: ${voladizo.toFixed(0)} mm, máximo permitido: ${limite.toFixed(0)} mm).`,
      limite,
      voladizo,
      exceso
    };
  }

  private generarRecomendaciones(
    verifCarga: { ok: boolean; mensaje: string },
    verifVoladizo: { ok: boolean; mensaje: string; limite?: number; voladizo?: number; exceso?: number },
    modifChasis: string,
    desplazamientoEje: number
  ): string[] {

    if (verifCarga.ok && verifVoladizo.ok && modifChasis === 'Sin cambios' && Math.abs(desplazamientoEje) < 10) {
      return ['El diseño cumple con todas las normativas verificadas.'];
    }

    const rec: string[] = [];
    rec.push('• Observaciones detectadas:');

    if (!verifVoladizo.ok && verifVoladizo.exceso && verifVoladizo.limite !== undefined) {
      rec.push(
        `     - El voladizo trasero excede el máximo permitido en ${Math.round(verifVoladizo.exceso)} mm ` +
        `(actual: ${Math.round(verifVoladizo.voladizo || 0)} mm, máximo: ${Math.round(verifVoladizo.limite)} mm).`
      );
    }

    if (!verifCarga.ok) {
      rec.push(`     - Distribución de carga fuera de norma: ${verifCarga.mensaje}`);
    }

    rec.push('-');
    rec.push('• Posibles soluciones:');

    const opciones: string[] = [];
    const despl = Math.round(Math.abs(desplazamientoEje));
    const sentido = desplazamientoEje > 0 ? 'hacia atrás' : 'hacia adelante';

    if (!verifVoladizo.ok) {
      if (despl >= 10) {
        opciones.push(`Desplazar el eje trasero ${despl} mm ${sentido} para corregir el voladizo.`);
      }
      if (modifChasis !== 'Sin cambios') {
        opciones.push(`${modifChasis} para corregir la longitud del chasis.`);
      }
    }

    if (!verifVoladizo.ok && opciones.length === 0 && !verifCarga.ok) {
      opciones.push(`Revisar la distribución de peso y considerar desplazar el eje ${sentido} ${despl} mm.`);
    }

    if (opciones.length === 0 && !verifCarga.ok) {
      opciones.push(verifCarga.mensaje);
    }

    opciones.forEach((op, i) => rec.push(`     Opción ${i + 1}: ${op}`));

    return rec;
  }
}
