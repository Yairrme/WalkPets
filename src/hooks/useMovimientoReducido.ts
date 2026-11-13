import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Devuelve true si la persona pidió "reducir movimiento" en su sistema.
// Las animaciones decorativas (entradas, flotación) se apagan en ese caso.
export function useMovimientoReducido(): boolean {
  const [reducido, setReducido] = useState(false);

  useEffect(() => {
    let activo = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((valor) => {
        if (activo) setReducido(valor);
      })
      .catch(() => undefined);
    const suscripcion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducido);
    return () => {
      activo = false;
      suscripcion?.remove();
    };
  }, []);

  return reducido;
}
