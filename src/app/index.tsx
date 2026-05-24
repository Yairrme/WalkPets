import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, radius, shadows, spacing } from '../../constants/theme';
import { AppButton } from '../../components/AppButton';

export default function Inicio() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contenedor} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.logoTexto}>🐾</Text>
        <Text style={styles.marca}>walkpets</Text>
        <Text style={styles.marcaSub}>PASEADORES</Text>
        <Text style={styles.subtitulo}>Encontrá el paseador ideal{'\n'}para tu mejor amigo en Cipolletti</Text>
      </View>

      <AppButton label="Ver paseadores disponibles" onPress={() => router.push('/paseadores')} style={styles.ctaPrincipal} />

      <View style={styles.statsRow}>
        {[['4','Paseadores'],['4.7★','Calificación'],['120+','Reseñas']].map(([n,l],i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statNumero}>{n}</Text>
            <Text style={styles.statLabel}>{l}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.seccionTitulo}>¿Cómo funciona?</Text>
      {[
        {icono:'🔍',titulo:'Buscá paseadores',descripcion:'Explorá perfiles, leé reseñas y compará precios en tu ciudad.'},
        {icono:'📅',titulo:'Elegí un turno',descripcion:'Seleccioná el horario que mejor te queda según tu rutina.'},
        {icono:'✅',titulo:'Confirmá tu reserva',descripcion:'Completá tus datos y los de tu mascota. ¡Listo!'},
      ].map((paso, i) => (
        <View key={i} style={styles.pasoCard}>
          <View style={styles.pasoIconoWrap}><Text style={styles.pasoIcono}>{paso.icono}</Text></View>
          <View style={styles.pasoTexto}>
            <Text style={styles.pasoTitulo}>{paso.titulo}</Text>
            <Text style={styles.pasoDesc}>{paso.descripcion}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.ctaSecundaria} onPress={() => router.push('/paseadores')} activeOpacity={0.85}>
        <Text style={styles.ctaSecundariaTexto}>🐕 Empezar ahora →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.crema },
  contenedor: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: { alignItems: 'center', paddingVertical: spacing.xxl, backgroundColor: colors.verde, borderRadius: radius.xl, marginBottom: spacing.lg, gap: spacing.xs },
  logoTexto: { fontSize: 48 },
  marca: { fontSize: fonts.sizes.xxxl, fontWeight: '800', color: colors.blanco, letterSpacing: -1 },
  marcaSub: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.verdeMenta, letterSpacing: 4 },
  subtitulo: { fontSize: fonts.sizes.md, color: colors.verdeMenta, textAlign: 'center', lineHeight: 22, marginTop: spacing.sm },
  ctaPrincipal: { marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.blanco, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', ...shadows.card },
  statNumero: { fontSize: fonts.sizes.lg, fontWeight: '800', color: colors.verde },
  statLabel: { fontSize: fonts.sizes.xs, color: colors.grisOscuro, textAlign: 'center', marginTop: 2 },
  seccionTitulo: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.negro, marginBottom: spacing.md },
  pasoCard: { backgroundColor: colors.blanco, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm, ...shadows.card },
  pasoIconoWrap: { width: 48, height: 48, backgroundColor: colors.verdePastel, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  pasoIcono: { fontSize: 24 },
  pasoTexto: { flex: 1 },
  pasoTitulo: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.negro, marginBottom: 2 },
  pasoDesc: { fontSize: fonts.sizes.sm, color: colors.grisOscuro, lineHeight: 18 },
  ctaSecundaria: { marginTop: spacing.lg, backgroundColor: colors.verdePastel, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center' },
  ctaSecundariaTexto: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.verde },
});
