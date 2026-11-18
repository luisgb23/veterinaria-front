import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificarError, notificarExito } from '../utils/notify';

/**
 * Listado de un recurso. Mientras carga la página siguiente se sigue mostrando la anterior.
 * Devuelve el useQuery con data = { data: [...], meta: {...} }.
 */
export function useListado(clave, listar, params = {}) {
  return useQuery({
    queryKey: [clave, 'listado', params],
    queryFn: () => listar(params),
    placeholderData: keepPreviousData,
  });
}

/** Un registro por id. */
export function useDetalle(clave, obtener, id) {
  return useQuery({
    queryKey: [clave, 'detalle', String(id)],
    queryFn: () => obtener(id),
    enabled: Boolean(id),
  });
}

/**
 * Crear o actualizar: llamá a mutate({ id, values }). Sin id crea, con id actualiza.
 * Al terminar refresca todos los datos en pantalla (una mascota que cambia afecta
 * a las consultas, vacunas y cuotas que la muestran).
 */
export function useGuardar(recurso, { mensajeCreado, mensajeActualizado, onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => (id ? recurso.update(id, values) : recurso.create(values)),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries();
      const mensaje = variables.id ? mensajeActualizado : mensajeCreado;
      if (mensaje) {
        notificarExito(mensaje);
      }
      onSuccess?.(data, variables);
    },
    onError: (error) => notificarError(error, 'No se pudo guardar'),
  });
}

/** Eliminar (baja lógica): mutate(id). */
export function useEliminar(recurso, { mensaje = 'Eliminado correctamente.', onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => recurso.remove(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries();
      notificarExito(mensaje);
      onSuccess?.(data, id);
    },
    onError: (error) => notificarError(error, 'No se pudo eliminar'),
  });
}
