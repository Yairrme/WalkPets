# Especificaciones — WalkPets

> **Estado:** frontend Expo + backend NestJS + MongoDB implementados.
> **Última actualización:** 2026-10-25.
> **Alcance geográfico:** exclusivamente Cipolletti y Neuquén.

---

## 1. Contexto

WalkPets conecta dueños de mascotas con paseadores locales. Permite buscar paseadores, filtrar por ciudad, barrio y disponibilidad, consultar perfiles y reseñas, y contactarlos por teléfono o WhatsApp.

La app consume siempre el backend NestJS + MongoDB incluido en `backend/`. El modo de prueba en memoria (mock) se eliminó el 2026-11-11.

El flujo de reserva de turnos **no forma parte de estas especificaciones**. Su código legado se eliminó el 2026-10-28.

---

## 2. Objetivo

Que una persona pueda:

1. Encontrar paseadores de Cipolletti o Neuquén.
2. Filtrar por ciudad, barrio y disponibilidad.
3. Revisar perfil, experiencia, precio y reseñas.
4. Contactar por teléfono o WhatsApp.
5. Como cliente autenticado, publicar una reseña.
6. Como paseador autenticado, consultar las reseñas de su propio perfil.

---

## 3. Alcance

### 3.1 Implementado

**Frontend**

- Landing informativa para ambas ciudades.
- Listado con filtros de ciudad, barrio y disponibilidad, contador y encabezado dinámicos.
- Barrios acotados a la ciudad seleccionada.
- Tarjeta con ciudad, barrio, precio, calificación, reseñas y disponibilidad.
- Perfil con ciudad, barrio, precio, razas, descripción, reseñas y acciones de contacto.
- Normalización y presentación del teléfono.
- Acciones “Llamar” (`tel:`) y “WhatsApp” (`wa.me` con mensaje prellenado).
- Registro de paseador con selector de ciudad, email, contraseña y validación de teléfono.
- Login y registro de cliente contra el backend.
- `/mi-perfil`: el cliente edita nombre, teléfono, ciudad, barrio y sus mascotas; el paseador además edita su perfil público (disponibilidad, foto, servicio, razas, redes y permisos).
- Redes sociales y permisos/certificaciones en el registro y el panel del paseador. Son declarados y no verificados: el perfil público lo aclara.
- Sesión persistida en AsyncStorage y contexto global.
- Alta de reseña desde el perfil para clientes autenticados.
- Pantalla “Mis reseñas” para paseadores autenticados.
- Estados de carga, error, vacío, sin resultados y reintento.
- Accesibilidad en botones, filtros y enlaces.

**Backend**

- API REST NestJS con validación de DTOs y errores normalizados.
- MongoDB con esquemas de usuarios, paseadores y reseñas.
- Registro y login con bcrypt y JWT.
- Roles `cliente` y `paseador` aplicados en el servidor.
- Alta y consulta de reseñas con recálculo de promedio.
- Filtros de listado por ciudad, barrio y disponibilidad.
- Swagger en `/api/docs`.
- Seed idempotente con contraseña por variable de entorno.
- Tests unitarios y E2E con MongoDB efímera.

### 3.2 Pendiente

- CI.
- Paginación y búsqueda por texto.
- Verificación de email, recuperación de contraseña y refresh tokens.
- Rate limiting y bloqueo por intentos fallidos.
- Token en almacenamiento seguro (`expo-secure-store`).
- Validar que el autor de una reseña haya contratado al paseador.
- Edición/baja de perfil y de reseñas.
- Despliegue y monitoreo.

### 3.3 Excluido del flujo objetivo

- Reservas de turnos y calendario reservable.
- Pagos.
- Notificaciones push.
- Mapas y geolocalización.

> El panel de administración figuraba como excluido; se incorporó el 2026-11-11 (RF-17).

---

## 4. Actores

| Actor     | Descripción                                                           |
| --------- | --------------------------------------------------------------------- |
| Visitante | Recorre landing, listado y perfiles sin cuenta.                       |
| Cliente   | Se registra, inicia sesión y puede publicar reseñas.                  |
| Paseador  | Se registra con perfil, aparece en el listado y consulta sus reseñas. |
| Administrador | Gestiona cuentas (busca, suspende, reactiva, elimina) y modera reseñas. No se registra desde la app: se crea con `npm run crear-admin`. |

---

## 5. Flujo principal

```text
Inicio
  → Buscar paseadores
  → Filtrar por ciudad / barrio / disponibilidad
  → Abrir perfil
  → Leer descripción, precio y reseñas
  → Contactar
      → Llamar (tel:)
      → WhatsApp (wa.me con mensaje prellenado)
  → (opcional, cliente autenticado) Publicar reseña
```

