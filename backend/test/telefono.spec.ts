import { normalizarTelefono, formatearTelefono } from '../src/common/telefono';

describe('normalizarTelefono (backend)', () => {
  it('normaliza formatos argentinos habituales al formato 549...', () => {
    expect(normalizarTelefono('+54 299 4123456')).toBe('5492994123456');
    expect(normalizarTelefono('+54 9 299 4123456')).toBe('5492994123456');
    expect(normalizarTelefono('0299 4123456')).toBe('5492994123456');
    expect(normalizarTelefono('299 15 4123456')).toBe('5492994123456');
    expect(normalizarTelefono('(299) 412-3456')).toBe('5492994123456');
  });

  it('rechaza teléfonos vacíos o inválidos', () => {
    expect(normalizarTelefono('')).toBeNull();
    expect(normalizarTelefono('123')).toBeNull();
    expect(normalizarTelefono(null)).toBeNull();
  });

  it('formatea el número para mostrarlo', () => {
    expect(formatearTelefono('+5492994123456')).toBe('+54 9 299 4123-456');
  });
});
