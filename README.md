# Veterinaria Itapebí — Frontend

Interfaz web para la API de la veterinaria (`veterinaria-api`), hecha con **React + Vite** en JavaScript,
**Mantine** como librería de componentes, **TanStack Query** para los datos y **Axios** para las peticiones.

Tiene un menú lateral a la izquierda (en celulares se abre con el botón ☰), modo claro y oscuro,
y la sesión se guarda en `localStorage`.

## Requisitos

- **Node.js 18 o superior** (recomendado 20 o 22)
- La API funcionando en `http://localhost:8000` (`php -S localhost:8000 -t public` desde `veterinaria-api`)

## Puesta en marcha

```
npm install
npm run dev
```

Abrí http://localhost:5173 e ingresá con tu usuario de la API.

En desarrollo no hace falta configurar nada: Vite reenvía todo lo que empieza con `/api` a
`http://localhost:8000` (ver `vite.config.js`), así que no hay problemas de CORS.
Si tu API corre en otro puerto, cambiá `target` en `vite.config.js`.

## Pantallas

| Pantalla | Qué hace |
|---|---|
| **Inicio** | Totales, vacunas vencidas, vacunas que vencen en 30 días y últimas consultas |
| **Propietarios** | Listado con búsqueda; ficha con datos de contacto y sus mascotas |
| **Mascotas** | Listado con búsqueda y filtro por especie; **ficha con la historia clínica**: consultas, vacunas y cuotas en pestañas |
| **Consultas** | Historial con filtros por fecha y texto; detalle con edición, **3 archivos adjuntos** y **PDF** |
| **Vacunas** | Vencidas, por vencer (días configurables) o todas; opción de ver el histórico |
| **Cuotas** | Pagos por período (por defecto el mes actual) con el total |
| **Especies** | Alta, edición y baja |
| **Usuarios** | Solo administradores: alta, edición, reset de contraseña y baja |

Desde el menú del usuario (abajo en el menú lateral) se cambia la contraseña propia y se cierra sesión.
Los botones de eliminar solo aparecen para administradores, igual que en la API.

## Estructura

```
src/
├── main.jsx               # proveedores: Mantine, React Query, modales, notificaciones, router, sesión
├── App.jsx                # rutas
├── api/
│   ├── client.js          # Axios + tokens en localStorage + renovación automática del token
│   └── resources.js       # funciones de cada recurso de la API
├── auth/                  # AuthContext (login, logout, usuario) y RequireAuth (rutas protegidas)
├── hooks/useApi.js        # useListado, useDetalle, useGuardar, useEliminar
├── components/
│   ├── Layout.jsx         # menú lateral + contenido
│   ├── common.jsx         # tabla, paginación, encabezado, confirmación de borrado, etc.
│   ├── selects.jsx        # selects de propietario y mascota con búsqueda en la API
│   └── forms/             # un formulario por entidad
├── pages/                 # una página por pantalla
└── utils/                 # formato de fechas y dinero, notificaciones, apertura de archivos
```

## Cómo funciona la sesión

1. El login guarda el `access_token` (dura 1 hora) y el `refresh_token` (30 días) en `localStorage`.
2. Cada petición manda `Authorization: Bearer <access_token>`.
3. Si una petición responde 401, `api/client.js` canjea el refresh token en `/auth/refresh`, guarda el par nuevo
   y repite la petición. Si varias fallan a la vez, se hace un solo refresh.
4. Si el refresh también falla, se borra la sesión y vuelve al login.

Los archivos adjuntos y el PDF también piden token, así que se descargan con Axios y se abren como blob
(ver `utils/files.js`); un enlace común no funcionaría.

## Producción

```
npm run build
```

Genera la carpeta `dist/` con archivos estáticos. Para publicarla:

- Definí la URL real de la API antes del build, en un archivo `.env`:
  `VITE_API_URL=https://api.tudominio.com`
  y en el `.env` de la API poné `CORS_ALLOWED_ORIGIN=https://tudominio.com`.
  (Otra opción es servir la API bajo `/api` del mismo dominio y dejar `VITE_API_URL=/api`.)
- El servidor tiene que devolver `index.html` para cualquier ruta (ej: `/mascotas/25`), porque las rutas las maneja React.
  En Apache, un `.htaccess` en `dist/`:
  ```
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
  ```
- Usá HTTPS.

## Ideas para seguir

- Pasar el refresh token a una cookie `httpOnly` (más seguro que `localStorage`; requiere cambios en la API).
- Recordatorios de vacunas por WhatsApp o email a partir de la pantalla de vencimientos.
- Imprimir o enviar el PDF de la consulta directamente al email del propietario.
