# Plan de pruebas — WalkPets

> **Estado:** frontend y backend implementados y verificados.
> **Última actualización:** 2026-10-25.

---

## 1. Situación actual

- Frontend: Expo SDK 54 + Expo Router 6, datos de la API NestJS.
- Backend: NestJS 11 + Mongoose 9 + MongoDB, en `backend/`.
- Auth real con JWT y roles; contraseñas con bcrypt.
- Arnés del frontend: Jest 29 + `jest-expo` + React Native Testing Library.
- Arnés del backend: Jest + `@nestjs/testing` + `supertest` + `mongodb-memory-server`.
- Sin CI configurado.

### 1.1 Última ejecución verificada

| Paquete  | Comando             | Resultado                    |
| -------- | ------------------- | ---------------------------- |
| Frontend | `npm run typecheck` | Sin errores                  |
| Frontend | `npm run lint`      | Sin errores ni warnings      |
| Frontend | `npm test`          | 17 suites, 119 tests en verde |
| Backend  | `npm run typecheck` | Sin errores                  |
| Backend  | `npm test`          | 5 suites, 93 tests en verde  |
| Backend  | `npm run build`     | Sin errores                  |

### 1.2 Smoke test de integración ejecutado

Además de la suite automatizada, se levantó la API compilada (`backend/dist/main.js`) contra una instancia efímera de MongoDB y se ejecutaron llamadas HTTP reales:

| Caso                                          | Resultado                                                   |
| --------------------------------------------- | ----------------------------------------------------------- |
| `GET /api/health`                             | `200`, base `conectado`                                     |
| Registro de paseador                          | `201`, token, teléfono `+5492994123456`, sin `passwordHash` |
| `GET /api/paseadores?ciudad=Neuquén`          | `200`, solo Neuquén                                         |
| Registro de cliente                           | `201` con token                                             |
| `POST /api/paseadores/:id/resenas`            | `201`, autor y calificación correctos                       |
| `GET /api/paseadores/:id` con token del dueño | `200`, promedio 5, 1 reseña, `esPropietario: true`          |
| `GET /api/resenas/mias` como paseador         | `200`, 1 reseña                                             |
| `GET /api/resenas/mias` como cliente          | `403`                                                       |
| `GET /api/resenas/mias` sin token             | `401`                                                       |
| Ciudad inválida                               | `400`                                                       |
| `disponible=quizas`                           | `400`                                                       |
| Login válido / inválido                       | `200` / `401`                                               |

---

## 2. Objetivo

1. Detectar regresiones en listado, perfil, registro, login y reseñas.
2. Verificar el contrato de la API y la persistencia en MongoDB.
3. Verificar roles y permisos del lado del servidor.
4. Mantener el flujo sin reservas.
5. Ejecutar todo sin dispositivo ni base de producción.

---

## 3. Alcance

### Incluido

- Unitarios de utilidades (teléfono, entorno).
- Servicios del frontend con el backend simulado (`fetch` falso, `__tests__/fixtures/api.ts`).
- Mapeo frontend ↔ API con `fetch` simulado.
- Componentes y pantallas con RNTL.
- E2E de la API completa contra MongoDB efímera.
- Typecheck, lint y build.

### Excluido

- Pruebas de carga o estrés.
- Seguridad ofensiva.
- Pagos y reservas (no son objetivo).
- Pruebas contra MongoDB Atlas o datos reales.

---

## 4. Herramientas

### Frontend

| Necesidad   | Herramienta                     | Versión        |
| ----------- | ------------------------------- | -------------- |
| Preset      | `jest-expo`                     | 54.0.18        |
| Runner      | `jest`                          | 29.7.0         |
| Tipos       | `@types/jest`                   | 29.5.14        |
| Componentes | `@testing-library/react-native` | 13.3.3         |
| Renderer    | `react-test-renderer`           | 19.1.0         |
| Lint        | `eslint` + `eslint-config-expo` | 9.39.5 / 9.2.0 |

### Backend

| Necesidad          | Herramienta             | Versión          |
| ------------------ | ----------------------- | ---------------- |
| Runner y transform | `jest` + `ts-jest`      | 29.7.0 / 29.4.15 |
| Módulos Nest       | `@nestjs/testing`       | 11.2.8           |
| HTTP               | `supertest`             | 7.3.1            |
| MongoDB efímera    | `mongodb-memory-server` | 11.3.0           |

---

## 5. Configuración

### 5.1 Frontend

`jest.config.js`:

