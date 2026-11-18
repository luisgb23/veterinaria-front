import { notificarError } from './notify';

/**
 * Abre (o descarga) un archivo protegido con token.
 * Un <a href> común no sirve porque no manda la cabecera Authorization:
 * se pide el archivo con axios y se abre como blob.
 *
 * @param {() => Promise<Blob>} pedir función que trae el archivo
 * @param {string} nombre nombre sugerido para la descarga
 * @param {boolean} descargar true = descarga, false = abre en otra pestaña
 */
export async function abrirArchivo(pedir, nombre, descargar = false) {
  // La pestaña se abre antes de esperar la respuesta: si se abre después,
  // el navegador la toma como ventana emergente y la bloquea.
  const pestana = descargar ? null : window.open('', '_blank');

  try {
    const blob = await pedir();
    const url = URL.createObjectURL(blob);

    if (descargar) {
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = nombre;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
    } else if (pestana) {
      pestana.location.href = url;
    } else {
      window.open(url, '_blank');
    }

    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    pestana?.close();
    notificarError(error, 'No se pudo abrir el archivo');
  }
}
