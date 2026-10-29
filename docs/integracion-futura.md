# Integración frontend ↔ API — WalkPets

> **Estado:** implementada. El frontend puede consumir el backend NestJS + MongoDB de `backend/` o seguir usando el mock en memoria.
> **Última actualización:** 2026-10-25.

---

## 1. Resumen

La app funciona con dos fuentes de datos intercambiables:

| Fuente | Cuándo se usa | Datos |
|---|---|---|
| `mock` | Por defecto. Desarrollo sin backend y tests de pantallas. | Arreglos en memoria (`PASEADORES_MOCK`, `USUARIOS_MOCK`). |
| `api` | `EXPO_PUBLIC_DATA_SOURCE=api` **y** `EXPO_PUBLIC_API_URL` con valor. | API REST NestJS + MongoDB. |

Las pantallas no saben de dónde vienen los datos: siempre llaman a los servicios de `src/services/`. El cambio de fuente se resuelve dentro de esos servicios.

```text
Pantalla
  → src/services/paseadores.service.ts | auth.service.ts | resenas.service.ts
      ├── usarApi() === false → mock en memoria
      └── usarApi() === true  → src/services/api/client.ts → API NestJS → MongoDB
```

---

## 2. Configuración

### 2.1 Frontend

Creá `.env` en la raíz (está gitignoreado) a partir de `.env.example`:

```env
# mock (por defecto) | api
EXPO_PUBLIC_DATA_SOURCE=mock

# Base de la API, incluyendo el prefijo /api. Sin barra final.
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# Timeout de cada request en milisegundos
EXPO_PUBLIC_API_TIMEOUT_MS=10000
```

- Expo solo embebe en el bundle las variables que empiezan con `EXPO_PUBLIC_`. **Nunca** pongas secretos ahí.
- Después de cambiar `.env`, reiniciá Metro (`npm start`) para que tome los valores.
- Si `EXPO_PUBLIC_DATA_SOURCE=api` pero `EXPO_PUBLIC_API_URL` está vacío, `usarApi()` devuelve `false` y la app sigue con el mock.

### 2.2 Backend

```powershell
cd backend
copy .env.example .env
```

Completá en `backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/walkpets
JWT_SECRET=<cadena larga y aleatoria, mínimo 16 caracteres>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=
```

`backend/.env` está gitignoreado; solo se versiona `.env.example`. La app valida el entorno al arrancar y falla con un mensaje claro si falta `MONGODB_URI`, si `JWT_SECRET` es corto o si todavía tiene el valor de ejemplo.

---

## 3. Puesta en marcha

### 3.1 Solo mock (sin backend)

```powershell
npm.cmd start
```

No hace falta MongoDB ni variables de entorno.

### 3.2 Con API y MongoDB local

Requisitos: MongoDB escuchando en `127.0.0.1:27017` y Node 20+.

```powershell
# Terminal 1 — API
cd backend
npm.cmd install
copy .env.example .env    # completar MONGODB_URI y JWT_SECRET
npm.cmd run start:dev     # http://localhost:3000

# Terminal 2 — app
$env:EXPO_PUBLIC_DATA_SOURCE="api"
$env:EXPO_PUBLIC_API_URL="http://localhost:3000/api"
npm.cmd start
```

Verificá la API antes de abrir la app:

```powershell
curl http://localhost:3000/api/health
# { "status": "ok", "servicio": "walkpets-api", "baseDeDatos": "conectado", ... }
```

Swagger: http://localhost:3000/api/docs

### 3.3 MongoDB con Atlas

1. Creá un cluster gratuito en MongoDB Atlas.
2. Creá un usuario de base de datos con permiso sobre la base `walkpets`.
3. Habilitá el acceso desde tu IP (o `0.0.0.0/0` solo para pruebas).
4. Copiá el connection string a `backend/.env`:

```env
MONGODB_URI=mongodb+srv://<usuario>:<clave>@<cluster>/walkpets?retryWrites=true&w=majority
```

Nunca commitees ese valor. Si una credencial se filtró, rotala en Atlas.

### 3.4 Datos

No hay seed ni cuentas de prueba: la base arranca vacía y se completa registrando paseadores y clientes desde la app.

---

## 4. Redes: localhost, emulador y dispositivo físico

`localhost` dentro de un emulador o un celular apunta al propio dispositivo, no a tu PC.

| Entorno | `EXPO_PUBLIC_API_URL` |
|---|---|
| Web en la misma PC | `http://localhost:3000/api` |
| Emulador Android | `http://10.0.2.2:3000/api` |
| Simulador iOS | `http://localhost:3000/api` |
| Dispositivo físico (Expo Go) | `http://<IP-LAN-de-tu-PC>:3000/api` |

Para obtener la IP LAN en Windows: `ipconfig` → adaptador activo → `IPv4`.

El backend escucha en `0.0.0.0` (por defecto de Nest), así que acepta conexiones de la red local. Si usás `CORS_ORIGIN`, incluí el origen de Expo web (por ejemplo `http://localhost:8081`). Sin `CORS_ORIGIN`, acepta cualquier origen, algo válido solo para desarrollo.

---

## 5. Capa de acceso a datos

