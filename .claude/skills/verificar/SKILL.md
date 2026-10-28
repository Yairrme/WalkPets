---
name: verificar
description: Corre la verificación completa de WalkPets (typecheck, lint, tests y build) en frontend y backend y resume el resultado. Usar antes de dar por terminado cualquier cambio de código.
---

# /verificar

1. En la raíz del repo corré `npm run verify` (typecheck + lint + tests del frontend).
2. Corré `npm --prefix backend run verify` (typecheck + tests + build del backend). Puede tardar: los tests levantan un MongoDB en memoria.
3. Podés correr los dos en paralelo (en segundo plano) si el entorno lo permite.
4. Resumí en una tabla corta:

| Parte | Typecheck | Lint | Tests | Build |
|---|---|---|---|---|
| Frontend | ✅/❌ | ✅/❌ | N/N | — |
| Backend | ✅/❌ | — | N/N | ✅/❌ |

5. Si algo falla, mostrá el error exacto (archivo:línea y mensaje) y proponé la corrección. No digas que pasó si no lo viste pasar.
6. Recordá que esto **no** reemplaza la prueba manual: indicá qué ruta habría que abrir con `npm start` para probar el cambio.
