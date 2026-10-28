# Arquitectura — WalkPets

> **Estado:** frontend Expo + backend NestJS + MongoDB implementados en el repositorio.
> **Última actualización:** 2026-10-25.

---

## 1. Resumen

WalkPets conecta dueños de mascotas con paseadores de **Cipolletti** y **Neuquén**. El flujo objetivo es:

```text
Buscar paseadores → filtrar por ciudad / barrio / disponibilidad → ver perfil y reseñas → contactar por teléfono o WhatsApp
```

El repositorio contiene dos paquetes independientes:

| Paquete | Ubicación | Tecnología |
|---|---|---|
| App móvil/web | raíz del repo | Expo SDK 54, React Native 0.81, Expo Router 6, TypeScript |
| API REST | `backend/` | NestJS 11, Mongoose 9, MongoDB, JWT |

Las reservas **no forman parte del flujo vigente**. Quedan archivos legados sin uso (ver §12).

---

## 2. Estado verificado

| Aspecto | Estado |
|---|---|
| Frontend | Implementado |
| Backend | Implementado en `backend/` |
| Base de datos | MongoDB vía `MONGODB_URI` |
| Autenticación | JWT con roles `cliente` / `paseador`, contraseñas con bcrypt |
| Sesión en el cliente | Guardada en AsyncStorage |
| Fuente de datos | `mock` (por defecto) o `api`, según `EXPO_PUBLIC_DATA_SOURCE` |
| Tests frontend | 12 suites / 88 tests |
| Tests backend | 3 suites / 39 tests |
| Typecheck | `npm run typecheck` en ambos paquetes |
| Lint | `npm run lint` (frontend), sin warnings |
| CI | No configurado |

---

## 3. Estructura

```text
WalkPets/
├── app/                              Rutas de Expo Router
│   ├── _layout.tsx                   Stack raíz + SesionProvider
│   ├── index.tsx                     Landing
│   ├── login.tsx                     Login, registro de cliente y sesión activa
│   ├── mis-resenas.tsx               Reseñas del paseador autenticado
│   └── paseadores/
│       ├── index.tsx                 Listado y filtros
│       ├── [id].tsx                  Perfil, contacto y alta de reseña
│       ├── registro.tsx              Registro de paseador
│       └── reserva.tsx               LEGADO: no está enlazado en la UI
├── components/                       UI reutilizable
├── src/
│   ├── config/api.ts                 Fuente de datos y URL de la API
│   ├── constants/
│   │   ├── ciudades.ts               Ciudades habilitadas
│   │   └── theme.ts                  Tokens de diseño
│   ├── context/SesionContext.tsx     Sesión global
│   ├── hooks/                        Hooks de formularios (incluye legado)
│   ├── services/
│   │   ├── paseadores.service.ts     Fachada mock/API de paseadores
│   │   ├── auth.service.ts           Login y registro
│   │   ├── resenas.service.ts        Reseñas
│   │   ├── sesion.service.ts         Persistencia de sesión
│   │   └── api/client.ts             fetch + timeout + ApiError
│   ├── types/paseador.ts             Contratos TypeScript
│   └── utils/telefono.ts             Normalización y links tel/WhatsApp
├── __tests__/                        Tests del frontend
├── backend/                          Paquete NestJS independiente
│   ├── src/
│   │   ├── main.ts                   Bootstrap, ValidationPipe, CORS, Swagger
│   │   ├── app.module.ts             Config, MongoDB y módulos
│   │   ├── auth/                     Registro, login, JWT, guards
│   │   ├── usuarios/                 Cuentas y hash de contraseña
│   │   ├── paseadores/               Perfiles públicos, filtros y reseñas
│   │   ├── resenas/                  Alta y consulta de reseñas
│   │   ├── health/                   Estado del servicio
│   │   ├── common/                   Filtro de errores, guards, decoradores
│   │   ├── config/                   Validación de variables de entorno
│   │   └── seed/                     Datos de demostración idempotentes
│   ├── test/                         Unitarios + E2E con mongodb-memory-server
│   ├── .env.example
│   └── package.json
├── docs/
├── app.json
├── package.json
└── tsconfig.json
```

