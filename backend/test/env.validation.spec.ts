import { validarEntorno } from '../src/config/env.validation';

const BASE = {
  MONGODB_URI: 'mongodb://127.0.0.1:27017/walkpets',
  JWT_SECRET: 'un-secreto-de-pruebas-suficientemente-largo',
};

describe('validarEntorno', () => {
  it('acepta una configuración válida y normaliza el puerto', () => {
    const resultado = validarEntorno({ ...BASE, PORT: '4000' });

    expect(resultado.PORT).toBe(4000);
    expect(resultado.JWT_EXPIRES_IN).toBe('7d');
  });

  it('rechaza la falta de MONGODB_URI', () => {
    expect(() => validarEntorno({ JWT_SECRET: BASE.JWT_SECRET })).toThrow(
      /MONGODB_URI es obligatorio/
    );
  });

  it('rechaza un MONGODB_URI con esquema inválido', () => {
    expect(() =>
      validarEntorno({ ...BASE, MONGODB_URI: 'http://localhost/walkpets' })
    ).toThrow(/mongodb:\/\//);
  });

  it('rechaza un JWT_SECRET corto', () => {
    expect(() => validarEntorno({ ...BASE, JWT_SECRET: 'corto' })).toThrow(
      /al menos 16 caracteres/
    );
  });

  it('rechaza el secreto de ejemplo', () => {
    expect(() =>
      validarEntorno({
        ...BASE,
        JWT_SECRET: 'cambiar-por-un-secreto-de-al-menos-32-caracteres',
      })
    ).toThrow(/valor de ejemplo/);
  });

  it('rechaza un puerto inválido', () => {
    expect(() => validarEntorno({ ...BASE, PORT: '99999' })).toThrow(
      /PORT debe ser/
    );
  });
});