```js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/__tests__/**/*.test.ts?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "/.expo/", "/dist/"],
  // El primer render de cada suite de pantallas puede pasar los 5 s por
  // defecto cuando todas las suites corren en paralelo.
  testTimeout: 15000,
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "src/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
};
```

`jest.setup.ts` mockea `@react-native-async-storage/async-storage` (en memoria) y `@expo/vector-icons` (FontAwesome, Entypo, MaterialIcons, Ionicons).

`tsconfig.json` excluye `backend/` para que el typecheck del frontend no compile el paquete NestJS.

### 5.2 Backend

`backend/package.json`:

```json
{
  "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand",
  "test:coverage": "node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage --runInBand",
  "verify": "npm run typecheck && npm test && npm run build"
}
```

`testRegex: ".*\\.spec\\.ts$"`, `testEnvironment: "node"`, `testTimeout: 60000`.

> **Por qué `--experimental-vm-modules`:** el driver de MongoDB 7.7.0 (incluido por mongoose 9) resuelve el módulo `os` con `import('os')` dinámico. Sin ese flag, Jest falla al conectar con `Missing required sub-document 'driver' in the client metadata document`. El flag no cambia el código de la aplicación.

El E2E levanta `mongodb-memory-server`, define `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN` y `PORT` en `process.env` antes de importar `AppModule`, y aplica el mismo `ValidationPipe` y prefijo `/api` que `main.ts`.

---

## 6. Estructura de tests

```text
__tests__/
├── components/
│   ├── AppButton.test.tsx
│   ├── EmptyState.test.tsx
│   ├── PaseadorCard.test.tsx
│   └── StarRating.test.tsx
├── context/
│   └── SesionContext.test.tsx
├── screens/
│   ├── admin.test.tsx
│   ├── listado-paseadores.test.tsx
│   ├── login.test.tsx
│   ├── perfil-paseador.test.tsx
│   └── registro-paseador.test.tsx
├── services/
│   ├── admin.service.test.ts
│   ├── api.integracion.test.ts
│   ├── paseadores.service.test.ts
│   └── resenas.service.test.ts
└── utils/
    └── telefono.test.ts

backend/test/
├── admin.e2e.spec.ts
├── app.e2e.spec.ts
├── env.validation.spec.ts
└── telefono.spec.ts
```

Los tests del frontend van fuera de `app/` a propósito: todo archivo dentro de `app/` se convierte en ruta de Expo Router.

---

## 7. Casos implementados — frontend

### 7.1 Utilidades de teléfono (19 tests)

| Caso                   | Resultado esperado                                |
| ---------------------- | ------------------------------------------------- |
| `+54 299 4123456`      | `5492994123456`                                   |
| `2994123456`           | Agrega prefijo `549`                              |
| `+54 9 299 4123456`    | `5492994123456`                                   |
| `0299 4123456`         | `5492994123456`                                   |
| `299 15 4123456`       | Quita el `15`                                     |
| Guiones y paréntesis   | Se normalizan                                     |
| `4123456`, `15 4123456` | Completa la característica `299`                 |
| `5412345`, `9123456`   | Local de 7 dígitos: no se confunde con `54` ni `9` |
| Vacío o corto          | `null`                                            |
| `formatearTelefono`    | `+54 9 299 4123-456`                              |
| `construirUrlTel`      | `tel:+5492994123456`                              |
| `construirUrlWhatsApp` | `https://wa.me/5492994123456?text=...` codificado |
| Mensaje prellenado     | Menciona WalkPets                                 |
| Número inválido        | `null` en las tres funciones                      |

### 7.2 Servicio de paseadores y cuenta (6 tests, `fetch` simulado)

| Caso                              | Resultado esperado                                                  |
| --------------------------------- | ------------------------------------------------------------------- |
| Registro válido                   | Envía teléfono `+549…`, redes sin “@”, certificaciones sin repetir; guarda la sesión |
| Teléfono, ciudad o red inválidos  | Error sin llamar al servidor                                        |
| Correo repetido (409)             | Muestra el mensaje del servidor                                     |
| Panel sin sesión o como cliente   | Error sin llamar al servidor                                        |
| Editar perfil                     | `PATCH /paseadores/mio` con `fotoUrl` y handles limpios             |
| Editar cuenta                     | Valida el nombre y actualiza la sesión guardada                     |

### 7.3 Servicio de reseñas (4 tests, `fetch` simulado)

