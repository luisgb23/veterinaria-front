import { http } from './client';

/** Quita los filtros vacíos para no mandar "?search=&mascota_id=" en la URL. */
function limpiar(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
}

/**
 * Funciones CRUD estándar de un recurso de la API.
 * list() devuelve la respuesta completa ({ data, meta }); el resto devuelve solo "data".
 */
function crud(path) {
  return {
    list: (params) => http.get(path, limpiar(params)),
    get: (id) => http.get(`${path}/${id}`).then((r) => r.data),
    create: (values) => http.post(path, values).then((r) => r.data),
    update: (id, values) => http.put(`${path}/${id}`, values).then((r) => r.data),
    remove: (id) => http.delete(`${path}/${id}`),
  };
}

export const authApi = {
  login: (usuario, password) => http.post('/auth/login', { usuario, password }).then((r) => r.data),
  logout: (refreshToken) => http.post('/auth/logout', { refresh_token: refreshToken }),
  me: () => http.get('/auth/me').then((r) => r.data),
  cambiarPassword: (passwordActual, passwordNueva) =>
    http
      .put('/auth/password', { password_actual: passwordActual, password_nueva: passwordNueva })
      .then((r) => r.data),
};

export const especiesApi = crud('/especies');

export const propietariosApi = {
  ...crud('/propietarios'),
  mascotas: (id) => http.get(`/propietarios/${id}/mascotas`).then((r) => r.data),
};

export const mascotasApi = crud('/mascotas');

export const consultasApi = {
  ...crud('/consultas'),
  subirArchivo: (id, numero, file) => {
    const form = new FormData();
    form.append('archivo', file);
    return http.post(`/consultas/${id}/archivos/${numero}`, form).then((r) => r.data);
  },
  eliminarArchivo: (id, numero) => http.delete(`/consultas/${id}/archivos/${numero}`).then((r) => r.data),
  archivo: (id, numero) => http.blob(`/consultas/${id}/archivos/${numero}`),
  pdf: (id) => http.blob(`/consultas/${id}/pdf`),
};

export const vacunasApi = {
  ...crud('/vacunas'),
  vencimientos: (params) => http.get('/vacunas/vencimientos', limpiar(params)),
};

export const cuotasApi = crud('/cuotas');

export const usuariosApi = crud('/usuarios');
