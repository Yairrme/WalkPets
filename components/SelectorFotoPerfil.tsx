import { FontAwesome } from '@expo/vector-icons';
import { ComponentProps, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { elegirFotoDePerfil } from '../src/services/foto.service';
import { AVATARES, esFotoSubida } from '../src/utils/fotoPerfil';
import { AvatarPaseador } from './AvatarPaseador';

// Elige la foto del perfil: ícono de mujer, ícono de hombre o una foto propia.
// Controlado: el valor vive en el formulario (`foto`, `onCambiar`).

type Props = {
  foto: string;
  nombre: string;
  apellido: string;
  onCambiar: (foto: string) => void;
};

type Opcion = {
  clave: string;
  etiqueta: string;
  icono: ComponentProps<typeof FontAwesome>['name'];
  activa: boolean;
  onPress: () => void;
};

export function SelectorFotoPerfil({ foto, nombre, apellido, onCambiar }: Props) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tieneFotoPropia = esFotoSubida(foto);

  const subirFoto = async () => {
    setError(null);
    setSubiendo(true);
    try {
      const nueva = await elegirFotoDePerfil();
      if (nueva) onCambiar(nueva);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos cargar la foto.');
    } finally {
      setSubiendo(false);
    }
  };

  const opciones: Opcion[] = [
    {
      clave: 'mujer',
      etiqueta: 'Mujer',
      icono: 'female',
      activa: foto === AVATARES.mujer,
      onPress: () => onCambiar(AVATARES.mujer),
    },
    {
      clave: 'hombre',
      etiqueta: 'Hombre',
      icono: 'male',
      activa: foto === AVATARES.hombre,
      onPress: () => onCambiar(AVATARES.hombre),
    },
    {
      clave: 'subir',
      etiqueta: tieneFotoPropia ? 'Cambiar foto' : 'Subir foto',
      icono: 'camera',
      activa: tieneFotoPropia,
      onPress: subirFoto,
    },
  ];

  return (
    <View style={styles.contenedor}>
      <View style={styles.vistaPrevia}>
        <AvatarPaseador
          foto={foto}
          nombre={nombre.trim() || 'W'}
          apellido={apellido.trim() || 'P'}
          tamano={112}
          redondo
          style={styles.avatar}
        />
        {subiendo && (
          <View style={styles.cargando}>
            <ActivityIndicator color={colors.blanco} />
          </View>
        )}
      </View>

      <View style={styles.opciones}>
        {opciones.map((opcion) => (
          <Pressable
            key={opcion.clave}
            onPress={opcion.onPress}
            disabled={subiendo}
            style={({ pressed }) => [
              styles.opcion,
              opcion.activa && styles.opcionActiva,
              pressed && styles.opcionPresionada,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              opcion.clave === 'subir' ? 'Subir una foto de perfil' : `Usar avatar de ${opcion.etiqueta.toLowerCase()}`
            }
            accessibilityState={{ selected: opcion.activa, disabled: subiendo }}
          >
            <FontAwesome
              name={opcion.icono}
              size={20}
              color={opcion.activa ? colors.blanco : colors.verde}
            />
            <Text style={[styles.opcionTexto, opcion.activa && styles.opcionTextoActivo]}>
              {opcion.etiqueta}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.ayuda}>
        {error ?? 'Opcional. Una foto real genera más confianza en los dueños.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    gap: spacing.md,
  },
  vistaPrevia: {
    width: 112,
    height: 112,
  },
  avatar: {
    borderWidth: 3,
    borderColor: colors.blanco,
  },
  cargando: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.full,
    backgroundColor: colors.lineaFuerte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opciones: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    maxWidth: 420,
  },
  opcion: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md - 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.linea,
    backgroundColor: colors.blanco,
  },
  opcionActiva: {
    backgroundColor: colors.verde,
    borderColor: colors.verde,
  },
  opcionPresionada: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  opcionTexto: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.verdeOscuro,
  },
  opcionTextoActivo: {
    color: colors.blanco,
  },
  ayuda: {
    fontSize: fonts.sizes.xs + 1,
    color: colors.grisOscuro,
    textAlign: 'center',
  },
});