| Caso                                     | Resultado esperado                      |
| ---------------------------------------- | --------------------------------------- |
| Sin sesión o sesión de paseador          | Error sin llamar al servidor            |
| Reseña repetida (409)                    | Muestra el mensaje del servidor         |
| Paseador autenticado                     | `GET /resenas/mias` y fecha `AAAA-MM-DD` |
| `/resenas/mias` sin sesión o como cliente | Error                                   |

### 7.4 Integración con la API (8 tests, `fetch` simulado)

| Caso           | Resultado esperado                                          |
| -------------- | ----------------------------------------------------------- |
| Listado        | Mapea `fotoUrl`, `calificacionPromedio`, `resenas`          |
| Perfil         | Envía `Authorization: Bearer` y mapea `autorNombre` y fecha |
| Perfil 404     | Devuelve `null`                                             |
| Alta de reseña | `POST` al endpoint correcto con token                       |
| Error 400      | `ApiError` con `detalles`                                   |
| 401 con token  | Avisa sesión vencida y lanza “Tu sesión venció…”            |
| 401 sin token  | Login fallido: conserva el mensaje del servidor, sin aviso  |
| Fallo de red   | “No se pudo conectar con el servidor.”                      |

### 7.5 Componentes (13 tests)

| Caso                      | Resultado esperado                                                       |
| ------------------------- | ------------------------------------------------------------------------ |
| `PaseadorCard`            | Muestra nombre, precio, rating, reseñas, barrio, ciudad y disponibilidad |
| `PaseadorCard` press      | Ejecuta `onPress`                                                        |
| `PaseadorCard` sin foto   | Usa imagen de respaldo                                                   |
| `StarRating`              | 5 estrellas y valor con un decimal                                       |
| `StarRating` sin número   | Oculta el valor                                                          |
| `StarRating` entero       | Muestra un decimal                                                       |
| `EmptyState` vacío        | Mensaje por defecto                                                      |
| `EmptyState` error        | Mensaje y reintento                                                      |
| `EmptyState` mensaje      | Permite sobrescribir el mensaje                                          |
| `EmptyState` título       | Permite sobrescribir el título                                           |
| `AppButton`               | Muestra la etiqueta y ejecuta `onPress`                                  |
| `AppButton` deshabilitado | Expone el estado y no dispara `onPress`                                  |
| `AppButton` accesibilidad | Permite personalizar la etiqueta                                         |

### 7.6 Listado (14 tests)

| Caso                    | Resultado esperado                         |
| ----------------------- | ------------------------------------------ |
| Carga                   | Indicador visible                          |
| Éxito                   | Tarjetas y contador general                |
| Filtro Cipolletti       | Solo esa ciudad y encabezado correcto      |
| Filtro Neuquén          | Solo esa ciudad y encabezado correcto      |
| Chip “Todas”            | Vuelve a mostrar ambas                     |
| Barrios                 | No muestra barrios de otra ciudad          |
| Cambio de ciudad        | Limpia barrio inexistente                  |
| Filtro por barrio       | Filtra y permite limpiar                   |
| Disponibles             | Excluye no disponibles                     |
| Ciudad + disponibilidad | Se combinan                                |
| Accesibilidad           | `accessibilityState.selected` en los chips |
| Vacío                   | Estado vacío                               |
| Error                   | Error y reintento                          |
| Navegación              | `router.push('/paseadores/1')`             |

### 7.7 Perfil (11 tests)

| Caso               | Resultado esperado                                           |
| ------------------ | ------------------------------------------------------------ |
| Carga              | Indicador visible                                            |
| Datos              | Nombre, ciudad, barrio, rating, reseñas, descripción y razas |
| Neuquén            | Ciudad correcta                                              |
| Contacto           | Teléfono formateado y apertura de `tel:` y `wa.me`           |
| Accesibilidad      | Etiquetas en ambas acciones                                  |
| Teléfono inválido  | Oculta acciones                                              |
| Sin reseñas        | No rompe                                                     |
| Sin reservas       | No muestra CTA ni turnos                                     |
| Inexistente        | Estado de error                                              |
| Error del servicio | Estado de error                                              |
| Reintento          | Recupera el perfil                                           |

### 7.8 Registro de paseador (6 tests)

| Caso                  | Resultado esperado                                                          |
| --------------------- | --------------------------------------------------------------------------- |
| Obligatorios          | Muestra errores de nombre, apellido, barrio, teléfono, precio y descripción |
| Teléfono con espacios | Se trata como vacío                                                         |
| Teléfono inválido     | Error de formato                                                            |
| Contraseña y email    | Rechaza contraseña corta y email inválido                                   |
| Precio no numérico    | Error                                                                       |
| Alta válida           | Normaliza teléfono y muestra “¡Registro Exitoso!”                           |

