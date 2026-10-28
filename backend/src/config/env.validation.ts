// Validación explícita de las variables de entorno al arrancar.
// Falla rápido y con un mensaje claro si falta configuración obligatoria.
type Entorno = Record<string, unknown>;

export function validarEntorno(config: Entorno): Entorno {
  const errores: string[] = [];

  const uri = typeof config.MONGODB_URI === 'string' ? config.MONGODB_URI.trim() : '';
  if (!uri) {
    errores.push('MONGODB_URI es obligatorio.');
  } else if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    errores.push('MONGODB_URI debe comenzar con mongodb:// o mongodb+srv://.');
  }

  const secreto = typeof config.JWT_SECRET === 'string' ? config.JWT_SECRET.trim() : '';
  if (!secreto) {
    errores.push('JWT_SECRET es obligatorio.');
  } else if (secreto.length < 16) {
    errores.push('JWT_SECRET debe tener al menos 16 caracteres.');
  } else if (secreto.includes('cambiar-por-un-secreto')) {
    errores.push('JWT_SECRET todavía tiene el valor de ejemplo. Usá un secreto real.');
  }

  const puerto = Number(config.PORT ?? 3000);
  if (!Number.isInteger(puerto) || puerto <= 0 || puerto > 65535) {
    errores.push('PORT debe ser un número entero entre 1 y 65535.');
  }

  if (errores.length > 0) {
    throw new Error(`Configuración inválida:\n- ${errores.join('\n- ')}`);
  }

  return {
    ...config,
    PORT: puerto,
    JWT_SECRET: secreto,
    JWT_EXPIRES_IN: (config.JWT_EXPIRES_IN as string) || '7d',
  };
}
