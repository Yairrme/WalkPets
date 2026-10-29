# WalkPets — agent notes

## Stack (verified)
- **Frontend (raíz del repo):** Expo SDK **54.0.34**, Expo Router **6.0.23**, React Native **0.81.5**, React **19.1.0**, TypeScript **5.9.3** (`strict: true`).
- **Backend (`backend/`):** NestJS **11** (CJS), Mongoose **9**, MongoDB, JWT, bcryptjs, class-validator, Swagger. TypeScript **5.9.3**.
- Router root is `app/` (`main: "expo-router/entry"`). Shared UI lives in `components/`; non-route code lives in `src/`.
- Use the v54 docs: https://docs.expo.dev/versions/v54.0.0/. The previous "v56" note was stale; do not follow v56 APIs.
- Root uses npm with `package-lock.json`. `backend/` is an independent package with its own `package.json` and lockfile; there are no npm workspaces. `node_modules/` is not committed and may be absent.
- Do not reinstall or upgrade dependencies without explicit approval.
- Frontend tests: Jest **29.7.0** + `jest-expo` **54.0.18** + React Native Testing Library **13.3.3**. Lint: ESLint **9.39.5** + `eslint-config-expo` **9.2.0**.
- Backend tests: Jest + `ts-jest` + `@nestjs/testing` + `supertest` + `mongodb-memory-server`.
- Do **not** upgrade to NestJS 12: `@nestjs/config@12` is ESM-only and `@nestjs/schematics@12` requires TypeScript ≥ 6, which breaks the CJS/Jest setup. Stay on Nest 11 and `@nestjs/config@4`.

## Commands

### Frontend (root)
```bash
npm ci                 # restore exact deps from package-lock.json
npm start              # expo start
npm run android        # expo start --android
npm run ios            # expo start --ios
npm run web            # expo start --web
npm run typecheck      # tsc --noEmit
npm run lint           # expo lint
npm test               # jest
npm run test:watch     # jest --watch
npm run test:coverage  # jest --coverage
npm run verify         # typecheck + lint + test
```

### Backend (`backend/`)
```bash
cd backend
npm ci
npm run start:dev      # nest start --watch
npm run typecheck      # tsc --noEmit
npm test               # node --experimental-vm-modules jest --runInBand
npm run test:coverage
npm run build          # nest build
npm run verify         # typecheck + test + build
```

- There is no CI config. Frontend: 14 suites / 107 tests. Backend: 4 suites / 71 tests.
- Frontend `npm run lint` passes with no warnings.
- Windows PowerShell may block `npm.ps1`; use `npm.cmd` / `npx.cmd`.
- Never run `scripts/reset-project.js`: it deletes or moves `src/` and `scripts/`, and is not exposed in `package.json`.

## Architecture
- Routes: `/`, `/login`, `/paseadores`, `/paseadores/[id]`, `/paseadores/registro`, `/mi-perfil` (client account / walker panel), `/mis-resenas`. Stack is configured in `app/_layout.tsx`, wrapped in `SesionProvider`.
- Data source switch: `EXPO_PUBLIC_DATA_SOURCE=mock|api` plus `EXPO_PUBLIC_API_URL`. `api` is the default and the real app; if `EXPO_PUBLIC_API_URL` is missing, requests fail with a clear error (no silent fallback). `mock` must be set explicitly, shows a visible warning bar (`components/AvisoModoPrueba.tsx`), and is in-memory and **starts empty** (no demo walkers or demo accounts; they were removed on 2026-10-28 together with the backend seed). Do not reintroduce demo data; tests load their own fixtures.
- Layers: screens (render only) → hooks in `src/hooks/` → use cases in `src/services/*.service.ts` → repositories in `src/services/repositorios/` (`tipos.ts` interfaces, `mock.ts`, `api.ts`, chosen in `index.ts`). Mock data lives in `src/data/`, API mapping in `src/services/mappers.ts`. Screens never call `fetch` directly. Keep mock and API repositories enforcing the same rules.
- Session is stored in AsyncStorage (`walkpets.sesion.v1`) and exposed through `src/context/SesionContext.tsx`.
- Shared types: `src/types/paseador.ts`. Theme tokens: `src/constants/theme.ts`. Cities: `src/constants/ciudades.ts`. Phone helpers: `src/utils/telefono.ts`.
- Backend endpoints (prefix `/api`): `GET /health`, `POST /auth/registro`, `POST /auth/login`, `GET /paseadores` (filters `ciudad`, `barrio`, `disponible`), `GET|PATCH /paseadores/mio` (walker panel, role `paseador`; declared before `:id`), `GET /paseadores/:id`, `POST /paseadores/:id/resenas`, `GET /resenas/mias`, `GET|PATCH /cuenta` (own account; email, role and password are not editable). Swagger at `/api/docs`.
- Tests live in `__tests__/` (frontend) and `backend/test/` (backend). Never put tests inside `app/`: every file there becomes a route. Config: `jest.config.js`, `jest.setup.ts`, `eslint.config.js`, `backend/package.json#jest`.
- UI copy is Spanish (Rioplatense). Keep it that way.

