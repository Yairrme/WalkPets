// ============================================================================
// PANTALLA: /admin (solo rol admin)
// Dos pestañas: "Cuentas" (buscar, filtrar por rol, suspender/reactivar y
// eliminar en cascada) y "Reseñas" (moderar y eliminar). Cada pestaña carga sus
// datos con su hook (useAdminUsuarios / useAdminResenas) solo cuando está activa.
// El backend vuelve a controlar el rol con el JWT: esta pantalla solo corta antes.
// ============================================================================

import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TarjetaResenaAdmin } from '../components/admin/TarjetaResenaAdmin';
import { TarjetaUsuarioAdmin } from '../components/admin/TarjetaUsuarioAdmin';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { Campo } from '../components/formulario/Campo';
import { OpcionesChips } from '../components/formulario/OpcionesChips';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { useSesion } from '../src/context/SesionContext';
import { useAdminResenas, useAdminUsuarios } from '../src/hooks/useAdmin';
import { Rol } from '../src/types/paseador';

type Pestana = 'usuarios' | 'resenas';

const FILTROS_ROL: { etiqueta: string; rol: Rol | null }[] = [
  { etiqueta: 'Todos', rol: null },
  { etiqueta: 'Clientes', rol: 'cliente' },
  { etiqueta: 'Paseadores', rol: 'paseador' },
  { etiqueta: 'Administradores', rol: 'admin' },
];

