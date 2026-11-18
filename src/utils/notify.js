import { notifications } from '@mantine/notifications';

/**
 * Convierte un error de axios en una lista de mensajes legibles.
 * La API responde { success: false, message, errors: [...] }.
 */
export async function mensajesDeError(error) {
  if (!error?.response) {
    return ['No se pudo conectar con la API. Verificá que esté funcionando.'];
  }

  let data = error.response.data;

  // Las descargas (PDF, archivos) piden un Blob: si falla, el JSON del error también llega como Blob
  if (data instanceof Blob) {
    try {
      data = JSON.parse(await data.text());
    } catch {
      data = null;
    }
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors;
  }

  if (data?.message) {
    return [data.message];
  }

  return [`Error inesperado (${error.response.status}).`];
}

export async function notificarError(error, titulo = 'No se pudo completar la operación') {
  const mensajes = await mensajesDeError(error);

  notifications.show({
    color: 'red',
    title: titulo,
    message: mensajes.join('\n'),
    autoClose: 7000,
    style: { whiteSpace: 'pre-line' },
  });
}

export function notificarExito(mensaje) {
  notifications.show({ color: 'teal', message: mensaje, autoClose: 3000 });
}