## Product constraints
- Current flow: search walkers → filter by city/barrio/availability → view profile and reviews → contact by **phone or WhatsApp**. Do not add booking/turnos features.
- Cities are **exclusively Cipolletti and Neuquén**, validated in the frontend, DTOs and schemas. Do not reintroduce Cipolletti-only assumptions. Barrio filters are scoped by city.
- Phone is required for walkers/caregivers and optional for clients. Local numbers without area code (`4123456`, `15 4123456`) get area code `299` (Cipolletti and Neuquén). Normalize to `549` + area code + number; display `+54 9 299 4123-456`; links `tel:+549...` and `https://wa.me/549...?text=...`.
- Reviews: only authenticated `cliente`; a walker cannot review their own profile; one review per client per walker (409, unique index `paseador + autor`); the server recalculates the average. Walkers can read their own reviews at `/mis-resenas`.
- The legacy booking flow (`/paseadores/reserva`, `useReservaForm`, `Turno`, `ReservaTurno`, `turnosDisponibles`) was removed on 2026-10-28. Do not reintroduce it.
- Walker profile photo (`foto` / `fotoUrl`) is one of: `avatar:mujer`, `avatar:hombre`, an uploaded JPEG data URI (≤ 400 KB, picked with `expo-image-picker` and resized to 400 px with `expo-image-manipulator` in `src/services/foto.service.ts`), an http(s) URL (≤ 500 chars, legacy) or empty (initials). Render it only through `components/AvatarPaseador.tsx`. The backend validates it in `common/foto-perfil.ts` and accepts JSON bodies up to 1 MB (`config/configurar-app.ts`, shared by `main.ts` and e2e tests).
- Walkers can add social networks (`redes`: instagram/facebook/tiktok handles without "@", web as http(s) URL) and up to 8 permits/certifications (`certificaciones`). They are **self-declared and not verified**: the UI must say so. Rules live in `backend/src/common/perfil-extra.ts` and `src/utils/redes.ts`.
- Clients can store `ciudad`, `barrio` and `mascotas` in their account; these are private (only `/cuenta`).
- The backend must never expose `passwordHash`, emails of other users, or unnecessary private data.

## Gotchas
- `expo-env.d.ts` and `.expo/` are gitignored/generated. Run `npx expo start` before relying on typed routes.
- `tsconfig.json` excludes `backend/` so the frontend typecheck does not compile NestJS decorators.
- Backend `npm test` must use `node --experimental-vm-modules node_modules/jest/bin/jest.js`. MongoDB driver 7.7.0 (bundled by Mongoose 9) resolves `os` with a dynamic `import()`; without the flag Jest fails with `Missing required sub-document 'driver' in the client metadata document`.
- `mongodb-memory-server` downloads a MongoDB binary on first use; tests need network access the first time. No real credentials or production DB are used.
- Mock delays: 900 ms list, 500 ms detail, 800 ms registration. Screen tests use fake timers.
- `EXPO_PUBLIC_API_URL` must include `/api` and no trailing slash (`apiFetch` concatenates `${API_URL}${path}`). Use `10.0.2.2` on Android emulator and the LAN IP on a physical device.
- `@/*` is configured in `tsconfig.json`, but source files use relative imports.
- Brand colors live in `src/constants/theme.ts` (`verdeOscuro`, `verde`, `verdeOliva`, `verdeMenta`, `verdePastel`, `whatsapp`). Use theme tokens instead of hardcoded hex/rgba.
- `docs/` is the source of truth: `docs/especificaciones.md`, `docs/arquitectura.md`, `docs/plan-de-pruebas.md`, `docs/integracion-futura.md`.
- Known security limitations: JWT in AsyncStorage (not `expo-secure-store`), no refresh tokens, email verification, password recovery, rate limiting, or proof that a reviewer hired the walker.

## Verification
- After changes: run `npm run verify` in the root and in `backend/`, then `npm start` and manually exercise the affected route.
- Do not claim backend behavior without running it. Unit/E2E tests use an ephemeral MongoDB; a real end-to-end smoke test needs a running MongoDB instance.
- Report manual verification honestly.
