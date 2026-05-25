import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, radius, shadows, spacing } from '../../constants/theme';
import { registrarPaseador } from '../../services/paseadores.service';
import { Paseador } from '../../types/paseador';

// Lista de fotos de avatar preestablecidas para una selección rápida y elegante
const PRESET_AVATARS = [
  { id: '1', url: 'https://randomuser.me/api/portraits/women/43.jpg', label: '👩‍🦰 Lucía' },
  { id: '2', url: 'https://randomuser.me/api/portraits/men/32.jpg', label: '👨 Mateo' },
  { id: '3', url: 'https://randomuser.me/api/portraits/women/65.jpg', label: '👩 Sofía' },
  { id: '4', url: 'https://randomuser.me/api/portraits/men/85.jpg', label: '👨 Tomás' },
];

// Opciones de especialidad o razas aceptadas
const RAZAS_OPTIONS = [
  'Todas las razas',
  'Razas pequeñas',
  'Razas medianas',
  'Razas grandes',
  'Cachorros',
  'Perros mayores',
];

export default function RegistroPaseador() {
  // Estado para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [barrio, setBarrio] = useState('');
  const [precioHora, setPrecioHora] = useState('');
  const [telefono, setTelefono] = useState('');
  const [descripcion, setDescripcion] = useState('');
  
  // Avatar seleccionado (por defecto el primero)
  const [fotoUrl, setFotoUrl] = useState(PRESET_AVATARS[0].url);
  const [avatarPersonalizado, setAvatarPersonalizado] = useState(false);
  const [customFotoUrl, setCustomFotoUrl] = useState('');

  // Razas aceptadas (chips interactivos)
  const [razasSeleccionadas, setRazasSeleccionadas] = useState<string[]>(['Todas las razas']);

  // Estado del proceso
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [paseadorRegistrado, setPaseadorRegistrado] = useState<Paseador | null>(null);

  // Toggle de chips de razas
  const toggleRaza = (raza: string) => {
    if (razasSeleccionadas.includes(raza)) {
      setRazasSeleccionadas(razasSeleccionadas.filter((r) => r !== raza));
    } else {
      setRazasSeleccionadas([...razasSeleccionadas, raza]);
    }
  };

  // Validaciones del formulario
  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};
    if (!nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!apellido.trim()) nuevosErrores.apellido = 'El apellido es obligatorio';
    if (!barrio.trim()) nuevosErrores.barrio = 'El barrio es obligatorio';
    if (!telefono.trim()) nuevosErrores.telefono = 'El teléfono es obligatorio';
    
    const precio = parseFloat(precioHora);
    if (!precioHora) {
      nuevosErrores.precioHora = 'El precio es obligatorio';
    } else if (isNaN(precio) || precio <= 0) {
      nuevosErrores.precioHora = 'El precio debe ser un número mayor a 0';
    }

    if (!descripcion.trim() || descripcion.length < 15) {
      nuevosErrores.descripcion = 'Escribe una descripción de al menos 15 caracteres';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejo de envío
  const handleRegistro = async () => {
    if (!validarFormulario()) return;

    setCargando(true);
    
    // Determinar la foto definitiva
    const fotoFinal = avatarPersonalizado && customFotoUrl.trim() 
      ? customFotoUrl.trim() 
      : fotoUrl;

    try {
      const nuevo = await registrarPaseador({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        foto: fotoFinal,
        barrio: barrio.trim(),
        ciudad: 'Cipolletti',
        descripcion: descripcion.trim(),
        precioHora: parseFloat(precioHora),
        telefono: telefono.trim(),
        disponible: true,
        razasAceptadas: razasSeleccionadas.length > 0 ? razasSeleccionadas : ['Todas las razas'],
      });

      setPaseadorRegistrado(nuevo);
    } catch (e) {
      console.error(e);
      setErrores({ general: 'Ocurrió un error al procesar el registro.' });
    } finally {
      setCargando(false);
    }
  };

  // =========================================================================
  // VISTA DE ÉXITO (Confeti / Registro Completo)
  // =========================================================================
  if (paseadorRegistrado) {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.contenedorExito}>
        <View style={styles.exitoCard}>
          <Text style={styles.exitoIcono}>🎉🐾</Text>
          <Text style={styles.exitoTitulo}>¡Registro Exitoso!</Text>
          <Text style={styles.exitoSubtitulo}>
            Felicidades, {paseadorRegistrado.nombre}. Ya formas parte de la red de WalkPets en Cipolletti.
          </Text>

          {/* Tarjeta de vista previa del perfil registrado */}
          <Text style={styles.previewTitulo}>Vista previa de tu tarjeta:</Text>
          <View style={styles.previewProfile}>
            <Image source={{ uri: paseadorRegistrado.foto }} style={styles.previewFoto} />
            <View style={styles.previewInfo}>
              <View style={styles.previewRow}>
                <Text style={styles.previewNombre}>
                  {paseadorRegistrado.nombre} {paseadorRegistrado.apellido}
                </Text>
                <Text style={styles.previewBadge}>Paseador</Text>
              </View>
              <Text style={styles.previewBarrio}>📍 {paseadorRegistrado.barrio}</Text>
              <Text style={styles.previewPrecio}>
                ${paseadorRegistrado.precioHora} / hora
              </Text>
              <View style={styles.previewRatingRow}>
                <Text style={styles.previewEstrella}>⭐ 5.0</Text>
                <Text style={styles.previewResenas}>(Nuevo)</Text>
              </View>
            </View>
          </View>

          {/* Botones de navegación final */}
          <View style={styles.botonesExitoGroup}>
            <TouchableOpacity
              style={styles.btnExitoPrincipal}
              onPress={() => router.replace(`/paseadores/${paseadorRegistrado.id}`)}
            >
              <Text style={styles.btnExitoPrincipalTexto}>Ver mi Perfil Público</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnExitoSecundario}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.btnExitoSecundarioTexto}>Volver al Inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // =========================================================================
  // VISTA DEL FORMULARIO DE REGISTRO
  // =========================================================================
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Únete a la manada</Text>
      <Text style={styles.descripcionGuia}>
        Completa tus datos para ofrecer servicios de paseo y conectar con familias de Cipolletti que buscan cuidado responsable para sus mascotas.
      </Text>

      {errores.general && (
        <View style={styles.alertError}>
          <Text style={styles.alertErrorTexto}>{errores.general}</Text>
        </View>
      )}

      {/* Bloque: Datos Personales */}
      <View style={styles.cardForm}>
        <Text style={styles.seccionTituloForm}>Datos Personales</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={[styles.input, errores.nombre ? styles.inputError : null]}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Lucía"
            placeholderTextColor={colors.grisMedio}
          />
          {errores.nombre && <Text style={styles.errorTexto}>{errores.nombre}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Apellido *</Text>
          <TextInput
            style={[styles.input, errores.apellido ? styles.inputError : null]}
            value={apellido}
            onChangeText={setApellido}
            placeholder="Ej: Fernández"
            placeholderTextColor={colors.grisMedio}
          />
          {errores.apellido && <Text style={styles.errorTexto}>{errores.apellido}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono de Contacto *</Text>
          <TextInput
            style={[styles.input, errores.telefono ? styles.inputError : null]}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Ej: +54 299 4123456"
            keyboardType="phone-pad"
            placeholderTextColor={colors.grisMedio}
          />
          {errores.telefono && <Text style={styles.errorTexto}>{errores.telefono}</Text>}
        </View>
      </View>

      {/* Bloque: Servicio y Ubicación */}
      <View style={styles.cardForm}>
        <Text style={styles.seccionTituloForm}>Servicio de Paseo</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Barrio de Cobertura *</Text>
          <TextInput
            style={[styles.input, errores.barrio ? styles.inputError : null]}
            value={barrio}
            onChangeText={setBarrio}
            placeholder="Ej: Cipolletti Centro o Brentana"
            placeholderTextColor={colors.grisMedio}
          />
          {errores.barrio && <Text style={styles.errorTexto}>{errores.barrio}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Precio por Hora de Paseo ($ ARS) *</Text>
          <TextInput
            style={[styles.input, errores.precioHora ? styles.inputError : null]}
            value={precioHora}
            onChangeText={setPrecioHora}
            placeholder="Ej: 1800"
            keyboardType="numeric"
            placeholderTextColor={colors.grisMedio}
          />
          {errores.precioHora && <Text style={styles.errorTexto}>{errores.precioHora}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cuéntanos sobre ti y tu experiencia *</Text>
          <TextInput
            style={[styles.inputTextArea, errores.descripcion ? styles.inputError : null]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Ej: Tengo 4 años de experiencia cuidando perros de todo tamaño. Hacemos caminatas dinámicas en parques y siempre mando fotos durante los recorridos..."
            placeholderTextColor={colors.grisMedio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errores.descripcion && <Text style={styles.errorTexto}>{errores.descripcion}</Text>}
        </View>
      </View>

      {/* Bloque: Preferencias (Chips de razas) */}
      <View style={styles.cardForm}>
        <Text style={styles.seccionTituloForm}>Razas y Tamaños Aceptados</Text>
        <Text style={styles.subtextForm}>Selecciona todas las que apliquen:</Text>
        
        <View style={styles.chipsContainer}>
          {RAZAS_OPTIONS.map((raza) => {
            const seleccionada = razasSeleccionadas.includes(raza);
            return (
              <TouchableOpacity
                key={raza}
                style={[styles.chipRaza, seleccionada && styles.chipRazaActivo]}
                onPress={() => toggleRaza(raza)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipRazaTexto, seleccionada && styles.chipRazaTextoActivo]}>
                  {seleccionada ? '✓ ' : ''}{raza}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bloque: Foto de Perfil */}
      <View style={styles.cardForm}>
        <Text style={styles.seccionTituloForm}>Foto de Perfil</Text>
        
        {/* Vista previa de foto seleccionada */}
        <View style={styles.avatarPreviewWrap}>
          <Image 
            source={{ uri: avatarPersonalizado ? (customFotoUrl || 'https://via.placeholder.com/150') : fotoUrl }} 
            style={styles.avatarGrande} 
          />
          <Text style={styles.avatarPreviewLabel}>Vista previa de tu avatar</Text>
        </View>

        {/* Opciones rápidas */}
        <Text style={styles.subtextForm}>Elige uno de nuestros avatares predeterminados:</Text>
        <View style={styles.avatarsGrid}>
          {PRESET_AVATARS.map((avatar) => {
            const activo = !avatarPersonalizado && fotoUrl === avatar.url;
            return (
              <TouchableOpacity
                key={avatar.id}
                style={[styles.avatarCard, activo && styles.avatarCardActivo]}
                onPress={() => {
                  setFotoUrl(avatar.url);
                  setAvatarPersonalizado(false);
                }}
              >
                <Image source={{ uri: avatar.url }} style={styles.avatarMini} />
                <Text style={[styles.avatarLabel, activo && styles.avatarLabelActivo]}>
                  {avatar.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Opción personalizada */}
        <TouchableOpacity
          style={[styles.btnToggleCustom, avatarPersonalizado && styles.btnToggleCustomActivo]}
          onPress={() => setAvatarPersonalizado(!avatarPersonalizado)}
        >
          <Text style={[styles.btnToggleCustomTexto, avatarPersonalizado && styles.btnToggleCustomTextoActivo]}>
            {avatarPersonalizado ? '✓ Usando Foto Personalizada' : '✏️ Usar otra URL de foto'}
          </Text>
        </TouchableOpacity>

        {avatarPersonalizado && (
          <View style={styles.inputGroupCustomUrl}>
            <Text style={styles.label}>URL de la Imagen *</Text>
            <TextInput
              style={styles.input}
              value={customFotoUrl}
              onChangeText={setCustomFotoUrl}
              placeholder="https://ejemplo.com/mi-foto.jpg"
              placeholderTextColor={colors.grisMedio}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        )}
      </View>

      {/* Botón de Enviar */}
      <TouchableOpacity
        style={styles.btnRegistrar}
        onPress={handleRegistro}
        disabled={cargando}
        activeOpacity={0.9}
      >
        {cargando ? (
          <ActivityIndicator color={colors.blanco} />
        ) : (
          <Text style={styles.btnRegistrarTexto}>Crear mi Perfil de Paseador 🐾</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.crema,
  },
  contenedor: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  titulo: {
    fontSize: fonts.sizes.xxl,
    fontWeight: '800',
    color: colors.verde,
    marginBottom: spacing.xs,
  },
  descripcionGuia: {
    fontSize: fonts.sizes.sm + 1,
    color: colors.grisOscuro,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  alertError: {
    backgroundColor: colors.errorClaro,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  alertErrorTexto: {
    color: colors.error,
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
  },
  cardForm: {
    backgroundColor: colors.blanco,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  seccionTituloForm: {
    fontSize: fonts.sizes.md + 1,
    fontWeight: '700',
    color: colors.negro,
    marginBottom: spacing.md,
  },
  subtextForm: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    marginBottom: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
    color: colors.grisOscuro,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.grisClaro,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fonts.sizes.md,
    color: colors.negro,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputTextArea: {
    backgroundColor: colors.grisClaro,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fonts.sizes.md,
    color: colors.negro,
    minHeight: 100,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorClaro,
  },
  errorTexto: {
    color: colors.error,
    fontSize: fonts.sizes.xs + 1,
    marginTop: 4,
    fontWeight: '600',
  },
  
  // Chips
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chipRaza: {
    backgroundColor: colors.grisClaro,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.grisMedio,
  },
  chipRazaActivo: {
    backgroundColor: colors.verdePastel,
    borderColor: colors.verde,
  },
  chipRazaTexto: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    fontWeight: '600',
  },
  chipRazaTextoActivo: {
    color: colors.verde,
  },

  // Avatares
  avatarPreviewWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.grisClaro,
  },
  avatarGrande: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.grisClaro,
    borderWidth: 3,
    borderColor: colors.verde,
  },
  avatarPreviewLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.grisOscuro,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  avatarsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  avatarCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.grisClaro,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  avatarCardActivo: {
    backgroundColor: colors.verdePastel,
    borderColor: colors.verde,
  },
  avatarMini: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
  },
  avatarLabel: {
    fontSize: fonts.sizes.xs - 1,
    color: colors.grisOscuro,
    fontWeight: '600',
  },
  avatarLabelActivo: {
    color: colors.verde,
  },
  btnToggleCustom: {
    backgroundColor: colors.grisClaro,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.grisMedio,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  btnToggleCustomActivo: {
    backgroundColor: colors.verdePastel,
    borderColor: colors.verde,
    borderStyle: 'solid',
  },
  btnToggleCustomTexto: {
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
    color: colors.grisOscuro,
  },
  btnToggleCustomTextoActivo: {
    color: colors.verde,
  },
  inputGroupCustomUrl: {
    marginTop: spacing.xs,
  },

  // Botón Registrar
  btnRegistrar: {
    backgroundColor: colors.verde,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    ...shadows.card,
  },
  btnRegistrarTexto: {
    color: colors.blanco,
    fontSize: fonts.sizes.md,
    fontWeight: '700',
  },

  // VISTA DE ÉXITO
  contenedorExito: {
    padding: spacing.lg,
    justifyContent: 'center',
    flexGrow: 1,
  },
  exitoCard: {
    backgroundColor: colors.blanco,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  exitoIcono: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  exitoTitulo: {
    fontSize: fonts.sizes.xl,
    fontWeight: '800',
    color: colors.verde,
    marginBottom: spacing.sm,
  },
  exitoSubtitulo: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  previewTitulo: {
    fontSize: fonts.sizes.sm,
    fontWeight: '700',
    color: colors.grisOscuro,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  previewProfile: {
    flexDirection: 'row',
    backgroundColor: colors.crema,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: spacing.xxl,
    borderWidth: 1.5,
    borderColor: colors.verdePastel,
  },
  previewFoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.blanco,
  },
  previewInfo: {
    flex: 1,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  previewNombre: {
    fontSize: fonts.sizes.md,
    fontWeight: '700',
    color: colors.negro,
  },
  previewBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.verde,
    backgroundColor: colors.verdePastel,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  previewBarrio: {
    fontSize: fonts.sizes.xs,
    color: colors.grisOscuro,
    marginBottom: 4,
  },
  previewPrecio: {
    fontSize: fonts.sizes.sm,
    fontWeight: '700',
    color: colors.verde,
    marginBottom: 2,
  },
  previewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewEstrella: {
    fontSize: fonts.sizes.xs,
    fontWeight: '700',
    color: colors.naranja,
    marginRight: 4,
  },
  previewResenas: {
    fontSize: fonts.sizes.xs,
    color: colors.grisOscuro,
  },
  botonesExitoGroup: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  btnExitoPrincipal: {
    backgroundColor: colors.verde,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnExitoPrincipalTexto: {
    color: colors.blanco,
    fontSize: fonts.sizes.md,
    fontWeight: '700',
  },
  btnExitoSecundario: {
    backgroundColor: colors.grisClaro,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grisMedio,
  },
  btnExitoSecundarioTexto: {
    color: colors.grisOscuro,
    fontSize: fonts.sizes.md,
    fontWeight: '700',
  },
});
