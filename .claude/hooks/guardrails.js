#!/usr/bin/env node
// Hook PreToolUse de WalkPets: hace cumplir reglas de AGENTS.md antes de
// que el agente edite archivos o ejecute comandos.
// Entrada: JSON del hook por stdin. Salida: JSON con permissionDecision.

let entrada = '';
process.stdin.on('data', (parte) => (entrada += parte));
process.stdin.on('end', () => {
  let datos;
  try {
    datos = JSON.parse(entrada || '{}');
  } catch {
    process.exit(0);
  }

  const herramienta = datos.tool_name ?? '';
  const input = datos.tool_input ?? {};
  const resultado =
    herramienta === 'Bash' || herramienta === 'PowerShell'
      ? revisarComando(String(input.command ?? ''))
      : revisarArchivo(String(input.file_path ?? input.notebook_path ?? ''));

  if (resultado) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: resultado.decision,
          permissionDecisionReason: resultado.motivo,
        },
      })
    );
  }
  process.exit(0);
});

function rutaRelativa(ruta) {
  const raiz = (process.env.CLAUDE_PROJECT_DIR ?? process.cwd()).replace(/\\/g, '/');
  const normalizada = ruta.replace(/\\/g, '/');
  const sinRaiz = normalizada.toLowerCase().startsWith(raiz.toLowerCase() + '/')
    ? normalizada.slice(raiz.length + 1)
    : normalizada;
  return sinRaiz.replace(/^\.\//, '');
}

function revisarArchivo(ruta) {
  if (!ruta) return null;
  const relativa = rutaRelativa(ruta);
  const nombre = relativa.split('/').pop() ?? '';

  if (/^\.env($|\.)/.test(nombre) && nombre !== '.env.example') {
    return {
      decision: 'deny',
      motivo: 'Los archivos .env tienen secretos y no los edita el agente. Usá .env.example.',
    };
  }

  if (/^app\//.test(relativa) && /\.(test|spec)\.[jt]sx?$/.test(nombre)) {
    return {
      decision: 'deny',
      motivo: 'Todo archivo dentro de app/ se convierte en ruta. Los tests van en __tests__/.',
    };
  }

  if (relativa === 'scripts/reset-project.js') {
    return { decision: 'deny', motivo: 'reset-project.js no se modifica (ver AGENTS.md).' };
  }

  return null;
}

function revisarComando(comando) {
  if (/(\bnode(\.exe)?\s+[^\s|;&]*reset-project|\bnpm(\.cmd)?\s+run\s+reset-project)/.test(comando)) {
    return {
      decision: 'deny',
      motivo: 'reset-project.js borra src/ y scripts/. Nunca se ejecuta (ver AGENTS.md).',
    };
  }

  if (/git\s+push\b[^\n]*(--force\b|-f\b|--force-with-lease)/.test(comando)) {
    return { decision: 'deny', motivo: 'No se permite git push --force.' };
  }

  // npm ci restaura el lockfile y está permitido; instalar o actualizar no.
  if (/\bnpm(\.cmd)?\s+(install|i|add|update|upgrade|uninstall|remove)\b/.test(comando) ||
      /\bnpx(\.cmd)?\s+expo\s+install\b/.test(comando)) {
    return {
      decision: 'ask',
      motivo: 'Instalar o actualizar dependencias requiere aprobación explícita (AGENTS.md).',
    };
  }

  return null;
}
