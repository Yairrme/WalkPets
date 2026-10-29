import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CERTIFICACIONES_SUGERIDAS, MAX_CERTIFICACIONES } from '../../src/constants/perfil';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';

// Permisos y certificaciones: sugerencias para tocar + campo para agregar
// uno propio. Controlado por el formulario.

type Props = {
  certificaciones: string[];
  onCambiar: (certificaciones: string[]) => void;
};

export function SelectorCertificaciones({ certificaciones, onCambiar }: Props) {
  const [otra, setOtra] = useState('');
  const lleno = certificaciones.length >= MAX_CERTIFICACIONES;

  const alternar = (item: string) =>
    onCambiar(
      certificaciones.includes(item)
        ? certificaciones.filter((c) => c !== item)
        : lleno
          ? certificaciones
          : [...certificaciones, item]
    );

  const agregarOtra = () => {
    const limpia = otra.trim();
    if (limpia.length < 3 || lleno) return;
    if (!certificaciones.some((c) => c.toLowerCase() === limpia.toLowerCase())) {
      onCambiar([...certificaciones, limpia]);
    }
    setOtra('');
  };

  // Las sugeridas siempre se ven; las propias aparecen al final.
  const propias = certificaciones.filter((c) => !CERTIFICACIONES_SUGERIDAS.includes(c));

  return (
    <View style={styles.contenedor}>
      <View style={styles.chips}>
        {[...CERTIFICACIONES_SUGERIDAS, ...propias].map((item) => {
          const activa = certificaciones.includes(item);
          return (
            <TouchableOpacity
              key={item}
              style={[styles.chip, activa && styles.chipActivo]}
              onPress={() => alternar(item)}
              accessibilityRole="button"
              accessibilityLabel={`${activa ? 'Quitar' : 'Agregar'} ${item}`}
              accessibilityState={{ selected: activa }}
            >
              <Text style={[styles.chipTexto, activa && styles.chipTextoActivo]}>
                {activa ? '✓ ' : '+ '}
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.otraFila}>
        <TextInput
          value={otra}
          onChangeText={setOtra}
          onSubmitEditing={agregarOtra}
          placeholder="Otro permiso o curso (ej: Curso de etología)"
          placeholderTextColor={colors.grisMedio}
          style={styles.otraInput}
          maxLength={80}
          editable={!lleno}
          accessibilityLabel="Agregar otro permiso o certificación"
        />
        <TouchableOpacity
          style={[styles.agregar, (otra.trim().length < 3 || lleno) && styles.agregarDeshabilitado]}
          onPress={agregarOtra}
          disabled={otra.trim().length < 3 || lleno}
          accessibilityRole="button"
          accessibilityLabel="Agregar"
        >
          <Text style={styles.agregarTexto}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.ayuda}>
        Es información declarada por vos. WalkPets no la verifica: tené los comprobantes a mano
        por si un dueño te los pide.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.xs + 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.grisMedio,
    backgroundColor: colors.blanco,
  },
  chipActivo: {
    backgroundColor: colors.verde,
    borderColor: colors.verde,
  },
  chipTexto: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.medio,
    color: colors.grisOscuro,
  },
  chipTextoActivo: {
    color: colors.blanco,
  },
  otraFila: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  otraInput: {
    flex: 1,
    backgroundColor: colors.grisClaro,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.sm + 2,
    fontSize: fonts.sizes.sm,
    color: colors.negro,
  },
  agregar: {
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.verdeOscuro,
    justifyContent: 'center',
  },
  agregarDeshabilitado: {
    opacity: 0.4,
  },
  agregarTexto: {
    color: colors.blanco,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
  },
  ayuda: {
    fontSize: fonts.sizes.xs + 1,
    color: colors.grisOscuro,
    lineHeight: 17,
  },
});
