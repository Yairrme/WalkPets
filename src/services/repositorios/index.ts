import { usarApi } from '../../config/api';
import { cuentaApi, paseadoresApi, resenasApi } from './api';
import { cuentaMock, paseadoresMock, resenasMock } from './mock';
import { RepositorioCuenta, RepositorioPaseadores, RepositorioResenas } from './tipos';

// Único punto que decide la fuente de datos. Se evalúa en cada llamada para
// respetar EXPO_PUBLIC_DATA_SOURCE (y los mocks de configuración en tests).

export function repositorioPaseadores(): RepositorioPaseadores {
  return usarApi() ? paseadoresApi : paseadoresMock;
}

export function repositorioResenas(): RepositorioResenas {
  return usarApi() ? resenasApi : resenasMock;
}

export function repositorioCuenta(): RepositorioCuenta {
  return usarApi() ? cuentaApi : cuentaMock;
}

export type { RepositorioCuenta, RepositorioPaseadores, RepositorioResenas } from './tipos';