No hay paso de reserva ni selección de turno.

---

## 6. Requisitos funcionales

### RF-01 — Listado de paseadores

- Muestra foto, nombre, ciudad, barrio, precio por hora, calificación, cantidad de reseñas y disponibilidad.
- La grilla se adapta a 2, 3 o 4 columnas según el ancho.
- Error con reintento, vacío y sin resultados.

**Estado:** implementado.

### RF-02 — Filtro por ciudad

- Chips **Cipolletti**, **Neuquén** y **Todas**.
- Al elegir una ciudad solo se muestran paseadores de esa ciudad.
- El encabezado y el contador reflejan la selección.
- Nunca se mezclan ciudades con una ciudad activa.

**Estado:** implementado.

### RF-03 — Filtro por barrio

- Los barrios disponibles se calculan dentro de la ciudad seleccionada.
- Al cambiar de ciudad se limpia el barrio si ya no existe en la nueva ciudad.
- El filtro se puede limpiar.

**Estado:** implementado.

### RF-04 — Filtro por disponibilidad

- El chip “Disponibles” muestra solo `disponible: true`.
- Se combina con ciudad y barrio.
- “Limpiar” restablece todos los filtros.

**Estado:** implementado.

### RF-05 — Tarjeta de paseador

- Muestra ciudad y barrio.
- Precio en formato argentino.
- Calificación con un decimal y cantidad de reseñas.
- Indica disponibilidad.
- Navega al perfil al tocarla.

**Estado:** implementado.

### RF-06 — Perfil del paseador

- Foto, nombre completo, ciudad, barrio, precio, disponibilidad, descripción y razas.
- Reseñas con autor, mascota, texto, fecha y calificación.
- Acciones de contacto visibles y accesibles.
- Sin CTA de reserva ni grilla de turnos.

**Estado:** implementado.

### RF-07 — Reseñas

- Se listan en el perfil, más recientes primero.
- Si no hay reseñas se muestra un mensaje claro.
- Un cliente autenticado puede publicar una reseña desde el perfil.
- Un paseador no puede reseñar su propio perfil (validado en el servidor).
- Un cliente puede dejar una sola reseña por paseador (el servidor responde 409 si repite).
- Un paseador autenticado puede ver sus reseñas en `/mis-resenas`.

**Estado:** implementado. No se valida que el cliente haya contratado al paseador.

### RF-08 — Contacto por teléfono

- El perfil muestra el teléfono formateado y la acción “Llamar”.
- Abre `tel:+549...` con el número normalizado.
- Si no hay teléfono válido, la acción no se muestra.
- Rol y etiqueta accesibles.

**Estado:** implementado.

### RF-09 — Contacto por WhatsApp

- Abre `https://wa.me/549...?text=<mensaje>`.
- El mensaje prellenado menciona WalkPets.
- El número se normaliza a formato internacional sin espacios ni guiones.

**Estado:** implementado.

### RF-10 — Registro de paseador

- Campos: nombre, apellido, email, contraseña, teléfono, ciudad, barrio, precio, descripción, razas y foto.
- Ciudad obligatoria, limitada a Cipolletti y Neuquén.
- Teléfono obligatorio y validado.
- Precio numérico mayor a 0.
- Descripción de al menos 15 caracteres.
- Al registrar se crea la cuenta, el perfil y la sesión, y se muestra la tarjeta del nuevo paseador.
- El nuevo perfil aparece en el listado.
- Sin turnos ni horarios reservables.

**Estado:** implementado.

### RF-11 — Registro e inicio de sesión de cliente

- Registro con nombre, apellido, email, contraseña (≥ 8 caracteres) y teléfono opcional.
- Email validado y único.
- Login con email y contraseña.
- La sesión se mantiene al recargar la app.
- Logout borra la sesión.
- Si la API rechaza el token guardado (`401`: sesión vencida o cuenta eliminada), la app cierra la sesión local y avisa “Tu sesión venció. Iniciá sesión de nuevo.”.
- No hay cuentas de demostración en ningún modo.

**Estado:** implementado.

### RF-12 — Estados de interfaz

- Carga con indicador.
- Error con mensaje y reintento.
- Vacío cuando no hay datos.
- Sin resultados cuando los filtros no coinciden.
- Éxito en registro y en publicación de reseña.

**Estado:** implementado.

### RF-13 — Accesibilidad

- Botones y enlaces con rol y etiqueta.
- Imágenes informativas con descripción.
- Filtros comunican estado seleccionado.
- Contraste legible.

**Estado:** implementado.

### RF-14 — Consistencia de datos

- `ciudad` se usa en filtros, tarjetas, perfil, registro y encabezados.
- No hay textos de ciudad hardcodeados en la UI vigente.
- Los barrios se asocian a una ciudad.

