# WalkPets — Paseadores

Aplicación para encontrar paseadores de perros en **Cipolletti** y **Neuquén**, ver sus perfiles y reseñas, y contactarlos por teléfono o WhatsApp.

El repositorio incluye la app móvil/web (Expo + React Native) y una API REST propia (NestJS + MongoDB).

---

## Descripción

**WalkPets** conecta a dueños de mascotas con paseadores locales. Permite explorar perfiles, leer reseñas reales y contactar al paseador directamente. El contacto y la coordinación quedan entre las partes: la app no gestiona reservas ni pagos.

**Usuario objetivo:** dueños de perros que viven en Cipolletti o Neuquén y buscan un paseador de confianza.

**Problema que resuelve:** la búsqueda de paseadores confiables suele depender del boca en boca o de grupos de WhatsApp. WalkPets centraliza la oferta local con perfiles, filtros por ciudad y barrio, y reseñas.

---

## Funcionalidades

- Landing informativa para Cipolletti y Neuquén.
- Listado de paseadores con filtros por **ciudad**, **barrio** y **disponibilidad**.
- Tarjetas con ciudad, barrio, precio por hora, calificación y disponibilidad.
- Perfil con descripción, razas aceptadas, reseñas y datos de contacto.
- Acciones **Llamar** (`tel:`) y **WhatsApp** (`wa.me` con mensaje prellenado).
- Registro de paseador con selector de ciudad, email, contraseña y validación de teléfono.
- Registro e inicio de sesión de clientes; sesión persistida en el dispositivo.
- Clientes autenticados pueden publicar reseñas; paseadores autenticados pueden consultar las reseñas de su perfil.
- Estados de interfaz: carga, error, vacío, sin resultados y reintento.
- Backend con autenticación JWT, roles, validación de DTOs, Swagger y persistencia en MongoDB.
- Dos fuentes de datos: **api** (backend real, la versión funcional) y **mock** (en memoria, vacío al iniciar; para desarrollo y tests).

> El flujo de reserva de turnos **no forma parte del producto actual**.

---

## Stack

| Paquete | Ubicación | Tecnología |
|---|---|---|
| App | raíz del repo | Expo SDK 54, React Native 0.81, Expo Router 6, TypeScript |
| API | `backend/` | NestJS 11, Mongoose 9, MongoDB, JWT, bcryptjs |

---

## Requisitos

- Node.js 20 o superior.
- npm.
- Para el modo API: una instancia de MongoDB local o un cluster de MongoDB Atlas.

---

## Instalación y uso

### 1. App en modo mock (sin backend)

```bash
npm ci
npm start
```

Escaneá el QR con **Expo Go** o abrí la app en el emulador. No hace falta configurar nada más.

### 2. App + API + MongoDB

```bash
# API
cd backend
npm ci
copy .env.example .env    # completar MONGODB_URI y JWT_SECRET
npm run start:dev         # http://localhost:3000

# App (otra terminal, en la raíz)
# .env
# EXPO_PUBLIC_DATA_SOURCE=api
# EXPO_PUBLIC_API_URL=http://localhost:3000/api
npm start
```

Comprobá la API en http://localhost:3000/api/health y la documentación en http://localhost:3000/api/docs.

### 3. Datos

No hay datos ni cuentas de prueba: la app arranca vacía. Registrá tus paseadores desde
`/paseadores/registro` y tus clientes desde `/login` (pestaña "Crear cuenta").

---

## Variables de entorno

### Frontend (`.env` en la raíz)

| Variable | Valores | Uso |
|---|---|---|
| `EXPO_PUBLIC_DATA_SOURCE` | `mock` \| `api` | Fuente de datos. Por defecto `mock`. |
| `EXPO_PUBLIC_API_URL` | `http://localhost:3000/api` | Base de la API, con `/api` y sin barra final. |
| `EXPO_PUBLIC_API_TIMEOUT_MS` | `10000` | Timeout de cada request. |

Las variables `EXPO_PUBLIC_*` se embeben en el bundle: **nunca** pongas secretos ahí. Ver `.env.example`.

### Backend (`backend/.env`)

| Variable | Obligatoria | Uso |
|---|---|---|
| `MONGODB_URI` | Sí | Conexión a MongoDB local o Atlas. |
| `JWT_SECRET` | Sí | Firma de tokens (mínimo 16 caracteres, distinto del ejemplo). |
| `JWT_EXPIRES_IN` | No | Expiración del token (por defecto `7d`). |
| `PORT` | No | Puerto HTTP (por defecto `3000`). |
| `CORS_ORIGIN` | No | Orígenes permitidos separados por coma; vacío = todos. |