`app/` es la raíz del router (`main: "expo-router/entry"`). `__tests__/` queda fuera de `app/` a propósito: todo archivo dentro de `app/` se convierte en ruta. `backend/` tiene su propio `package.json`, `tsconfig.json` y `package-lock.json`, sin npm workspaces, y el `tsconfig.json` del frontend lo excluye.

---

## 4. Navegación

| Ruta | Archivo | Propósito | Estado |
|---|---|---|---|
| `/` | `app/index.tsx` | Landing | Vigente |
| `/login` | `app/login.tsx` | Login, registro de cliente y resumen de sesión | Vigente |
| `/paseadores` | `app/paseadores/index.tsx` | Listado y filtros | Vigente |
| `/paseadores/[id]` | `app/paseadores/[id].tsx` | Perfil, contacto y reseña | Vigente |
| `/paseadores/registro` | `app/paseadores/registro.tsx` | Alta de paseador | Vigente |
| `/mis-resenas` | `app/mis-resenas.tsx` | Reseñas propias del paseador | Vigente |
| `/paseadores/reserva` | `app/paseadores/reserva.tsx` | Reserva de turno | **Legado, sin enlaces** |

El header global define colores, tipografía y un `BackButton` animado. El listado sobrescribe el botón para volver a `/`.

---

## 5. Capas del frontend

| Capa | Ubicación | Responsabilidad |
|---|---|---|
| Presentación | `app/` | Pantallas, navegación y estado local. |
| Componentes | `components/` | UI reutilizable sin lógica de negocio. |
| Sesión | `src/context/SesionContext.tsx` | Usuario autenticado y logout. |
| Formularios | `src/hooks/`, pantallas | Estado y validación de entrada. |
| Datos | `src/services/` | Fachada mock/API, auth, reseñas y sesión. |
| Transporte | `src/services/api/client.ts` | HTTP, timeout y errores tipados. |
| Tipos | `src/types/` | Contratos TypeScript. |
| Diseño | `src/constants/theme.ts` | Colores, tipografía, espaciado, radios y sombras. |

---

## 6. Flujo de datos

```text
Pantalla (useEffect + useState)
  → src/services/paseadores.service.ts | auth.service.ts | resenas.service.ts
      ├── usarApi() === false → PASEADORES_MOCK / USUARIOS_MOCK en memoria
      └── usarApi() === true  → src/services/api/client.ts → API NestJS → MongoDB
  → Paseador / Resena / Sesion
```

- `usarApi()` es verdadero solo si `EXPO_PUBLIC_DATA_SOURCE=api` **y** `EXPO_PUBLIC_API_URL` tiene valor.
- El mock sigue siendo la fuente por defecto y el modo usado por los tests de pantallas.
- Las pantallas manejan carga, error, vacío, reintento y (en el listado) sin resultados.
- El filtrado por ciudad, barrio y disponibilidad se hace en el cliente sobre el listado recibido; la API también acepta esos filtros por query string.

### 6.1 Mapeo API → modelo del frontend

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

El mapeo vive en `src/services/paseadores.service.ts` y `src/services/resenas.service.ts`. Las pantallas nunca llaman a `fetch`.

---

## 7. Autenticación y roles

- `POST /api/auth/registro` crea un usuario `cliente` o `paseador`. Si el rol es `paseador`, exige teléfono y perfil, y crea ambos documentos; si el perfil falla, elimina la cuenta creada.
- `POST /api/auth/login` valida email y contraseña y devuelve `{ accessToken, usuario }`.
- Las contraseñas se guardan con `bcryptjs` (10 rondas) y el campo `passwordHash` tiene `select: false`.
- El JWT viaja en `Authorization: Bearer <token>`. `JwtStrategy` recarga el usuario desde MongoDB en cada request, por lo que un usuario eliminado pierde acceso.
- Roles efectivos: `cliente` y `paseador`.
  - Publicar reseña: solo `cliente` autenticado y nunca sobre el propio perfil.
  - Consultar reseñas propias: solo `paseador` autenticado.
  - Listado y perfil: públicos. El perfil usa un guard JWT opcional para marcar `esPropietario`.