// Administración: gestión de cuentas y moderación de reseñas (solo rol admin).
export default function Admin() {
  const { sesion, cargando } = useSesion();
  const [pestana, setPestana] = useState<Pestana>('usuarios');
  const esAdmin = sesion?.usuario.rol === 'admin';

  const usuarios = useAdminUsuarios(esAdmin && pestana === 'usuarios');
  const resenas = useAdminResenas(esAdmin && pestana === 'resenas');

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={colors.verde} />
      </View>
    );
  }

  if (!esAdmin) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.mensaje}>Esta sección es solo para administradores.</Text>
        <AppButton
          label={sesion ? 'Volver al inicio' : 'Iniciar sesión'}
          onPress={() => (sesion ? router.replace('/') : router.push('/login'))}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContenido}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contenedor}>
        <Text style={styles.titulo}>Administración</Text>
        <Text style={styles.ayuda}>
          Gestioná las cuentas y moderá las reseñas. Los correos que ves acá son privados.
        </Text>

        <View style={styles.pestanas} accessibilityRole="tablist">
          <BotonPestana
            etiqueta="Usuarios"
            activa={pestana === 'usuarios'}
            onPress={() => setPestana('usuarios')}
          />
          <BotonPestana
            etiqueta="Reseñas"
            activa={pestana === 'resenas'}
            onPress={() => setPestana('resenas')}
          />
        </View>

        {pestana === 'usuarios' ? (
          <View style={styles.panel}>
            <View style={styles.busqueda}>
              <Campo
                etiqueta="Buscar por nombre o correo"
                obligatorio={false}
                value={usuarios.busqueda}
                onChangeText={usuarios.escribirBusqueda}
                onSubmitEditing={usuarios.buscar}
                returnKeyType="search"
                autoCapitalize="none"
                placeholder="Ej. lucia o @gmail.com"
              />
              <AppButton label="Buscar" variante="secundario" onPress={usuarios.buscar} />
            </View>
            <OpcionesChips
              opciones={FILTROS_ROL.map((filtro) => filtro.etiqueta)}
              seleccionadas={[
                FILTROS_ROL.find((filtro) => filtro.rol === usuarios.rol)?.etiqueta ?? 'Todos',
              ]}
              onAlternar={(etiqueta) =>
                usuarios.elegirRol(FILTROS_ROL.find((filtro) => filtro.etiqueta === etiqueta)?.rol ?? null)
              }
              etiquetaAccesible={(etiqueta) => `Filtrar: ${etiqueta}`}
            />

            {usuarios.estado === 'cargando' && (
              <ActivityIndicator size="large" color={colors.verde} style={styles.cargando} />
            )}
            {usuarios.estado === 'error' && (
              <EmptyState
                tipo="error"
                mensaje={usuarios.error ?? undefined}
                onReintentar={usuarios.cargar}
              />
            )}
            {usuarios.estado === 'listo' && (
              <>
                <Text style={styles.contador}>
                  {usuarios.total === 1 ? '1 cuenta' : `${usuarios.total} cuentas`}
                </Text>
                {usuarios.errorAccion && <Text style={styles.error}>{usuarios.errorAccion}</Text>}
                {usuarios.usuarios.length === 0 && (
                  <Text style={styles.mensaje}>No hay cuentas que coincidan.</Text>
                )}
                {usuarios.usuarios.map((usuario) => (
                  <TarjetaUsuarioAdmin
                    key={usuario.id}
                    usuario={usuario}
                    enCurso={usuarios.enCurso === usuario.id}
                    onAlternarSuspension={() => usuarios.alternarSuspension(usuario)}
                    onEliminar={() => usuarios.eliminar(usuario.id)}
                    onVerPerfil={
                      usuario.paseadorId
                        ? () => router.push(`/paseadores/${usuario.paseadorId}`)
                        : undefined
                    }
                  />
                ))}
                {usuarios.hayMas && (
                  <AppButton
                    label="Cargar más"
                    variante="outline"
                    cargando={usuarios.cargandoMas}
                    onPress={usuarios.cargarMas}
                  />
                )}
              </>
            )}
          </View>
        ) : (
          <View style={styles.panel}>
            {resenas.estado === 'cargando' && (
              <ActivityIndicator size="large" color={colors.verde} style={styles.cargando} />
            )}
            {resenas.estado === 'error' && (
              <EmptyState
                tipo="error"
                mensaje={resenas.error ?? undefined}
                onReintentar={resenas.cargar}
              />
            )}
            {resenas.estado === 'listo' && (
              <>
                <Text style={styles.contador}>
                  {resenas.total === 1 ? '1 reseña' : `${resenas.total} reseñas`}
                </Text>
                {resenas.errorAccion && <Text style={styles.error}>{resenas.errorAccion}</Text>}
                {resenas.resenas.length === 0 && (
                  <Text style={styles.mensaje}>Todavía no hay reseñas publicadas.</Text>
                )}
                {resenas.resenas.map((resena) => (
                  <TarjetaResenaAdmin
                    key={resena.id}
                    resena={resena}
                    enCurso={resenas.enCurso === resena.id}
                    onEliminar={() => resenas.eliminar(resena.id)}
                  />
                ))}
                {resenas.hayMas && (
                  <AppButton
                    label="Cargar más"
                    variante="outline"
                    cargando={resenas.cargandoMas}
                    onPress={resenas.cargarMas}
                  />
                )}
              </>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function BotonPestana({
  etiqueta,
  activa,
  onPress,
}: {
  etiqueta: string;
  activa: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.pestana, activa && styles.pestanaActiva]}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: activa }}
      accessibilityLabel={etiqueta}
    >
      <Text style={[styles.pestanaTexto, activa && styles.pestanaTextoActivo]}>{etiqueta}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.crema,
  },
  scrollContenido: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  contenedor: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    gap: spacing.md,
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.crema,
  },
  titulo: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.titulo,
    color: colors.verdeOscuro,
  },
  ayuda: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
  },
  mensaje: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
    textAlign: 'center',
  },
  pestanas: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.grisClaro,
    alignSelf: 'flex-start',
  },
  pestana: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  pestanaActiva: {
    backgroundColor: colors.verdeOscuro,
  },
  pestanaTexto: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
  },
  pestanaTextoActivo: {
    color: colors.blanco,
    fontWeight: fonts.pesos.semi,
  },
  panel: {
    gap: spacing.md,
  },
  busqueda: {
    gap: spacing.sm,
  },
  cargando: {
    marginVertical: spacing.xl,
  },
  contador: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
  },
  error: {
    fontSize: fonts.sizes.sm,
    color: colors.error,
    backgroundColor: colors.errorClaro,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
});
