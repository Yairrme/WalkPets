import type { NuevoPaseadorInput } from '../../src/types/paseador';

type ServicioPaseadores = typeof import('../../src/services/paseadores.service');
type ServicioCuenta = typeof import('../../src/services/cuenta.service');

// Cada prueba arranca con módulos nuevos: el modo mock empieza vacío (sin
// paseadores ni cuentas de prueba) y no arrastra datos de otra prueba.
function cargar(): ServicioPaseadores & ServicioCuenta {
  jest.resetModules();
  return {
    ...(require('../../src/services/paseadores.service') as ServicioPaseadores),
    ...(require('../../src/services/cuenta.service') as ServicioCuenta),
  };
}

const DATOS: NuevoPaseadorInput = {
  nombre: 'Nuevo',
  apellido: 'Paseador',
  foto: 'avatar:hombre',
  barrio: 'Neuquén Centro',
  ciudad: 'Neuquén',
  descripcion: 'Paseos diarios con experiencia.',
  precioHora: 2000,
  telefono: '+54 299 4000000',
  disponible: true,
  razasAceptadas: ['Todas las razas'],
  redes: { instagram: '@nuevo.paseos', facebook: '', tiktok: '', web: '' },
  certificaciones: ['Habilitación municipal', ' Habilitación municipal '],
  email: 'nuevo@walkpets.com',
  password: 'secreto123',
};

// Ejecuta una llamada del mock avanzando su demora simulada.
async function conDemora<T>(promesa: Promise<T>, ms = 900): Promise<T> {
  const resultado = promesa.then(
    (valor) => ({ ok: true as const, valor }),
    (error: unknown) => ({ ok: false as const, error })
  );
  await jest.advanceTimersByTimeAsync(ms);
  const r = await resultado;
  if (!r.ok) throw r.error;
  return r.valor;
}

describe('paseadores.service (modo mock)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('empieza sin paseadores de prueba', async () => {
    const { getPaseadores } = cargar();

    await expect(conDemora(getPaseadores())).resolves.toEqual([]);
  });

  it('registra un paseador con redes y certificaciones normalizadas', async () => {
    const { getPaseadores, registrarPaseador } = cargar();

    const nuevo = await conDemora(registrarPaseador(DATOS));

    expect(nuevo.id).toBe('1');
    expect(nuevo.telefono).toBe('+5492994000000');
    expect(nuevo.foto).toBe('avatar:hombre');
    expect(nuevo.calificacion).toBe(0);
    expect(nuevo.redes.instagram).toBe('nuevo.paseos');
    expect(nuevo.certificaciones).toEqual(['Habilitación municipal']);
    expect(nuevo).not.toHaveProperty('password');

    const listado = await conDemora(getPaseadores());
    expect(listado).toHaveLength(1);
  });

  it('devuelve copias para que la pantalla no mute los datos', async () => {
    const { getPaseadores, registrarPaseador } = cargar();
    await conDemora(registrarPaseador(DATOS));

    const listado = await conDemora(getPaseadores());
    listado[0].nombre = 'Mutado';

    const otra = await conDemora(getPaseadores());
    expect(otra[0].nombre).toBe('Nuevo');
  });

  it('busca por id y devuelve null si no existe', async () => {
    const { getPaseadorById, registrarPaseador } = cargar();
    await conDemora(registrarPaseador(DATOS));

    await expect(conDemora(getPaseadorById('1'), 500)).resolves.toMatchObject({ nombre: 'Nuevo' });
    await expect(conDemora(getPaseadorById('999'), 500)).resolves.toBeNull();
  });

  it('rechaza un teléfono inválido, otra ciudad o una red mal escrita', async () => {
    const { registrarPaseador } = cargar();

    await expect(registrarPaseador({ ...DATOS, telefono: '123' })).rejects.toThrow(
      'El teléfono no es válido'
    );
    await expect(registrarPaseador({ ...DATOS, ciudad: 'Buenos Aires' as never })).rejects.toThrow(
      'La ciudad debe ser Cipolletti o Neuquén'
    );
    await expect(
      registrarPaseador({ ...DATOS, redes: { ...DATOS.redes, web: 'mi-sitio.com' } })
    ).rejects.toThrow('La web debe empezar con http:// o https://.');
  });

  it('no permite registrarse dos veces con el mismo correo', async () => {
    const { registrarPaseador } = cargar();
    await conDemora(registrarPaseador(DATOS));

    await expect(conDemora(registrarPaseador({ ...DATOS, nombre: 'Otro' }), 800)).rejects.toThrow(
      'Ya existe una cuenta con ese correo.'
    );
  });

  it('el paseador edita su perfil desde el panel', async () => {
    const { actualizarMiPerfilPaseador, getMiPerfilPaseador, getPaseadorById, registrarPaseador } =
      cargar();
    await conDemora(registrarPaseador(DATOS));

    const editado = await conDemora(
      actualizarMiPerfilPaseador({
        precioHora: 2600,
        disponible: false,
        telefono: '299 4111222',
        redes: { ...DATOS.redes, tiktok: '@paseos.nqn' },
        certificaciones: ['Primeros auxilios caninos'],
      }),
      500
    );

    expect(editado.precioHora).toBe(2600);
    expect(editado.disponible).toBe(false);
    expect(editado.telefono).toBe('+5492994111222');
    expect(editado.redes.tiktok).toBe('paseos.nqn');

    const publico = await conDemora(getPaseadorById('1'), 500);
    expect(publico?.certificaciones).toEqual(['Primeros auxilios caninos']);
    await expect(conDemora(getMiPerfilPaseador(), 300)).resolves.toMatchObject({ precioHora: 2600 });
  });

  it('al cambiar el nombre de la cuenta se actualiza el perfil público', async () => {
    const { actualizarMiCuenta, getPaseadorById, registrarPaseador } = cargar();
    await conDemora(registrarPaseador(DATOS));

    const cuenta = await conDemora(actualizarMiCuenta({ nombre: 'Tomás' }), 400);

    expect(cuenta.nombre).toBe('Tomás');
    const publico = await conDemora(getPaseadorById('1'), 500);
    expect(publico?.nombre).toBe('Tomás');
  });

  it('un paseador no puede quitar su teléfono', async () => {
    const { actualizarMiCuenta, registrarPaseador } = cargar();
    await conDemora(registrarPaseador(DATOS));

    await expect(conDemora(actualizarMiCuenta({ telefono: '' }), 400)).rejects.toThrow(
      'El teléfono es obligatorio para los paseadores.'
    );
  });

  it('el panel exige una sesión de paseador', async () => {
    const { getMiPerfilPaseador } = cargar();

    await expect(getMiPerfilPaseador()).rejects.toThrow('Iniciá sesión para editar tu perfil.');
  });
});
