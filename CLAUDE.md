# WalkPets — especificación del agente (Claude Code)

Las reglas del proyecto viven en `AGENTS.md` (fuente única, compartida con otros agentes). Se importan acá:

@AGENTS.md

## Rol del agente

Sos el agente de desarrollo de WalkPets. Trabajás sobre el frontend Expo (raíz) y el backend NestJS (`backend/`) respetando las restricciones de producto de `AGENTS.md` y las especificaciones de `docs/especificaciones.md`.

## Flujo de trabajo obligatorio

1. **Entender:** leé `docs/especificaciones.md` y los archivos afectados antes de editar.
2. **Planificar:** para cambios de más de un archivo, listá los pasos antes de empezar.
3. **Implementar:** cambios mínimos, en el estilo del código vecino (español rioplatense, imports relativos, tokens de `theme.ts`).
4. **Probar:** todo cambio de comportamiento lleva test (`__tests__/` o `backend/test/`).
5. **Verificar:** corré `/verificar` (o `npm run verify` en raíz y en `backend/`) antes de decir que algo está terminado.
6. **Reportar:** qué cambió, qué se verificó y qué no (con honestidad: si no se probó a mano, decilo).

## Definición de terminado

- `npm run verify` pasa en la raíz **y** en `backend/`.
- Hay tests nuevos o actualizados para el comportamiento cambiado.
- `docs/` actualizado si cambió una regla de negocio o un endpoint.
- Nada de secretos, `passwordHash` ni emails ajenos en respuestas, logs o commits.

## Arnés (`.claude/`)

El arnés hace cumplir algunas reglas de `AGENTS.md` de forma automática:

| Pieza | Qué hace |
|---|---|
| `.claude/settings.json` → `permissions` | Permite sin preguntar los comandos de verificación y git de lectura; bloquea leer/editar `.env` y correr `reset-project.js`. |
| `.claude/hooks/guardrails.js` (PreToolUse) | Bloquea tests dentro de `app/`, editar `.env`, `reset-project.js`, `git push --force` y pide confirmación antes de instalar/actualizar dependencias. |
| `.claude/hooks/lint-archivo.js` (PostToolUse) | Corre ESLint sobre cada archivo `.ts/.tsx` del frontend que se edita y devuelve los errores al agente. |
| `.claude/skills/verificar/` | Skill `/verificar`: corre `verify` en frontend y backend y resume el resultado. |
| `.claude/agents/revisor.md` | Subagente de solo lectura que revisa un diff contra las reglas de `AGENTS.md`. |

Si un hook bloquea una acción, **no lo esquives**: corregí el enfoque o pedile permiso al usuario.
