type ServicioPaseadores = typeof import('../../src/services/paseadores.service');

function cargarServicio(): ServicioPaseadores {
  jest.resetModules();
  return require('../../src/services/paseadores.service') as ServicioPaseadores;
}

describe('paseadores.service', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('devuelve los 4 paseadores del mock', async () => {
    const { getPaseadores } = cargarServicio();

    const promesa = getPaseadores();
    await jest.advanceTimersByTimeAsync(900);

    await expect(promesa).resolves.toHaveLength(4);
  });

  it('incluye paseadores de Cipolletti y Neuquén', async () => {
    const { getPaseadores } = cargarServicio();

    const promesa = getPaseadores();
    await jest.advanceTimersByTimeAsync(900);
    const paseadores = await promesa;

    expect(paseadores.some((p) => p.ciudad === 'Cipolletti')).toBe(true);
    expect(paseadores.some((p) => p.ciudad === 'Neuquén')).toBe(true);
  });

  it('todos los paseadores del mock tienen teléfono válido', async () => {
    const { getPaseadores } = cargarServicio();

    const promesa = getPaseadores();
    await jest.advanceTimersByTimeAsync(900);
    const paseadores = await promesa;

    for (const paseador of paseadores) {
      expect(paseador.telefono).toMatch(/^\+54/);
    }
  });

  it('devuelve copias para que la pantalla no mute el mock', async () => {
    const { getPaseadores } = cargarServicio();

    const primera = getPaseadores();
    await jest.advanceTimersByTimeAsync(900);
    const listado = await primera;

    listado[0].nombre = 'Mutado';

    const segunda = getPaseadores();
    await jest.advanceTimersByTimeAsync(900);
    const nuevoListado = await segunda;

    expect(nuevoListado[0].nombre).toBe('Lucía');
  });

  it('busca un paseador existente por id', async () => {
    const { getPaseadorById } = cargarServicio();

    const promesa = getPaseadorById('1');
    await jest.advanceTimersByTimeAsync(500);
    const paseador = await promesa;

    expect(paseador?.nombre).toBe('Lucía');
    expect(paseador?.apellido).toBe('Fernández');
  });

  it('devuelve null para un id inexistente', async () => {
    const { getPaseadorById } = cargarServicio();

    const promesa = getPaseadorById('999');
    await jest.advanceTimersByTimeAsync(500);

    await expect(promesa).resolves.toBeNull();
  });

  it('registra un paseador, normaliza el teléfono y lo agrega al listado', async () => {
    const { getPaseadores, registrarPaseador } = cargarServicio();

    const promesaRegistro = registrarPaseador({
      nombre: 'Nuevo',
      apellido: 'Paseador',
      foto: '',
      barrio: 'Neuquén Centro',
      ciudad: 'Neuquén',
      descripcion: 'Paseos diarios con experiencia.',
      precioHora: 2000,
      telefono: '+54 299 4000000',
      disponible: true,
      razasAceptadas: ['Todas las razas'],
      email: 'nuevo@walkpets.com',
      password: 'secreto123',
    });
    await jest.advanceTimersByTimeAsync(800);
    const nuevo = await promesaRegistro;

    expect(nuevo.id).toBe('5');
    expect(nuevo.nombre).toBe('Nuevo');
    expect(nuevo.ciudad).toBe('Neuquén');
    expect(nuevo.telefono).toBe('+5492994000000');
    expect(nuevo.calificacion).toBe(0);
    expect(nuevo.cantidadResenas).toBe(0);
    expect(nuevo.resenas).toEqual([]);
    expect(nuevo.turnosDisponibles).toEqual([]);

    const promesaListado = getPaseadores();
    await jest.advanceTimersByTimeAsync(900);
    const listado = await promesaListado;

    expect(listado).toHaveLength(5);
  });

  it('rechaza un teléfono inválido al registrar', async () => {
    const { registrarPaseador } = cargarServicio();

    const promesa = registrarPaseador({
      nombre: 'Nuevo',
      apellido: 'Paseador',
      foto: '',
      barrio: 'Centro',
      ciudad: 'Cipolletti',
      descripcion: 'Paseos diarios con experiencia.',
      precioHora: 2000,
      telefono: '123',
      disponible: true,
      razasAceptadas: ['Todas las razas'],
    });
    const esperada = expect(promesa).rejects.toThrow('El teléfono no es válido');
    await jest.advanceTimersByTimeAsync(800);
    await esperada;
  });

  it('rechaza una ciudad fuera de Cipolletti y Neuquén', async () => {
    const { registrarPaseador } = cargarServicio();

    const promesa = registrarPaseador({
      nombre: 'Nuevo',
      apellido: 'Paseador',
      foto: '',
      barrio: 'Centro',
      ciudad: 'Buenos Aires' as never,
      descripcion: 'Paseos diarios con experiencia.',
      precioHora: 2000,
      telefono: '+54 299 4000000',
      disponible: true,
      razasAceptadas: ['Todas las razas'],
    });
    const esperada = expect(promesa).rejects.toThrow(
      'La ciudad debe ser Cipolletti o Neuquén'
    );
    await jest.advanceTimersByTimeAsync(800);
    await esperada;
  });
});