**Estado:** implementado.

### RF-15 — Sin reservas en el flujo vigente

- El perfil no muestra “Reservar un turno”.
- No hay grilla de turnos reservables.
- No existe la ruta `/paseadores/reserva` ni el hook `useReservaForm`.

**Estado:** implementado. El código legado de reservas se eliminó.

### RF-16 — API y persistencia

- Los datos se persisten en MongoDB.
- El backend valida ciudades, precios, teléfonos y referencias.
- Los errores son coherentes y documentados.
- Swagger describe los endpoints.

**Estado:** implementado.

### RF-17 — Administración de usuarios y reseñas

- Existe el rol `admin`. No se puede elegir al registrarse (la API responde `400`); la cuenta se crea en el backend con `npm run crear-admin` a partir de `ADMIN_EMAIL` y `ADMIN_PASSWORD`. Si el correo ya es de un admin, el script le asigna la contraseña indicada; si es de un cliente o paseador, se niega.
- La ruta `/admin` solo se muestra al rol admin; se llega desde Mi perfil o al iniciar sesión.
- **Usuarios:** listado paginado (20 por página) con búsqueda por nombre, apellido o correo y filtro por rol. Cada cuenta muestra correo, rol, estado, teléfono y fecha de alta.
- **Suspender / reactivar:** una cuenta suspendida no puede iniciar sesión (`403`, “Tu cuenta está suspendida…”), su token deja de servir (`401`, la app cierra la sesión) y, si es paseador, su perfil no se lista ni se puede abrir o reseñar. Reactivarla revierte todo.
- **Eliminar cuenta:** borrado definitivo, con confirmación. Se borran la cuenta, su perfil de paseador con las reseñas que recibió, y las reseñas que escribió; se recalculan los promedios afectados.
- **Moderar reseñas:** listado paginado de reseñas recientes con el paseador destinatario; eliminar una reseña (con confirmación) recalcula el promedio.
- El admin no puede suspender ni eliminar su propia cuenta (`400`) ni otras cuentas de admin (`403`).

**Estado:** implementado.

---

## 7. Reglas de negocio

- **Ciudades habilitadas:** exclusivamente Cipolletti y Neuquén, validadas en DTOs y esquemas.
- **Contacto:** lo inicia el dueño; WalkPets no intermedia la reserva.
- **Teléfono:** se normaliza a `549` + código de área + número (13 dígitos). Se muestra como `+54 9 299 4123-456`. Los enlaces usan `tel:+549...` y `https://wa.me/549...`.
- **Teléfono por rol:** obligatorio para paseadores; opcional para clientes.
- **Precio:** pesos argentinos por hora, mayor a 0.
- **Disponibilidad:** estado declarado por el paseador, no una agenda reservable.
- **Reseñas:** solo clientes autenticados; un autor no puede reseñar su propio perfil; una reseña por cliente y paseador; la calificación va de 1 a 5; el promedio se recalcula en el servidor.
- **Datos personales:** el perfil público expone nombre, foto, ciudad, barrio, descripción, precio y teléfono de contacto. No expone email, contraseña ni identificadores internos innecesarios.
- **Excepción del administrador:** los endpoints `/api/admin/*` (solo rol admin) son los únicos que devuelven correos de otros usuarios. Nunca devuelven `passwordHash`.
- **Cuentas suspendidas:** no inician sesión, su token no sirve y su perfil de paseador queda oculto hasta que un admin las reactive.
- **Datos de prueba:** no hay; la app arranca vacía y se usa con los perfiles que se registran.

---

## 8. Requisitos no funcionales

| ID     | Requisito                                                    |
| ------ | ------------------------------------------------------------ |
| RNF-01 | TypeScript estricto sin errores en frontend y backend.       |
| RNF-02 | Compatibilidad con Android, iOS y web.                       |
| RNF-03 | Interfaz en español rioplatense.                             |
| RNF-04 | Diseño responsive sin scroll horizontal.                     |
| RNF-05 | Estilos nuevos basados en `src/constants/theme.ts`.          |
| RNF-06 | Estados de carga y error en toda pantalla que consume datos. |
| RNF-07 | Sin secretos ni credenciales reales en el repositorio.       |
| RNF-08 | Contraseñas con hash; nunca se devuelven en respuestas.      |
| RNF-09 | Permisos de rol aplicados en el servidor, no solo en la UI.  |
| RNF-10 | `npm run verify` en verde en ambos paquetes.                 |
| RNF-11 | No introducir reservas en el flujo objetivo.                 |

---

## 9. Modelo de datos

### 9.1 Frontend (`src/types/paseador.ts`)

