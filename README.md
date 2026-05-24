# 🐾 WalkPets — Paseadores

Aplicación móvil para encontrar paseadores de perros en Cipolletti, ver sus reseñas y reservar un turno.

---

## Descripción

**WalkPets** conecta a dueños de perros con paseadores locales verificados. Permite explorar perfiles, leer reseñas reales y reservar un turno desde el celular en pocos pasos.

**Usuario objetivo:** Dueños de perros que trabajan o no tienen tiempo para sacar a sus mascotas a pasear, residentes en Cipolletti.

**Problema que resuelve:** La búsqueda de paseadores confiables suele ser por boca en boca o grupos de WhatsApp. WalkPets centraliza la oferta local con información clara, reseñas y disponibilidad horaria.

---

## Funcionalidades

- Pantalla de inicio con marca propia y pasos de uso
- Listado de paseadores con datos del service mock
- Detalle por paseador con reseñas y turnos disponibles
- Formulario controlado con validación (nombre, teléfono, mascota, turno)
- Estados de interfaz: loading, error, empty, success
- Navegación con Expo Router (rutas por archivos)

---

## Instalación

```bash
npm install
npx expo start
```

Escaneá el QR con la app **Expo Go** en tu celular.

---

## Estructura del proyecto

```
src/
  app/
    _layout.tsx              → Layout raíz y configuración de navegación
    index.tsx                → Pantalla de inicio
    paseadores/
      index.tsx              → Listado de paseadores
      [id].tsx               → Detalle de un paseador
      reserva.tsx            → Formulario de reserva de turno
  components/
    AppButton.tsx            → Botón reutilizable (primario, outline, secundario)
    EmptyState.tsx           → Estados vacío, error y cargando
    PaseadorCard.tsx         → Tarjeta reutilizable del listado (ItemCard)
    StarRating.tsx           → Estrellas de calificación
  constants/
    theme.ts                 → Colores, tipografía, espaciado y sombras
  hooks/
    useReservaForm.ts        → Hook personalizado para el formulario
  services/
    paseadores.service.ts    → Service mock con datos y funciones async
  types/
    paseador.ts              → Tipos: Paseador, Resena, Turno, ReservaTurno
```

---

## Decisiones técnicas

**Navegación:** Expo Router con rutas por archivos. La ruta `/paseadores/[id]` recibe el id dinámicamente.

**Componentes reutilizables:** `PaseadorCard`, `AppButton`, `EmptyState`, `StarRating`. Cada uno recibe props y no tiene lógica de negocio propia.

**Hook personalizado:** `useReservaForm` encapsula valores, errores, validación, submit y reset. La pantalla no tiene lógica de formulario propia.

**Service mock:** `paseadores.service.ts` simula latencia con `setTimeout`. Las pantallas no saben si los datos vienen de mock o API real.

**Theme centralizado:** `constants/theme.ts` define la paleta WalkPets (verde #3D5A1E, crema #F5F0E8). Sin valores hardcodeados en los estilos.

**TypeScript:** Tipos `Paseador`, `Resena`, `Turno` y `ReservaTurno` en `types/paseador.ts`.

---

## Autor

Yair Melinguer  
Tecnicatura Superior en Desarrollo de Software Full Stack  
Materia: Aplicaciones Móviles — 2026
