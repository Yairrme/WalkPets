import { useCallback, useEffect, useState } from 'react';
import { useSesion } from '../context/SesionContext';
import { getMiCuenta } from '../services/cuenta.service';
import { getMiPerfilPaseador } from '../services/paseadores.service';
import { Paseador, Usuario } from '../types/paseador';

export type EstadoMiPerfil = 'cargando' | 'listo' | 'sin-sesion' | 'error';

// Carga la cuenta del usuario y, si es paseador, también su perfil público.
export function useMiPerfil() {
  const { sesion, cargando: cargandoSesion, recargar } = useSesion();
  const [cuenta, setCuenta] = useState<Usuario | null>(null);
  const [perfil, setPerfil] = useState<Paseador | null>(null);
  const [estado, setEstado] = useState<EstadoMiPerfil>('cargando');
  const [error, setError] = useState<string | null>(null);

  const rol = sesion?.usuario.rol;

  const cargar = useCallback(async () => {
    if (!rol) {
      setEstado('sin-sesion');
      return;
    }
    setEstado('cargando');
    setError(null);
    try {
      const [datosCuenta, datosPerfil] = await Promise.all([
        getMiCuenta(),
        rol === 'paseador' ? getMiPerfilPaseador() : Promise.resolve(null),
      ]);
      setCuenta(datosCuenta);
      setPerfil(datosPerfil);
      setEstado('listo');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos cargar tu perfil.');
      setEstado('error');
    }
  }, [rol]);

  useEffect(() => {
    if (cargandoSesion) return;
    cargar();
  }, [cargar, cargandoSesion]);

  // La sesión guarda nombre y teléfono: tras editar la cuenta se refresca
  // para que el header y las demás pantallas muestren los datos nuevos.
  const cuentaGuardada = async (usuario: Usuario) => {
    setCuenta(usuario);
    await recargar();
  };

  return { cuenta, perfil, estado, error, cargar, cuentaGuardada, perfilGuardado: setPerfil };
}
