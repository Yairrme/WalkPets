import { FontAwesome } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ETIQUETA_ROL, ICONO_ROL } from '../../src/constants/roles';
import { colors, fonts, radius, shadows, spacing } from '../../src/constants/theme';
import { UsuarioAdmin } from '../../src/types/admin';
import { formatearTelefono } from '../../src/utils/telefono';
import { ConfirmarAccion } from './ConfirmarAccion';

type Props = {
  usuario: UsuarioAdmin;
  enCurso: boolean;
  onAlternarSuspension: () => void;
  onEliminar: () => void;
  onVerPerfil?: () => void;
};

export function TarjetaUsuarioAdmin({
  usuario,
  enCurso,
  onAlternarSuspension,
  onEliminar,
  onVerPerfil,
}: Props) {
  const nombre = `${usuario.nombre} ${usuario.apellido}`;
  const esAdmin = usuario.rol === 'admin';
  const telefono = formatearTelefono(usuario.telefono);

  return (
    <View style={styles.tarjeta} accessibilityLabel={`Cuenta de ${nombre}`}>
      <View style={styles.encabezado}>
        <View style={styles.textos}>
          <Text style={styles.nombre}>{nombre}</Text>
          <Text style={styles.email}>{usuario.email}</Text>
        </View>
        <View style={styles.insignias}>
          <Text style={[styles.insignia, esAdmin && styles.insigniaAdmin]}>
            <FontAwesome name={ICONO_ROL[usuario.rol]} size={11} /> {ETIQUETA_ROL[usuario.rol]}
          </Text>
          <Text style={[styles.insignia, usuario.activo ? styles.activa : styles.suspendida]}>
            {usuario.activo ? 'Activa' : 'Suspendida'}
          </Text>
        </View>
      </View>

      <Text style={styles.detalle}>
        {telefono ? `${telefono} · ` : ''}
        {usuario.creadoEn ? `Alta: ${usuario.creadoEn}` : 'Alta: sin fecha'}
      </Text>

      {esAdmin ? (
        <Text style={styles.nota}>Las cuentas de administrador no se gestionan desde acá.</Text>
      ) : (
        <View style={styles.acciones}>
          {enCurso ? (
            <ActivityIndicator size="small" color={colors.verde} />
          ) : (
            <TouchableOpacity
              style={styles.boton}
              onPress={onAlternarSuspension}
              accessibilityRole="button"
              accessibilityLabel={`${usuario.activo ? 'Suspender' : 'Reactivar'} a ${nombre}`}
            >
              <Text style={styles.botonTexto}>{usuario.activo ? 'Suspender' : 'Reactivar'}</Text>
            </TouchableOpacity>
          )}
          {onVerPerfil && usuario.activo && (
            <TouchableOpacity
              style={styles.boton}
              onPress={onVerPerfil}
              accessibilityRole="link"
              accessibilityLabel={`Ver el perfil público de ${nombre}`}
            >
              <Text style={styles.botonTexto}>Ver perfil</Text>
            </TouchableOpacity>
          )}
          {!enCurso && (
            <ConfirmarAccion
              etiqueta="Eliminar"
              accessibilityLabel={`Eliminar a ${nombre}`}
              pregunta={
                usuario.rol === 'paseador'
                  ? 'Se borran la cuenta, el perfil público, sus reseñas recibidas y escritas. No se puede deshacer.'
                  : 'Se borran la cuenta y las reseñas que escribió. No se puede deshacer.'
              }
              confirmar="Eliminar definitivamente"
              onConfirmar={onEliminar}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    ...shadows.card,
    backgroundColor: colors.blanco,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  encabezado: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  textos: {
    flexShrink: 1,
    gap: 2,
  },
  nombre: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.pesos.semi,
    color: colors.verdeOscuro,
  },
  email: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
  },
  insignias: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  insignia: {
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    fontSize: fonts.sizes.xs,
    backgroundColor: colors.grisClaro,
    color: colors.grisOscuro,
  },
  insigniaAdmin: {
    backgroundColor: colors.naranjaClaro,
    color: colors.negro,
  },
  activa: {
    backgroundColor: colors.verdePastel,
    color: colors.verde,
  },
  suspendida: {
    backgroundColor: colors.errorClaro,
    color: colors.error,
  },
  detalle: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
  },
  nota: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    fontStyle: 'italic',
  },
  acciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  boton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.verde,
  },
  botonTexto: {
    color: colors.verde,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.medio,
  },
});