- En el frontend la sesión se guarda en AsyncStorage (`walkpets.sesion`), se carga al iniciar (`SesionProvider`) y se borra al cerrar sesión.

Limitaciones conocidas de seguridad: no hay refresh tokens, verificación de email, recuperación de contraseña, rate limiting ni bloqueo por intentos. El token se guarda en AsyncStorage, no en `expo-secure-store`.

---

## 8. API REST

Prefijo global `/api`. Documentación Swagger en `/api/docs` cuando el servidor está corriendo.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Estado del servicio y de MongoDB |
| POST | `/api/auth/registro` | Público | Crea cliente o paseador y devuelve JWT |
| POST | `/api/auth/login` | Público | Login, devuelve JWT |
| GET | `/api/paseadores` | Público | Listado; filtros `ciudad`, `barrio`, `disponible` |
| GET | `/api/paseadores/:id` | Público (JWT opcional) | Perfil con últimas 50 reseñas |
| POST | `/api/paseadores/:id/resenas` | Cliente | Publica reseña y recalcula promedio |
| GET | `/api/resenas/mias` | Paseador | Reseñas del propio perfil |

Errores normalizados por `AllExceptionsFilter`:

```json
{
  "statusCode": 400,
  "message": ["texto debe tener al menos 10 caracteres"],
  "error": "Bad Request",
  "path": "/api/paseadores/...",
  "timestamp": "2026-10-25T12:00:00.000Z"
}
```

---

## 9. Modelos MongoDB

### `usuarios`

```ts
{
  _id: ObjectId;
  nombre: string;
  apellido: string;
  email: string;           // único, lowercase
  passwordHash: string;    // select: false
  telefono: string | null; // opcional para clientes
  rol: 'cliente' | 'paseador';
  createdAt: Date;
  updatedAt: Date;
}
```

### `paseadores`

