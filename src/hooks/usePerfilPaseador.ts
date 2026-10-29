import { useCallback, useEffect, useState } from 'react';
import { getPaseadorById } from '../services/paseadores.service';
import { Paseador } from '../types/paseador';

export type EstadoPerfil = 'cargando' | 'listo' | 'no-encontrado' | 'error';

// Carga el perfil de un paseador. `refrescar` actualiza los datos sin volver
// a la pantalla de carga (por ejemplo, después de publicar una reseña).
export function usePerfilPaseador(id: string | undefined) {
  const [paseador, setPaseador] = useState<Paseador | null>(null);
  const [estado, setEstado] = useState<EstadoPerfil>('cargando');

  const obtener = useCallback(
    async (silencioso: boolean) => {
      if (!id) {
        setEstado('no-encontrado');
        return;
      }
      if (!silencioso) setEstado('cargando');

      try {
        const datos = await getPaseadorById(id);
        setPaseador(datos);
        setEstado(datos ? 'listo' : 'no-encontrado');
      } catch {
        // Si falla un refresco silencioso, conservamos lo que ya se ve.
        if (!silencioso) setEstado('error');
      }
    },
    [id]
  );

  const cargar = useCallback(() => obtener(false), [obtener]);
  const refrescar = useCallback(() => obtener(true), [obtener]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { paseador, estado, cargar, refrescar };
}
