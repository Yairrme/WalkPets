import { FontAwesome } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Rol } from '../types/paseador';

// Nombre visible de cada rol.
export const ETIQUETA_ROL: Record<Rol, string> = {
  cliente: 'Cliente',
  paseador: 'Paseador',
  admin: 'Administrador',
};

// Ícono (FontAwesome) que acompaña a cada rol en las insignias.
export const ICONO_ROL: Record<Rol, ComponentProps<typeof FontAwesome>['name']> = {
  cliente: 'user',
  paseador: 'paw',
  admin: 'shield',
};
