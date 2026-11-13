import { useCallback, useEffect, useRef, useState } from 'react';
import {
  cambiarEstadoUsuario,
  eliminarResenaAdmin,
  eliminarUsuarioAdmin,
  listarResenasAdmin,
  listarUsuariosAdmin,
} from '../services/admin.service';
import { ResenaAdmin, UsuarioAdmin } from '../types/admin';
import { Rol } from '../types/paseador';

export type EstadoAdmin = 'cargando' | 'listo' | 'error';

const mensajeDe = (error: unknown, porDefecto: string) =>
  error instanceof Error ? error.message : porDefecto;

// Listado paginado de cuentas con filtro por rol, búsqueda y acciones.
// `activo` indica si el panel está visible: no carga hasta que se abre.
export function useAdminUsuarios(activo = true) {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [estado, setEstado] = useState<EstadoAdmin>('cargando');
  const [error, setError] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [enCurso, setEnCurso] = useState<string | null>(null);
  const [rol, setRol] = useState<Rol | null>(null);
  const [busqueda, setBusqueda] = useState('');
  // Texto efectivamente buscado (se aplica al confirmar, no en cada tecla).
  const [buscado, setBuscado] = useState('');
  // Descarta respuestas viejas si cambian los filtros mientras se carga.
  const consulta = useRef(0);

  const cargar = useCallback(async () => {
    const id = ++consulta.current;
    setEstado('cargando');
    setError(null);
    setErrorAccion(null);
    try {
      const respuesta = await listarUsuariosAdmin({ rol, q: buscado, pagina: 1 });
      if (id !== consulta.current) return;
      setUsuarios(respuesta.items);
      setTotal(respuesta.total);
      setPagina(1);
      setEstado('listo');
    } catch (e) {
      if (id !== consulta.current) return;
      setError(mensajeDe(e, 'No pudimos cargar las cuentas.'));
      setEstado('error');
    }
  }, [rol, buscado]);

  useEffect(() => {
    if (activo) cargar();
  }, [activo, cargar]);

  const cargarMas = async () => {
    if (cargandoMas || usuarios.length >= total) return;
    setCargandoMas(true);
    try {
      const respuesta = await listarUsuariosAdmin({ rol, q: buscado, pagina: pagina + 1 });
      setUsuarios((actuales) => [...actuales, ...respuesta.items]);
      setTotal(respuesta.total);
      setPagina(respuesta.pagina);
    } catch (e) {
      setErrorAccion(mensajeDe(e, 'No pudimos cargar más cuentas.'));
    } finally {
      setCargandoMas(false);
    }
  };

  const buscar = () => setBuscado(busqueda.trim());

  const alternarSuspension = async (usuario: UsuarioAdmin) => {
    setEnCurso(usuario.id);
    setErrorAccion(null);
    try {
      const actualizado = await cambiarEstadoUsuario(usuario.id, !usuario.activo);
      setUsuarios((actuales) => actuales.map((u) => (u.id === actualizado.id ? actualizado : u)));
    } catch (e) {
      setErrorAccion(mensajeDe(e, 'No pudimos cambiar el estado de la cuenta.'));
    } finally {
      setEnCurso(null);
    }
  };

  const eliminar = async (usuarioId: string) => {
    setEnCurso(usuarioId);
    setErrorAccion(null);
    try {
      await eliminarUsuarioAdmin(usuarioId);
      setUsuarios((actuales) => actuales.filter((u) => u.id !== usuarioId));
      setTotal((actual) => Math.max(0, actual - 1));
    } catch (e) {
      setErrorAccion(mensajeDe(e, 'No pudimos eliminar la cuenta.'));
    } finally {
      setEnCurso(null);
    }
  };

  return {
    usuarios,
    total,
    estado,
    error,
    errorAccion,
    cargandoMas,
    enCurso,
    rol,
    busqueda,
    hayMas: usuarios.length < total,
    cargar,
    cargarMas,
    elegirRol: setRol,
    escribirBusqueda: setBusqueda,
    buscar,
    alternarSuspension,
    eliminar,
  };
}

// Reseñas recientes para moderar.
export function useAdminResenas(activo = true) {
  const [resenas, setResenas] = useState<ResenaAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [estado, setEstado] = useState<EstadoAdmin>('cargando');
  const [error, setError] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [enCurso, setEnCurso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    setError(null);
    setErrorAccion(null);
    try {
      const respuesta = await listarResenasAdmin(1);
      setResenas(respuesta.items);
      setTotal(respuesta.total);
      setPagina(1);
      setEstado('listo');
    } catch (e) {
      setError(mensajeDe(e, 'No pudimos cargar las reseñas.'));
      setEstado('error');
    }
  }, []);

  useEffect(() => {
    if (activo) cargar();
  }, [activo, cargar]);

  const cargarMas = async () => {
    if (cargandoMas || resenas.length >= total) return;
    setCargandoMas(true);
    try {
      const respuesta = await listarResenasAdmin(pagina + 1);
      setResenas((actuales) => [...actuales, ...respuesta.items]);
      setTotal(respuesta.total);
      setPagina(respuesta.pagina);
    } catch (e) {
      setErrorAccion(mensajeDe(e, 'No pudimos cargar más reseñas.'));
    } finally {
      setCargandoMas(false);
    }
  };

  const eliminar = async (resenaId: string) => {
    setEnCurso(resenaId);
    setErrorAccion(null);
    try {
      await eliminarResenaAdmin(resenaId);
      setResenas((actuales) => actuales.filter((r) => r.id !== resenaId));
      setTotal((actual) => Math.max(0, actual - 1));
    } catch (e) {
      setErrorAccion(mensajeDe(e, 'No pudimos eliminar la reseña.'));
    } finally {
      setEnCurso(null);
    }
  };

  return {
    resenas,
    total,
    estado,
    error,
    errorAccion,
    cargandoMas,
    enCurso,
    hayMas: resenas.length < total,
    cargar,
    cargarMas,
    eliminar,
  };
}