```ts
type Ciudad = "Cipolletti" | "Neuquén";

type Paseador = {
  id: string;
  usuarioId?: string;
  nombre: string;
  apellido: string;
  foto: string;
  barrio: string;
  ciudad: Ciudad;
  descripcion: string;
  precioHora: number;
  calificacion: number;
  cantidadResenas: number;
  telefono: string;
  disponible: boolean;
  razasAceptadas: string[];
  resenas: Resena[];
  esPropietario?: boolean;
};

type Resena = {
  id: string;
  autor: string;
  mascota: string;
  texto: string;
  calificacion: number;
  fecha: string;
};

type Usuario = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: "cliente" | "paseador" | "admin";
};

type Sesion = { token: string; usuario: Usuario };
```

### 9.2 Backend (MongoDB)

Los esquemas completos están en `docs/arquitectura.md` §9. Resumen:

- `usuarios`: cuenta con `email` único, `passwordHash` oculto, `rol` (`cliente`, `paseador` o `admin`) y `activo` (false = suspendida).
- `paseadores`: perfil público con referencia única a `usuarios`, ciudad validada, teléfono obligatorio y `suspendido` (oculto mientras la cuenta está suspendida).
- `resenas`: referencia a paseador y autor, con nombre de autor denormalizado.

---

## 10. Contrato REST

| Método | Ruta                          | Acceso   | Cuerpo / query                                                             |
| ------ | ----------------------------- | -------- | -------------------------------------------------------------------------- |
| GET    | `/api/health`                 | Público  | —                                                                          |
| POST   | `/api/auth/registro`          | Público  | `nombre`, `apellido`, `email`, `password`, `telefono?`, `rol`, `paseador?` |
| POST   | `/api/auth/login`             | Público  | `email`, `password`                                                        |
| GET    | `/api/paseadores`             | Público  | `ciudad?`, `barrio?`, `disponible?`                                        |
| GET    | `/api/paseadores/:id`         | Público  | —                                                                          |
| POST   | `/api/paseadores/:id/resenas` | Cliente  | `mascota`, `texto`, `calificacion`                                         |
| GET    | `/api/resenas/mias`           | Paseador | —                                                                          |
| GET    | `/api/admin/usuarios`         | Admin    | `rol?`, `q?`, `activo?`, `pagina?` → `{ items, total, pagina, porPagina }` |
| PATCH  | `/api/admin/usuarios/:id/estado` | Admin | `activo` (`false` suspende, `true` reactiva)                              |
| DELETE | `/api/admin/usuarios/:id`     | Admin    | — (`204`; borra cuenta, perfil y reseñas)                                  |
| GET    | `/api/admin/resenas`          | Admin    | `paseadorId?`, `pagina?` → `{ items, total, pagina, porPagina }`           |
| DELETE | `/api/admin/resenas/:id`      | Admin    | — (`204`; recalcula el promedio)                                           |

Respuesta de registro:

```json
{
  "accessToken": "...",
  "usuario": {
    "id": "...",
    "nombre": "...",
    "apellido": "...",
    "email": "...",
    "telefono": "...",
    "rol": "paseador"
  },
  "paseador": {
    "id": "...",
    "ciudad": "Cipolletti",
    "calificacionPromedio": 0,
    "cantidadResenas": 0,
    "...": "..."
  }
}
```

Errores: `400` validación, `401` no autenticado, `403` sin permisos o cuenta suspendida (login), `404` no encontrado, `409` email duplicado, `500` error interno.

---

## 11. Integración frontend ↔ API

Ver `docs/integracion-futura.md`. Resumen:

- Los servicios de `src/services/` llaman a los repositorios de `src/services/repositorios/api.ts`.
- `EXPO_PUBLIC_API_URL` indica dónde está la API (con `/api`, sin barra final).
- Los DTOs se mapean en `src/services/mappers.ts`; las pantallas no cambian.

---

## 12. Criterios de aceptación global

- Se puede filtrar por Cipolletti y Neuquén sin mezclar resultados.
- Se puede abrir un perfil y contactar por teléfono y WhatsApp.
- No existe flujo de reserva en la navegación vigente.
- El registro permite elegir ciudad y valida el teléfono.
- Un cliente autenticado puede publicar una reseña.
- Un paseador autenticado puede consultar sus reseñas.
- Un cliente no puede consultar `/api/resenas/mias`.
- Solo un admin accede a `/api/admin/*`; nadie puede registrarse como admin.
- Una cuenta suspendida no inicia sesión y su perfil no aparece en el listado.
- La API rechaza ciudades fuera de Cipolletti y Neuquén.
- `npm run verify` pasa en frontend y backend.
- La documentación coincide con el estado real.
