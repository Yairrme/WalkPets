import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Aparecer } from '../components/Aparecer';
import { AppButton } from '../components/AppButton';
import { AvatarPaseador } from '../components/AvatarPaseador';
import { EmptyState } from '../components/EmptyState';
import { Seccion } from '../components/formulario/Seccion';
import { FormularioCuenta } from '../components/perfil/FormularioCuenta';
import { FormularioPerfilPublico } from '../components/perfil/FormularioPerfilPublico';
import { ETIQUETA_ROL, ICONO_ROL } from '../src/constants/roles';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { useSesion } from '../src/context/SesionContext';
import { useMiPerfil } from '../src/hooks/useMiPerfil';

// ============================================================================
// PANTALLA: /mi-perfil
// El cliente ve y edita sus datos de cuenta. El paseador además edita su perfil
// público (lo que ven los dueños). El admin tiene un acceso a su panel.
// La carga y el guardado viven en el hook useMiPerfil; acá solo se dibuja.
// ============================================================================
export default function MiPerfil() {
  const { cerrar } = useSesion();
  const { cuenta, perfil, estado, error, cargar, cuentaGuardada, perfilGuardado } = useMiPerfil();

  if (estado === 'cargando') {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={colors.verde} />
      </View>
    );
  }

  if (estado === 'sin-sesion') {
    return (
      <View style={styles.centrado}>
        <Text style={styles.mensaje}>Iniciá sesión para ver y editar tu perfil.</Text>
        <AppButton label="Iniciar sesión" onPress={() => router.push('/login')} />
      </View>
    );
  }

  if (estado === 'error' || !cuenta) {
    return <EmptyState tipo="error" mensaje={error ?? undefined} onReintentar={cargar} />;
  }

  const esPaseador = cuenta.rol === 'paseador';
  const salir = async () => {
    await cerrar();
    router.replace('/');
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContenido}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contenedor}>
        {/* Resumen de la cuenta */}
        <Aparecer style={styles.resumen}>
          <AvatarPaseador
            foto={perfil?.foto ?? ''}
            nombre={cuenta.nombre}
            apellido={cuenta.apellido}
            tamano={72}
            redondo
          />
          <View style={styles.resumenTextos}>
            <Text style={styles.nombre}>
              {cuenta.nombre} {cuenta.apellido}
            </Text>
            <Text style={styles.email}>{cuenta.email}</Text>
            <View style={styles.rol}>
              <FontAwesome name={ICONO_ROL[cuenta.rol]} size={12} color={colors.verde} />
              <Text style={styles.rolTexto}>{ETIQUETA_ROL[cuenta.rol]}</Text>
            </View>
          </View>
        </Aparecer>

        {cuenta.rol === 'admin' && (
          <Aparecer retraso={60} style={styles.atajos}>
            <Atajo etiqueta="Panel de administración" onPress={() => router.push('/admin')} />
          </Aparecer>
        )}

        {esPaseador && perfil && (
          <Aparecer retraso={60} style={styles.atajos}>
            <Atajo
              etiqueta="Ver mi perfil público"
              onPress={() => router.push(`/paseadores/${perfil.id}`)}
            />
            <Atajo
              etiqueta={`Mis reseñas (${perfil.cantidadResenas})`}
              onPress={() => router.push('/mis-resenas')}
            />
          </Aparecer>
        )}

        <Seccion
          titulo="Mis datos"
          descripcion={
            esPaseador
              ? 'Tu nombre y teléfono también se muestran en tu perfil público.'
              : 'Solo vos ves estos datos.'
          }
          retraso={90}
        >
          <FormularioCuenta usuario={cuenta} onGuardado={cuentaGuardada} />
        </Seccion>

        {esPaseador && perfil && (
          <>
            <Aparecer retraso={110}>
              <Text style={styles.panelTitulo}>Mi perfil público</Text>
              <Text style={styles.panelAyuda}>Es lo que ven los dueños cuando te buscan.</Text>
            </Aparecer>
            <FormularioPerfilPublico paseador={perfil} onGuardado={perfilGuardado} />
          </>
        )}

        {cuenta.rol === 'cliente' && (
          <Aparecer retraso={120} style={styles.invitacion}>
            <Text style={styles.invitacionTexto}>
              ¿Buscás a alguien para pasear a tu perro?
            </Text>
            <AppButton label="Buscar paseadores" onPress={() => router.push('/paseadores')} />
          </Aparecer>
        )}

        <TouchableOpacity
          style={styles.salir}
          onPress={salir}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <Text style={styles.salirTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Acceso rápido a otra pantalla (píldora con chevron).
function Atajo({ etiqueta, onPress }: { etiqueta: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.atajo}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
    >
      <Text style={styles.atajoTexto}>{etiqueta}</Text>
      <FontAwesome name="chevron-right" size={11} color={colors.verde} />
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
    maxWidth: 720,
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
  mensaje: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
    textAlign: 'center',
  },
  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  resumenTextos: {
    flex: 1,
    gap: 2,
  },
  nombre: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.titulo,
    color: colors.verdeOscuro,
  },
  email: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
  },
  rol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.verdePastel,
  },
  rolTexto: {
    fontSize: fonts.sizes.xs + 1,
    fontWeight: fonts.pesos.semi,
    color: colors.verde,
  },
  atajos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  atajo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.linea,
  },
  atajoTexto: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.verde,
  },
  panelTitulo: {
    marginTop: spacing.md,
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.subtitulo,
    color: colors.verdeOscuro,
  },
  panelAyuda: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
  },
  invitacion: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.verdePastel,
  },
  invitacionTexto: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.semi,
    color: colors.verdeOscuro,
  },
  salir: {
    alignSelf: 'center',
    marginTop: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  salirTexto: {
    color: colors.error,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.semi,
  },
});
