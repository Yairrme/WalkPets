#!/usr/bin/env node
// Hook PostToolUse de WalkPets: corre ESLint sobre el archivo del frontend
// recién editado. Si hay errores sale con código 2 para que el agente los vea.

const { spawnSync } = require('node:child_process');
const path = require('node:path');

let entrada = '';
process.stdin.on('data', (parte) => (entrada += parte));
process.stdin.on('end', () => {
  let datos;
  try {
    datos = JSON.parse(entrada || '{}');
  } catch {
    process.exit(0);
  }

  const archivo = String(datos.tool_input?.file_path ?? '');
  if (!/\.(ts|tsx|js|jsx)$/.test(archivo)) process.exit(0);

  const raiz = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const relativa = path.relative(raiz, archivo).replace(/\\/g, '/');

  // Solo frontend: el backend no usa esta config de ESLint.
  if (relativa.startsWith('..') || /^(backend|node_modules|\.claude)\//.test(relativa)) {
    process.exit(0);
  }

  const eslint = path.join(raiz, 'node_modules', 'eslint', 'bin', 'eslint.js');
  const r = spawnSync(process.execPath, [eslint, '--max-warnings=0', relativa], {
    cwd: raiz,
    encoding: 'utf8',
  });

  if (r.status === 0 || r.error) process.exit(0);

  process.stderr.write(`ESLint encontró problemas en ${relativa}:\n${r.stdout}${r.stderr}`);
  process.exit(2);
});