### 7.9 Login y registro de cliente (7 tests)

| Caso                     | Resultado esperado                    |
| ------------------------ | ------------------------------------- |
| Campos vacíos            | Pide correo y contraseña              |
| Login válido             | Llama al servicio y navega al listado |
| Credenciales incorrectas | Muestra el error del servicio         |
| Contraseña corta         | Error de validación                   |
| Registro válido          | Normaliza teléfono y navega           |
| Teléfono inválido        | Error de formato                      |
| Sin cuentas de demo      | No ofrece cuentas de demostración     |

### 7.10 Sesión (2 tests)

| Caso                              | Resultado esperado                                      |
| --------------------------------- | ------------------------------------------------------- |
| La API rechaza el token vigente (401) | `SesionProvider` cierra la sesión y borra AsyncStorage |
| 401 tardío de un token anterior   | Se ignora; la sesión vigente se conserva                |

### 7.11 Administración (14 tests)

Pantalla `/admin` (9 tests, servicio simulado):

| Caso                    | Resultado esperado                                              |
| ----------------------- | --------------------------------------------------------------- |
| Sin rol admin           | “Esta sección es solo para administradores.” y no carga datos   |
| Listado                 | Contador, correo, rol y estado; la cuenta admin no tiene acciones |
| Suspender               | Llama al servicio y muestra “Suspendida” / “Reactivar”           |
| Eliminar                | Pide confirmación; al confirmar borra la tarjeta y baja el contador |
| Cancelar                | No elimina                                                      |
| Filtros                 | Rol por chip y búsqueda al confirmar (texto recortado)          |
| Error de acción         | Muestra el mensaje del servidor                                 |
| Error de carga          | Estado de error con el mensaje                                  |
| Reseñas                 | Lista con el paseador destinatario y elimina con confirmación   |

Servicio (`admin.service.test.ts`, 3 tests): sin sesión, rol cliente o paseador (sin llamar al servidor) y un admin que consulta con su token.

Integración con `fetch` simulado (2 tests, en `api.integracion.test.ts`): query string de filtros, mapeo de `creadoEn`/`telefono`, `PATCH` de estado y `DELETE` con `204`.

---

## 8. Casos implementados — backend (93 tests)

### 8.1 Utilidades (5 tests)

- Normalización de teléfonos argentinos al formato `549...`.
- Números locales de 7 dígitos que empiezan con `54` o `9` reciben la característica `299`.
- Rechazo de vacíos e inválidos.
- Formato legible `+54 9 299 4123-456`.

### 8.2 Validación de entorno (6 tests)

- Configuración válida y puerto normalizado.
- Falta de `MONGODB_URI`.
- Esquema de URI inválido.
- `JWT_SECRET` corto.
- `JWT_SECRET` con el valor de ejemplo.
- `PORT` fuera de rango.

### 8.3 E2E de la API (30 tests)

| Área               | Casos                                                                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Health             | `status: ok` y base conectada                                                                                                                                                                                  |
| Registro           | Cliente creado con token; email duplicado 409; contraseña corta 400; paseador sin teléfono 400; paseador sin perfil 400; ciudad inválida 400; rol inválido 400; paseador con perfil y teléfono normalizado 201 |
| Login              | Credenciales incorrectas 401; email inexistente 401; credenciales válidas 200                                                                                                                                  |
| Listado            | Lista completa; filtro por ciudad; ciudad inválida 400; `disponible` no booleano 400                                                                                                                           |
| Filtros combinados | Ciudad; `disponible=false` interpretado como booleano; ciudad + barrio; sin coincidencias `[]`                                                                                                                 |
| Perfil             | Perfil público con reseñas vacías; 404 por id inexistente; 404 por id con formato inválido                                                                                                                     |
| Reseñas            | Sin sesión 401; como paseador 403; calificación fuera de rango 400; texto corto 400; alta como cliente y promedio actualizado; paseador inexistente 404                                                        |
| Reseñas propias    | Sin sesión 401; como cliente 403; como paseador 200 con sus reseñas                                                                                                                                            |

El E2E verifica además que `passwordHash` no se devuelve, que el teléfono del paseador se guarda como `+5492994123456` y que `calificacionPromedio`/`cantidadResenas` se actualizan tras publicar.

### 8.4 E2E de administración (21 tests, `admin.e2e.spec.ts`)

