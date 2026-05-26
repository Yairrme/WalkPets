import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppButton } from '../../components/AppButton';
import { colors, fonts, radius, shadows, spacing } from '../../constants/theme';
import { useReservaForm } from '../../hooks/useReservaForm';
import { getPaseadorById } from '../../services/paseadores.service';
import { Paseador } from '../../types/paseador';

export default function ReservaTurno() {
  const { id, nombre } = useLocalSearchParams<{ id: string; nombre: string }>();
  const { valores, errores, enviado, handleCampo, handleSubmit, reset } =
    useReservaForm(id ?? '');

  const [paseador, setPaseador] = useState<Paseador | null>(null);
  const [cargandoPaseador, setCargandoPaseador] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPaseadorById(id).then((data) => {
      setPaseador(data);
      setCargandoPaseador(false);
    });
  }, [id]);

  if (enviado) {
    return (
      <View style={styles.exitoContenedor}>
        <Text style={styles.exitoIcono}>🎉</Text>
        <Text style={styles.exitoTitulo}>¡Turno reservado!</Text>
        <Text style={styles.exitoDesc}>
          Tu solicitud fue enviada. {nombre} se pondrá en contacto con vos a la brevedad.
        </Text>
        <AppButton
          label="Ver otros paseadores"
          onPress={() => {
            reset();
            router.replace('/paseadores');
          }}
          style={styles.exitoBoton}
        />
        <AppButton
          label="Volver al inicio"
          onPress={() => {
            reset();
            router.replace('/');
          }}
          variante="outline"
          style={styles.exitoBoton}
        />
      </View>
    );
  }

  const turnosDisponibles = paseador?.turnosDisponibles.filter((t) => t.disponible) ?? [];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contenedor}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTexto}>
          Estás reservando un turno con{' '}
          <Text style={styles.infoCardNombre}>{nombre}</Text>
        </Text>
      </View>

      {/* Selección de turno */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Elegí un turno *</Text>

        {cargandoPaseador ? (
          <ActivityIndicator color={colors.verde} />
        ) : turnosDisponibles.length === 0 ? (
          <Text style={styles.sinTurnos}>No hay turnos disponibles por el momento.</Text>
        ) : (
          <View style={styles.turnosGrid}>
            {turnosDisponibles.map((turno) => {
              const seleccionado = valores.turnoId === turno.id;
              return (
                <TouchableOpacity
                  key={turno.id}
                  style={[
                    styles.turnoChip,
                    seleccionado && styles.turnoChipSeleccionado,
                  ]}
                  onPress={() => handleCampo('turnoId', turno.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.turnoChipDia,
                      seleccionado && styles.turnoChipTextoSel,
                    ]}
                  >
                    {turno.dia}
                  </Text>
                  <Text
                    style={[
                      styles.turnoChipHorario,
                      seleccionado && styles.turnoChipTextoSel,
                    ]}
                  >
                    {turno.horario}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {errores.turnoId && (
          <Text style={styles.errorTexto}>{errores.turnoId}</Text>
        )}
      </View>

      {/* Datos del dueño */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Tus datos</Text>

        <Text style={styles.label}>Tu nombre completo *</Text>
        <TextInput
          style={[styles.input, errores.nombreDuenio ? styles.inputError : null]}
          value={valores.nombreDuenio}
          onChangeText={(v) => handleCampo('nombreDuenio', v)}
          placeholder="Ej: María González"
          placeholderTextColor={colors.grisMedio}
        />
        {errores.nombreDuenio && (
          <Text style={styles.errorTexto}>{errores.nombreDuenio}</Text>
        )}

        <Text style={styles.label}>Tu teléfono *</Text>
        <TextInput
          style={[styles.input, errores.telefono ? styles.inputError : null]}
          value={valores.telefono}
          onChangeText={(v) => handleCampo('telefono', v)}
          placeholder="Ej: +54 299 4123456"
          placeholderTextColor={colors.grisMedio}
          keyboardType="phone-pad"
        />
        {errores.telefono && (
          <Text style={styles.errorTexto}>{errores.telefono}</Text>
        )}
      </View>

      {/* Datos de la mascota */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Tu mascota</Text>

        <Text style={styles.label}>Nombre de tu perro/a *</Text>
        <TextInput
          style={[styles.input, errores.nombreMascota ? styles.inputError : null]}
          value={valores.nombreMascota}
          onChangeText={(v) => handleCampo('nombreMascota', v)}
          placeholder="Ej: Firulais"
          placeholderTextColor={colors.grisMedio}
        />
        {errores.nombreMascota && (
          <Text style={styles.errorTexto}>{errores.nombreMascota}</Text>
        )}

        <Text style={styles.label}>Notas adicionales (opcional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={valores.notas}
          onChangeText={(v) => handleCampo('notas', v)}
          placeholder="Ej: Le tiene miedo a otros perros, es muy activo..."
          placeholderTextColor={colors.grisMedio}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <AppButton
        label="Confirmar reserva"
        onPress={handleSubmit}
        style={styles.botonConfirmar}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.crema },
  contenedor: { padding: spacing.lg, paddingBottom: spacing.xxl },
  infoCard: {
    backgroundColor: colors.verdePastel,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoCardTexto: { fontSize: fonts.sizes.md, color: colors.verde, textAlign: 'center' },
  infoCardNombre: { fontWeight: '800' },
  seccion: {
    backgroundColor: colors.blanco,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  seccionTitulo: {
    fontSize: fonts.sizes.md,
    fontWeight: '700',
    color: colors.negro,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
    color: colors.negro,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.grisMedio,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fonts.sizes.md,
    color: colors.negro,
    backgroundColor: colors.blanco,
  },
  inputError: { borderColor: colors.error },
  inputMultiline: { height: 80, paddingTop: spacing.sm },
  errorTexto: {
    fontSize: fonts.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  turnosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  turnoChip: {
    borderWidth: 1.5,
    borderColor: colors.grisMedio,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 140,
  },
  turnoChipSeleccionado: {
    backgroundColor: colors.verde,
    borderColor: colors.verde,
  },
  turnoChipDia: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.negro },
  turnoChipHorario: { fontSize: fonts.sizes.xs, color: colors.grisOscuro },
  turnoChipTextoSel: { color: colors.blanco },
  sinTurnos: { fontSize: fonts.sizes.sm, color: colors.grisOscuro, fontStyle: 'italic' },
  botonConfirmar: { marginTop: spacing.md },

  // Pantalla de éxito
  exitoContenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.crema,
  },
  exitoIcono: { fontSize: 72 },
  exitoTitulo: {
    fontSize: fonts.sizes.xxl,
    fontWeight: '800',
    color: colors.verde,
    textAlign: 'center',
  },
  exitoDesc: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
    textAlign: 'center',
    lineHeight: 22,
  },
  exitoBoton: { width: '100%' },
});
