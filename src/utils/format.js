import dayjs from 'dayjs';

/** "2026-11-06" → "06/11/2026" */
export function fecha(valor) {
  return valor ? dayjs(valor).format('DD/MM/YYYY') : '—';
}

/** "2026-11-06 14:20:34" → "06/11/2026 14:20" */
export function fechaHora(valor) {
  return valor ? dayjs(valor).format('DD/MM/YYYY HH:mm') : '—';
}

/** Fecha de hoy en el formato que usa la API: "2026-11-18" */
export function hoy() {
  return dayjs().format('YYYY-MM-DD');
}

/** 1350 → "$ 1.350" */
export function dinero(valor) {
  if (valor === null || valor === undefined) {
    return '—';
  }
  return `$ ${Number(valor).toLocaleString('es-UY')}`;
}

/** "Geymonat, Luis" */
export function nombrePropietario(nombre, apellido) {
  return [apellido, nombre].filter(Boolean).join(', ') || '—';
}

/** "Cuota Noviembre" */
export function cuotaDelMes(valor = undefined) {
  const mes = dayjs(valor).format('MMMM');
  return `Cuota ${mes.charAt(0).toUpperCase()}${mes.slice(1)}`;
}
