import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sesion } from '../types/paseador';

const CLAVE_SESION = 'walkpets.sesion.v1';

export async function guardarSesion(sesion: Sesion): Promise<void> {
  await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

export async function obtenerSesionGuardada(): Promise<Sesion | null> {
  try {
    const valor = await AsyncStorage.getItem(CLAVE_SESION);
    if (!valor) return null;

    const sesion = JSON.parse(valor) as Sesion;
    if (!sesion?.token || !sesion?.usuario?.email) return null;

    return sesion;
  } catch {
    return null;
  }
}

export async function borrarSesionGuardada(): Promise<void> {
  await AsyncStorage.removeItem(CLAVE_SESION);
}