`.env` está gitignoreado; solo se versiona `.env.example`.

### Redes según el entorno

| Entorno | `EXPO_PUBLIC_API_URL` |
|---|---|
| Web / simulador iOS | `http://localhost:3000/api` |
| Emulador Android | `http://10.0.2.2:3000/api` |
| Celular físico | `http://<IP-LAN-de-tu-PC>:3000/api` |

---

## Estructura del proyecto

```text
WalkPets/
├── app/                        Rutas de Expo Router
│   ├── _layout.tsx             Stack raíz + SesionProvider
│   ├── index.tsx               Landing
│   ├── login.tsx               Login y registro
│   ├── mis-resenas.tsx         Reseñas del paseador autenticado
│   └── paseadores/
│       ├── index.tsx           Listado y filtros
│       ├── [id].tsx            Perfil, contacto y reseña
│       └── registro.tsx        Alta de paseador
├── components/                 UI reutilizable
├── src/
│   ├── config/api.ts           Fuente de datos y URL
│   ├── constants/              Ciudades y tema
│   ├── context/                Sesión global
│   ├── services/               Fachada mock/API, auth, reseñas, sesión
│   ├── types/                  Contratos TypeScript
│   └── utils/                  Normalización de teléfono
├── __tests__/                  Tests del frontend
├── backend/                    API NestJS independiente
│   ├── src/                    Módulos, esquemas, guards
│   ├── test/                   Unitarios + E2E
│   └── .env.example
├── docs/                       Especificaciones, arquitectura y pruebas
├── .env.example
└── package.json
```

---

## Comandos

### Frontend (raíz)

```bash
npm start              # expo start
npm run android        # expo start --android
npm run ios            # expo start --ios
npm run web            # expo start --web
npm run typecheck      # tsc --noEmit
npm run lint           # expo lint
npm test               # jest
npm run test:coverage  # jest --coverage
npm run verify         # typecheck + lint + test
```

### Backend (`backend/`)

```bash
npm run start:dev      # nest start --watch
npm run typecheck      # tsc --noEmit
npm test               # jest con MongoDB efímera
npm run test:coverage
npm run build          # nest build
npm run verify         # typecheck + test + build
```

En Windows con PowerShell bloqueado, usá `npm.cmd` y `npx.cmd`.

---

## API

Prefijo global `/api`. Documentación interactiva en `/api/docs`.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Estado del servicio y de MongoDB |
| POST | `/api/auth/registro` | Público | Crea cliente o paseador y devuelve JWT |
| POST | `/api/auth/login` | Público | Login, devuelve JWT |
| GET | `/api/paseadores` | Público | Listado; filtros `ciudad`, `barrio`, `disponible` |
| GET | `/api/paseadores/:id` | Público | Perfil con reseñas |
| POST | `/api/paseadores/:id/resenas` | Cliente | Publica una reseña |
| GET | `/api/resenas/mias` | Paseador | Reseñas del propio perfil |

Errores normalizados:

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

## Tests

| Paquete | Suites | Tests |
|---|---|---|
| Frontend | 12 | 88 |
| Backend | 3 | 39 |

El frontend usa Jest + `jest-expo` + React Native Testing Library. El backend usa Jest + `ts-jest` + `supertest` + `mongodb-memory-server` (MongoDB efímera, sin credenciales reales).

```bash
# Frontend
npm run verify

# Backend
cd backend
npm run verify
```

No hay CI configurado.

---

## Documentación

- [`docs/especificaciones.md`](docs/especificaciones.md) — alcance, requisitos y reglas de negocio.
- [`docs/arquitectura.md`](docs/arquitectura.md) — estructura, capas, modelos y API.
- [`docs/plan-de-pruebas.md`](docs/plan-de-pruebas.md) — estrategia y casos de prueba.
- [`docs/integracion-futura.md`](docs/integracion-futura.md) — guía de integración frontend ↔ API.
- [`AGENTS.md`](AGENTS.md) — notas operativas para desarrollo.

---

## Limitaciones conocidas

- El token se guarda en AsyncStorage, no en `expo-secure-store`.
- No hay refresh tokens, verificación de email, recuperación de contraseña ni rate limiting.
- No se valida que el autor de una reseña haya contratado al paseador.
- Sin paginación ni búsqueda por texto.
- Sin despliegue ni monitoreo.
- El flujo de reserva de turnos se eliminó y no forma parte del producto.

---

## Autor

Yair Melinguer  
Tecnicatura Superior en Desarrollo de Software Full Stack  
Materia: Aplicaciones Móviles — 2026