| Área                 | Casos                                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Alta del admin       | `crearAdmin` crea y permite login con rol admin; si ya es admin actualiza la contraseña; se niega con correo de cliente; correo/contraseña inválidos; registro con `rol: admin` 400 |
| Listado de cuentas   | Sin sesión 401; cliente y paseador 403; admin 200 con correo, rol, estado, `paseadorId` y sin `passwordHash`; filtro por rol; búsqueda sin distinguir mayúsculas; `.*` se busca como texto; rol inválido 400 |
| Suspender/reactivar  | Suspendido: fuera del listado, perfil 404, reseña 404, login 403, token 401; contraseña incorrecta sigue en 401; filtro `activo=false`; reactivación revierte; propia cuenta 400; otro admin 403; cuerpo inválido 400; id inexistente 404 |
| Reseñas              | Listado con nombre del paseador y autor; cliente 403; borrado 204 con promedio recalculado; segundo borrado 404                                  |
| Eliminar cuenta      | Cliente: borra sus reseñas, recalcula, login 401 y token 401; paseador: perfil 404; propia cuenta 400                                           |

---

## 9. Casos pendientes (funcionalidad inexistente)

Se documentan como pendientes, no como tests `skip`:

| Área      | Caso pendiente                                              |
| --------- | ----------------------------------------------------------- |
| Seguridad | Refresh token, expiración y revocación.                     |
| Seguridad | Rate limiting y bloqueo por intentos.                       |
| Seguridad | Verificación de email y recuperación de contraseña.         |
| Reseñas   | Impedir reseñas de clientes que no contrataron al paseador. |
| API       | Paginación y búsqueda por texto.                            |
| Perfil    | Edición y baja de perfil.                                   |
| Reseñas   | Edición y baja de reseñas.                                  |
| CI        | Pipeline de verificación.                                   |

---

## 10. Comandos

### Frontend

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run test:watch
npm.cmd run test:coverage
npm.cmd run verify
```

Un archivo o un test:

```powershell
npm.cmd test -- __tests__/screens/listado-paseadores.test.tsx
npm.cmd test -- -t "filtra por Cipolletti"
```

### Backend

```powershell
cd backend
npm.cmd run typecheck
npm.cmd test
npm.cmd run test:coverage
npm.cmd run build
npm.cmd run verify
npm.cmd run start:dev
```

En Windows con PowerShell bloqueado, usar `npm.cmd` y `npx.cmd`.

---

## 11. Verificación manual

Con MongoDB disponible:

```powershell
# Terminal 1
cd backend
copy .env.example .env    # completar MONGODB_URI y JWT_SECRET
npm.cmd run start:dev

# Terminal 2
$env:EXPO_PUBLIC_API_URL="http://localhost:3000/api"
npm.cmd start
```

Checklist:

- [ ] `GET /api/health` responde `status: ok` y base conectada.
- [ ] Swagger carga en `/api/docs`.
- [ ] El listado muestra paseadores de ambas ciudades.
- [ ] Los filtros de ciudad, barrio y disponibilidad funcionan.
- [ ] El perfil muestra ciudad, teléfono y acciones de contacto.
- [ ] “Llamar” abre el marcador y WhatsApp abre `wa.me`.
- [ ] El registro de paseador crea cuenta, perfil y sesión.
- [ ] Un cliente puede publicar una reseña y el promedio se actualiza.
- [ ] Un paseador ve sus reseñas en `/mis-resenas`.
- [ ] Los estados de carga, error, vacío y sin resultados se ven correctamente.
- [ ] El perfil no muestra reservas.

> La verificación con dispositivo físico o emulador Android requiere usar la IP LAN o `10.0.2.2` en `EXPO_PUBLIC_API_URL`, no `localhost`.

---

## 12. Riesgos

| Riesgo                             | Mitigación                                      |
| ---------------------------------- | ----------------------------------------------- |
| Tests acoplados a textos exactos   | Usar roles, labels y fixtures estables.         |
| Backend real en tests              | `fetch` simulado en `__tests__/fixtures/api.ts`. |
| Estado mutable entre tests         | `AsyncStorage.clear()` y `jest.resetModules()`. |
| `expo-router` en tests             | Mock de `router`.                               |
| Iconos nativos en Jest             | Mock en `jest.setup.ts`.                        |
| Driver de MongoDB y Jest           | `--experimental-vm-modules`.                    |
| E2E con base real                  | `mongodb-memory-server` efímera.                |
| Secretos en tests                  | Valores ficticios en `process.env`.             |
| Tests de funcionalidad inexistente | Documentarlos como pendientes.                  |