```ts
{
  _id: ObjectId;
  usuario: ObjectId;       // único, ref Usuario
  nombre: string;
  apellido: string;
  fotoUrl: string;
  ciudad: 'Cipolletti' | 'Neuquén';
  barrio: string;
  descripcion: string;
  precioHora: number;
  telefono: string;        // obligatorio, normalizado
  disponible: boolean;
  razasAceptadas: string[];
  calificacionPromedio: number;
  cantidadResenas: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### `resenas`

```ts
{
  _id: ObjectId;
  paseador: ObjectId;
  autor: ObjectId;
  autorNombre: string;     // snapshot, evita exponer datos privados
  mascota: string;
  texto: string;
  calificacion: number;    // 1..5
  fecha: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

Relaciones:

```text
Usuario 1 ─── 0..1 Paseador
Paseador 1 ─── N Resena
Usuario 1 ─── N Resena
```

Las reseñas viven en colección separada y los contadores (`calificacionPromedio`, `cantidadResenas`) se recalculan con una agregación después de cada alta.

---

## 10. Configuración

### Frontend

| Variable | Ejemplo | Uso |
|---|---|---|
| `EXPO_PUBLIC_DATA_SOURCE` | `mock` \| `api` | Fuente de datos |
| `EXPO_PUBLIC_API_URL` | `http://localhost:3000/api` | Base de la API |
| `EXPO_PUBLIC_API_TIMEOUT_MS` | `10000` | Timeout de `fetch` |

`EXPO_PUBLIC_*` se embebe en el bundle: nunca debe contener secretos. Ver `.env.example`.

### Backend

| Variable | Obligatoria | Uso |
|---|---|---|
| `MONGODB_URI` | Sí | Conexión MongoDB local o Atlas |
| `JWT_SECRET` | Sí (≥ 16 caracteres, distinto del ejemplo) | Firma de tokens |
| `JWT_EXPIRES_IN` | No (`7d`) | Expiración del token |
| `PORT` | No (`3000`) | Puerto HTTP |
| `CORS_ORIGIN` | No | Orígenes permitidos, separados por coma; vacío = todos |
| `SEED_PASSWORD` | Solo seed | Contraseña de las cuentas demo |

La validación de entorno falla al arrancar con un mensaje claro si falta o es inválido un valor obligatorio. `.env` está gitignoreado; solo se versiona `.env.example`.

---

## 11. Dependencias

### Frontend (agregadas para este trabajo)

| Paquete | Versión | Motivo |
|---|---|---|
| `@react-native-async-storage/async-storage` | 2.2.0 | Persistir la sesión |
| `jest-expo` | 54.0.18 | Arnés de tests |
| `jest` | 29.7.0 | Test runner |
| `@testing-library/react-native` | 13.3.3 | Tests de pantallas y componentes |
| `react-test-renderer` | 19.1.0 | Renderer de RNTL |
| `eslint` | 9.39.5 | Lint |
| `eslint-config-expo` | 9.2.0 | Configuración de lint de Expo |

### Backend

| Paquete | Versión |
|---|---|
| `@nestjs/common`, `core`, `platform-express`, `testing` | 11.2.8 |
| `@nestjs/config` | 4.0.4 |
| `@nestjs/mongoose` | 11.0.4 |
| `@nestjs/jwt` | 11.0.2 |
| `@nestjs/passport` | 11.0.5 |
| `@nestjs/swagger` | 11.4.7 |
| `mongoose` | 9.11.4 |
| `bcryptjs` | 3.0.3 |
| `class-validator` / `class-transformer` | 0.15.1 / 0.5.1 |
| `passport` / `passport-jwt` | 0.7.0 / 4.0.1 |
| `mongodb-memory-server` | 11.3.0 (dev) |
| `supertest` | 7.3.1 (dev) |
| `ts-jest` | 29.4.15 (dev) |

**Por qué NestJS 11 y no 12:** `@nestjs/schematics@12` exige TypeScript ≥ 6 y `@nestjs/config@12` es ESM-only, lo que rompe el setup CJS/TS 5.9.3 y Jest. `@nestjs/config@4.0.4` es la versión compatible con Nest 11.

**Nota sobre tests del backend:** el driver de MongoDB 7.7.0 (incluido por mongoose 9) usa `import('os')` dinámico. Jest falla con `Missing required sub-document 'driver'` si no se ejecuta con módulos VM, por eso los scripts usan `node --experimental-vm-modules node_modules/jest/bin/jest.js`.

---

## 12. Deuda técnica y legado

| Tema | Descripción |
|---|---|
| Reservas | `app/paseadores/reserva.tsx`, `src/hooks/useReservaForm.ts`, `ReservaTurno`, `Turno` y `turnosDisponibles` siguen en el repo, sin enlaces en la UI vigente. |
| CI | No hay pipeline. |
| Lint | Sin warnings. |
| Seguridad | Sin refresh tokens, verificación de email, recuperación de contraseña, rate limiting ni `expo-secure-store`. |
| Reseñas | No se valida que el cliente haya contratado al paseador; solo que no sea el dueño del perfil. |
| Paginación | El listado y las reseñas no paginan. |
| Imágenes | El mock usa `randomuser.me`; el registro acepta una URL de foto. |
| Estilos | Quedan colores de marca hardcodeados que no coinciden con el tema. |
| CORS | Sin `CORS_ORIGIN`, el backend acepta cualquier origen (solo aceptable en desarrollo). |
| Seed | Requiere `SEED_PASSWORD` y una base accesible; no se ejecuta en tests. |

---

## 13. Verificación

```bash
# Frontend
npm run verify        # typecheck + lint + test

# Backend
cd backend
npm run verify        # typecheck + test + build
```

Estado actual: frontend 88/88 tests, backend 39/39 tests, typecheck y build sin errores. La verificación funcional de rutas y de la API real requiere MongoDB y sigue siendo manual.
