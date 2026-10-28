import {
  construirMensajeWhatsApp,
  construirUrlTel,
  construirUrlWhatsApp,
  esTelefonoValido,
  formatearTelefono,
  normalizarTelefono,
} from '../../src/utils/telefono';

describe('normalizarTelefono', () => {
  it('normaliza un número con +54 y sin 9', () => {
    expect(normalizarTelefono('+54 299 4123456')).toBe('5492994123456');
  });

  it('normaliza un número local de 10 dígitos', () => {
    expect(normalizarTelefono('2994123456')).toBe('5492994123456');
  });

  it('normaliza un número con +54 9', () => {
    expect(normalizarTelefono('+54 9 299 4123456')).toBe('5492994123456');
  });

  it('normaliza un número con 0 inicial', () => {
    expect(normalizarTelefono('0299 4123456')).toBe('5492994123456');
  });

  it('normaliza un número con 15 intercalado', () => {
    expect(normalizarTelefono('299 15 4123456')).toBe('5492994123456');
  });

  it('normaliza un número con guiones y paréntesis', () => {
    expect(normalizarTelefono('(299) 412-3456')).toBe('5492994123456');
  });

  it('rechaza teléfonos vacíos o demasiado cortos', () => {
    expect(normalizarTelefono('')).toBeNull();
    expect(normalizarTelefono('   ')).toBeNull();
    expect(normalizarTelefono('123')).toBeNull();
    expect(normalizarTelefono(null)).toBeNull();
  });
});

describe('esTelefonoValido', () => {
  it('acepta números normalizables', () => {
    expect(esTelefonoValido('+54 299 4123456')).toBe(true);
  });

  it('rechaza números inválidos', () => {
    expect(esTelefonoValido('123')).toBe(false);
  });
});

describe('formatearTelefono', () => {
  it('devuelve un formato legible', () => {
    expect(formatearTelefono('+54 299 4123456')).toBe('+54 9 299 4123-456');
  });

  it('devuelve null si el número no es válido', () => {
    expect(formatearTelefono('123')).toBeNull();
  });
});

describe('construirUrlTel', () => {
  it('arma el enlace tel: con el número normalizado', () => {
    expect(construirUrlTel('+54 299 4123456')).toBe('tel:+5492994123456');
  });

  it('devuelve null si el número no es válido', () => {
    expect(construirUrlTel('123')).toBeNull();
  });
});

describe('construirUrlWhatsApp', () => {
  it('arma el enlace oficial wa.me con mensaje codificado', () => {
    const mensaje = construirMensajeWhatsApp('Lucía');
    expect(construirUrlWhatsApp('+54 299 4123456', mensaje)).toBe(
      `https://wa.me/5492994123456?text=${encodeURIComponent(mensaje)}`
    );
  });

  it('menciona WalkPets en el mensaje prellenado', () => {
    expect(construirMensajeWhatsApp('Lucía')).toContain('WalkPets');
  });

  it('devuelve null si el número no es válido', () => {
    expect(construirUrlWhatsApp('123', 'Hola')).toBeNull();
  });
});
