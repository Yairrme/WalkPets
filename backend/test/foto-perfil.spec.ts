import { esFotoPerfilValida, MAX_FOTO_SUBIDA } from '../src/common/foto-perfil';

describe('esFotoPerfilValida', () => {
  it.each(['', 'avatar:mujer', 'avatar:hombre', 'https://ejemplo.com/yo.jpg', 'data:image/jpeg;base64,QUJD'])(
    'acepta %s',
    (valor) => {
      expect(esFotoPerfilValida(valor)).toBe(true);
    }
  );

  it.each(['avatar:gato', 'javascript:alert(1)', 'data:text/html;base64,QUJD', 'ftp://x.com/a.jpg', 42])(
    'rechaza %s',
    (valor) => {
      expect(esFotoPerfilValida(valor)).toBe(false);
    }
  );

  it('rechaza una URL de más de 500 caracteres', () => {
    expect(esFotoPerfilValida(`https://ejemplo.com/${'a'.repeat(500)}`)).toBe(false);
  });

  it('rechaza una foto subida que supera el límite', () => {
    const foto = `data:image/jpeg;base64,${'A'.repeat(MAX_FOTO_SUBIDA)}`;
    expect(esFotoPerfilValida(foto)).toBe(false);
  });
});