| Archivo | Responsabilidad |
|---|---|
| `src/config/api.ts` | Lee `EXPO_PUBLIC_*` y expone `usarApi()`. |
| `src/services/api/client.ts` | `fetch` con timeout, `Authorization`, parseo de errores a `ApiError`. |
| `src/services/paseadores.service.ts` | Fachada de listado, perfil y alta; mapea DTO ↔ modelo. |
| `src/services/auth.service.ts` | Login y registro de cliente; mapea usuario. |
| `src/services/resenas.service.ts` | Alta y consulta de reseñas. |
| `src/services/sesion.service.ts` | Persistencia de la sesión en AsyncStorage. |
| `src/context/SesionContext.tsx` | Estado global de sesión y logout. |

`apiFetch` construye la URL como `${API_URL}${path}`, por eso `EXPO_PUBLIC_API_URL` debe incluir `/api` y no terminar en barra. Si el backend responde `204`, devuelve `undefined`; si el body no es JSON válido, se trata como error de servidor.

### 5.1 Mapeo API → modelo del frontend

| API (`PaseadorDto`) | Modelo (`Paseador`) |
|---|---|
| `id` | `id` |
| `usuarioId` | `usuarioId` |
| `fotoUrl` | `foto` |
| `calificacionPromedio` | `calificacion` |
| `cantidadResenas` | `cantidadResenas` |
| `telefono` (`+549...`) | `telefono` |
| `resenas[].autorNombre` | `resenas[].autor` |
| `resenas[].fecha` (ISO) | `resenas[].fecha` (`YYYY-MM-DD`) |

En `auth.service.ts` y `paseadores.service.ts`, `telefono: null` del backend se normaliza a `undefined` porque el modelo del frontend usa `telefono?: string`.

---

## 6. Autenticación en el cliente

1. `POST /api/auth/login` o `POST /api/auth/registro` devuelven `{ accessToken, usuario, paseador? }`.
2. El servicio guarda `{ token, usuario }` en AsyncStorage bajo `walkpets.sesion.v1`.
3. `SesionProvider` carga la sesión al iniciar la app.
4. `apiFetch` agrega `Authorization: Bearer <token>` cuando el servicio pasa el token.
5. Logout borra la clave de AsyncStorage y limpia el contexto.

El perfil usa el token (si existe) para que el backend marque `esPropietario`. Sin sesión, el perfil sigue siendo público.

Limitaciones: el token vive en AsyncStorage (no en `expo-secure-store`), no hay refresh token ni revocación, y la app no refresca el usuario desde el backend al reabrir.

---

## 7. Manejo de errores y estados

| Situación | Comportamiento |
|---|---|
| Red caída | `ApiError` “No se pudo conectar con el servidor.” y estado de error con reintento. |
| Timeout | `ApiError` “La conexión con el servidor tardó demasiado.” |
| 404 en perfil | `getPaseadorById` devuelve `null`; la pantalla muestra error. |
| 400 de validación | `ApiError.detalles` con la lista de mensajes del backend. |
| 401 | La pantalla muestra el mensaje; no hay refresh automático. |
| 403 | La pantalla muestra el mensaje de permisos. |
| 409 | “Ya existe una cuenta con ese email.” en el registro. |
| 500 | Estado de error con reintento. |

Las pantallas ya manejan carga, error, vacío, sin resultados y reintento. El cliente solo traduce fallos HTTP a mensajes compatibles.

---

## 8. Contacto por teléfono y WhatsApp

El contacto no depende del backend más allá del teléfono público del paseador:

```text
Perfil → src/utils/telefono.ts → normalizar a 549...
       → Linking.openURL('tel:+549...')
       → Linking.openURL('https://wa.me/549...?text=<mensaje WalkPets>')
```

El teléfono se muestra como `+54 9 299 4123-456`. Si el número no es válido, las acciones no se renderizan.

---

## 9. Tests de la integración

`__tests__/services/api.integracion.test.ts` fuerza el modo API y simula `fetch` para verificar:

- Mapeo del listado (`fotoUrl`, `calificacionPromedio`, `resenas`).
- Envío de `Authorization: Bearer` en el perfil y mapeo de reseñas.
- `404` → `null`.
- `POST` de reseña con token.
- `ApiError` con `detalles` en un `400`.
- Error de conexión cuando `fetch` falla.

No se usan credenciales reales ni una base de producción. El E2E del backend corre contra `mongodb-memory-server`.

---

## 10. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| La app sigue mostrando datos mock | `EXPO_PUBLIC_DATA_SOURCE` no es `api`, falta `EXPO_PUBLIC_API_URL` o Metro no se reinició. | Revisá `.env` y reiniciá `npm start`. |
| “No se pudo conectar con el servidor” en emulador Android | `localhost` apunta al emulador. | Usá `http://10.0.2.2:3000/api`. |
| “No se pudo conectar” en celular físico | IP incorrecta o firewall. | Usá la IP LAN y permití el puerto 3000. |
| El backend no arranca | Falta `MONGODB_URI`, `JWT_SECRET` corto o MongoDB no responde. | Leé el error de validación y verificá MongoDB. |
| CORS en Expo web | `CORS_ORIGIN` no incluye el origen. | Agregá `http://localhost:8081` o dejalo vacío en desarrollo. |
| `npm test` del backend falla con “Missing required sub-document 'driver'” | El driver de MongoDB necesita módulos VM en Jest. | Usá los scripts del paquete, que ya incluyen `--experimental-vm-modules`. |

---

## 11. Fuera de alcance

- Despliegue productivo y monitoreo.
- Refresh tokens, verificación de email y recuperación de contraseña.
- Rate limiting.
- Paginación y búsqueda por texto.
- Reservas, pagos, mapas y notificaciones push.
