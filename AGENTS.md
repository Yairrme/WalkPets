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
npm run seed           # datos demo; requiere SEED_PASSWORD
```

- There is no CI config. Frontend: 12 suites / 88 tests. Backend: 3 suites / 39 tests.
- Frontend `npm run lint` passes with no warnings.
- Windows PowerShell may block `npm.ps1`; use `npm.cmd` / `npx.cmd`.
- Never run `scripts/reset-project.js`: it deletes or moves `src/` and `scripts/`, and is not exposed in `package.json`.

## Architecture
- Routes: `/`, `/login`, `/paseadores`, `/paseadores/[id]`, `/paseadores/registro`, `/mis-resenas`. Stack is configured in `app/_layout.tsx`, wrapped in `SesionProvider`.
- Data source switch: `EXPO_PUBLIC_DATA_SOURCE=mock|api` plus `EXPO_PUBLIC_API_URL`. Mock is the default and the mode used by screen tests.
- Services: `src/services/paseadores.service.ts` (mock + API facade), `auth.service.ts`, `resenas.service.ts`, `sesion.service.ts`, `api/client.ts` (fetch + timeout + `ApiError`). Screens never call `fetch` directly.
- Session is stored in AsyncStorage (`walkpets.sesion.v1`) and exposed through `src/context/SesionContext.tsx`.
- Shared types: `src/types/paseador.ts`. Theme tokens: `src/constants/theme.ts`. Cities: `src/constants/ciudades.ts`. Phone helpers: `src/utils/telefono.ts`.
- Backend endpoints (prefix `/api`): `GET /health`, `POST /auth/registro`, `POST /auth/login`, `GET /paseadores` (filters `ciudad`, `barrio`, `disponible`), `GET /paseadores/:id`, `POST /paseadores/:id/resenas`, `GET /resenas/mias`. Swagger at `/api/docs`.
- Tests live in `__tests__/` (frontend) and `backend/test/` (backend). Never put tests inside `app/`: every file there becomes a route. Config: `jest.config.js`, `jest.setup.ts`, `eslint.config.js`, `backend/package.json#jest`.
- UI copy is Spanish (Rioplatense). Keep it that way.

## Product constraints
- Current flow: search walkers → filter by city/barrio/availability → view profile and reviews → contact by **phone or WhatsApp**. Do not add booking/turnos features.
- Cities are **exclusively Cipolletti and Neuquén**, validated in the frontend, DTOs and schemas. Do not reintroduce Cipolletti-only assumptions. Barrio filters are scoped by city.
- Phone is required for walkers/caregivers and optional for clients. Normalize to `549` + area code + number; display `+54 9 299 4123-456`; links `tel:+549...` and `https://wa.me/549...?text=...`.
- Reviews: only authenticated `cliente`; a walker cannot review their own profile; the server recalculates the average. Walkers can read their own reviews at `/mis-resenas`.
- Legacy booking files remain but are **not** in the active UI: `app/paseadores/reserva.tsx`, `src/hooks/useReservaForm.ts`, `ReservaTurno`, `Turno`, `turnosDisponibles`. Remove only when explicitly requested. Do not link to `/paseadores/reserva` or assert booking as target behavior.
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
- Unused: `expo-av`, `expo-video` (plugin only), `src/global.css`, `use-theme.ts`, `use-color-scheme*`, and `react-native-safe-area-context`. Do not copy patterns from them.
- `docs/` is the source of truth: `docs/especificaciones.md`, `docs/arquitectura.md`, `docs/plan-de-pruebas.md`, `docs/integracion-futura.md`.
- Known security limitations: JWT in AsyncStorage (not `expo-secure-store`), no refresh tokens, email verification, password recovery, rate limiting, or proof that a reviewer hired the walker.

## Verification
- After changes: run `npm run verify` in the root and in `backend/`, then `npm start` and manually exercise the affected route.
- Do not claim backend behavior without running it. Unit/E2E tests use an ephemeral MongoDB; a real end-to-end smoke test needs a running MongoDB instance.
- Report manual verification honestly.
