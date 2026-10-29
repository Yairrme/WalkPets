// WalkPets — Tema centralizado
export const colors = {
  // Primarios (paleta WalkPets, tomada del logo)
  verde: '#3D5A1E',
  verdeOscuro: '#1F2E1A',
  verdeOliva: '#565A21',
  verdeClaro: '#5C7A2A',
  verdeMenta: '#A8C07A',
  verdePastel: '#E8F0D8',

  // Fondo
  crema: '#F5F0E8',
  blanco: '#FFFFFF',

  // Neutros
  grisClaro: '#F0EDE8',
  grisMedio: '#C4C4C4',
  grisOscuro: '#6B6B6B',
  negro: '#1A1A1A',

  // Acento (estrellas, highlights)
  naranja: '#F4845F',
  naranjaClaro: '#FBD5C5',

  // Estados
  error: '#E53E3E',
  errorClaro: '#FFF5F5',
  exito: '#3D5A1E',
  exitoClaro: '#E8F0D8',
  advertencia: '#F6AD55',

  // Bordes finos: reemplazan a las sombras como forma de separar superficies
  linea: 'rgba(31, 46, 26, 0.08)',
  lineaFuerte: 'rgba(31, 46, 26, 0.16)',

  // Texto y bordes sobre fondos oscuros (header)
  blancoSuave: 'rgba(255, 255, 255, 0.72)',
  blancoLinea: 'rgba(255, 255, 255, 0.14)',
  blancoVelo: 'rgba(255, 255, 255, 0.08)',

  // Marca externa
  whatsapp: '#25D366',
};

export const fonts = {
  regular: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
  // Pesos contenidos: los títulos se apoyan en el tamaño y el tracking, no en el negrita.
  pesos: {
    regular: '400',
    medio: '500',
    semi: '600',
  },
  // Tracking negativo en títulos grandes (estilo editorial). Nunca en texto de cuerpo.
  tracking: {
    display: -1.8, // 36-40px
    titulo: -0.8, // 28-32px
    subtitulo: -0.4, // 18-22px
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Inputs 8 · tarjetas 16 · imágenes y paneles 24 · botones y badges en píldora.
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// Casi sin sombras: la elevación se arma con un borde fino.
export const shadows = {
  card: {
    borderWidth: 1,
    borderColor: colors.linea,
  },
  elevada: {
    borderWidth: 1,
    borderColor: colors.lineaFuerte,
    shadowColor: colors.verdeOscuro,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
};
