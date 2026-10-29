import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Aparecer } from '../../components/Aparecer';
import { AvatarPaseador } from '../../components/AvatarPaseador';
import { Campo } from '../../components/formulario/Campo';
import { CamposRedes } from '../../components/formulario/CamposRedes';
import { Seccion } from '../../components/formulario/Seccion';
import { SelectorCertificaciones } from '../../components/formulario/SelectorCertificaciones';
import { SelectorFotoPerfil } from '../../components/SelectorFotoPerfil';
import { BARRIOS_POR_CIUDAD, CIUDADES, Ciudad } from '../../src/constants/ciudades';
import { REDES_VACIAS } from '../../src/constants/perfil';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { useSesion } from '../../src/context/SesionContext';
import { registrarPaseador } from '../../src/services/paseadores.service';
import { Paseador, RedesSociales } from '../../src/types/paseador';
import { validarRedes } from '../../src/utils/redes';
import { normalizarTelefono } from '../../src/utils/telefono';
import {
  ErroresFormulario,
  FormularioPaseador,
  MIN_DESCRIPCION,
  validarRegistroPaseador,
} from '../../src/utils/validarRegistroPaseador';

// Opciones de especialidad o razas aceptadas
const RAZAS_OPTIONS = [
  'Todas las razas',
  'Razas pequeñas',
  'Razas medianas',
  'Razas grandes',
  'Cachorros',
  'Perros mayores',
];

const FORMULARIO_VACIO: FormularioPaseador = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  telefono: '',
  ciudad: '',
  barrio: '',
  precioHora: '',
  descripcion: '',
};

export default function RegistroPaseador() {
  const { recargar } = useSesion();
  const { width } = useWindowDimensions();
  const dosColumnas = width >= 640;

  const [form, setForm] = useState<FormularioPaseador>(FORMULARIO_VACIO);
  // Sin elegir: se muestran las iniciales. Opciones: avatar mujer/hombre o foto propia.
  const [foto, setFoto] = useState('');
  const [razasSeleccionadas, setRazasSeleccionadas] = useState<string[]>(['Todas las razas']);
  const [redes, setRedes] = useState<RedesSociales>(REDES_VACIAS);
  const [certificaciones, setCertificaciones] = useState<string[]>([]);

  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [paseadorRegistrado, setPaseadorRegistrado] = useState<Paseador | null>(null);

  const actualizar = <K extends keyof FormularioPaseador>(campo: K, valor: FormularioPaseador[K]) =>
    setForm((actual) => ({ ...actual, [campo]: valor }));

  const toggleRaza = (raza: string) =>
    setRazasSeleccionadas((actuales) =>
      actuales.includes(raza) ? actuales.filter((r) => r !== raza) : [...actuales, raza]
    );

  const handleRegistro = async () => {
    const nuevosErrores = validarRegistroPaseador(form);
    const errorRedes = validarRedes(redes);
    if (errorRedes) nuevosErrores.general = errorRedes;
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const telefonoNormalizado = normalizarTelefono(form.telefono);
    if (!telefonoNormalizado || !form.ciudad) return;

    setCargando(true);
    try {
      const nuevo = await registrarPaseador({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        foto,
        barrio: form.barrio.trim(),
        ciudad: form.ciudad,
        descripcion: form.descripcion.trim(),
        precioHora: Number.parseFloat(form.precioHora),
        telefono: `+${telefonoNormalizado}`,
        disponible: true,
        razasAceptadas: razasSeleccionadas.length > 0 ? razasSeleccionadas : ['Todas las razas'],
        redes,
        certificaciones,
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setPaseadorRegistrado(nuevo);
      // El registro deja la sesión guardada: la reflejamos en toda la app.
      await recargar();
    } catch (e) {
      // Mostramos el motivo real (ej. "Ya existe una cuenta con ese correo.").
      setErrores({
        general: e instanceof Error ? e.message : 'Ocurrió un error al procesar el registro.',
      });
    } finally {
      setCargando(false);
    }
  };

  // =========================================================================
  // VISTA DE ÉXITO
  // =========================================================================
  if (paseadorRegistrado) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contenedorExito}
        keyboardShouldPersistTaps="handled"
      >
        <Aparecer style={styles.exitoCard}>
          <Text style={styles.exitoIcono}>🎉🐾</Text>
          <Text style={styles.exitoTitulo}>¡Registro Exitoso!</Text>
          <Text style={styles.exitoSubtitulo}>
            Felicidades, {paseadorRegistrado.nombre}. Ya formas parte de la red de WalkPets en {paseadorRegistrado.ciudad}.
          </Text>

          <Text style={styles.previewTitulo}>Así te van a ver los dueños</Text>
          <View style={styles.previewProfile}>
            <AvatarPaseador
              foto={paseadorRegistrado.foto}
              nombre={paseadorRegistrado.nombre}
              apellido={paseadorRegistrado.apellido}
              tamano={64}
              redondo
            />
            <View style={styles.previewInfo}>
              <Text style={styles.previewNombre}>
                {paseadorRegistrado.nombre} {paseadorRegistrado.apellido}
              </Text>
              <Text style={styles.previewBarrio}>
                📍 {paseadorRegistrado.barrio}, {paseadorRegistrado.ciudad}
              </Text>
              <Text style={styles.previewPrecio}>
                ${paseadorRegistrado.precioHora.toLocaleString('es-AR')} / hora
              </Text>
              <Text style={styles.previewResenas}>⭐ Sin calificaciones todavía</Text>
            </View>
          </View>

          <View style={styles.botonesExitoGroup}>
            <TouchableOpacity
              style={styles.btnPrincipal}
              onPress={() => router.replace(`/paseadores/${paseadorRegistrado.id}`)}
              accessibilityRole="button"
            >
              <Text style={styles.btnPrincipalTexto}>Ver mi perfil público</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSecundario}
              onPress={() => router.replace('/')}
              accessibilityRole="button"
            >
              <Text style={styles.btnSecundarioTexto}>Volver al Inicio</Text>
            </TouchableOpacity>
          </View>
        </Aparecer>
      </ScrollView>
    );
  }

  // =========================================================================
  // FORMULARIO
  // =========================================================================
  const barriosSugeridos = form.ciudad ? BARRIOS_POR_CIUDAD[form.ciudad] : [];
  const largoDescripcion = form.descripcion.trim().length;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContenido}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contenedor}>
      <Aparecer style={styles.encabezado}>
        <Text style={styles.eyebrow}>PARA PASEADORES Y CUIDADORES</Text>
        <Text style={styles.titulo}>Ofrecé tus paseos</Text>
        <Text style={styles.descripcionGuia}>
          Creá tu perfil gratis y conectá con familias de Cipolletti y Neuquén que buscan
          cuidado responsable para sus mascotas. Te contactan directo por teléfono o WhatsApp.
        </Text>
      </Aparecer>

      {errores.general && (
        <Aparecer style={styles.alertError}>
          <Text style={styles.alertErrorTexto}>{errores.general}</Text>
        </Aparecer>
      )}

      <Seccion numero={1} titulo="Tu foto" retraso={60}>
        <SelectorFotoPerfil
          foto={foto}
          nombre={form.nombre}
          apellido={form.apellido}
          onCambiar={setFoto}
        />
      </Seccion>

      <Seccion numero={2} titulo="Tus datos" retraso={120}>
        <View style={[styles.fila, dosColumnas && styles.filaDoble]}>
          <Campo
            etiqueta="Nombre"
            error={errores.nombre}
            value={form.nombre}
            onChangeText={(v) => actualizar('nombre', v)}
            placeholder="Ej: Lucía"
            enFila={dosColumnas}
            accessibilityLabel="Nombre"
            autoComplete="given-name"
          />
          <Campo
            etiqueta="Apellido"
            error={errores.apellido}
            value={form.apellido}
            onChangeText={(v) => actualizar('apellido', v)}
            placeholder="Ej: Fernández"
            enFila={dosColumnas}
            accessibilityLabel="Apellido"
            autoComplete="family-name"
          />
        </View>
        <Campo
          etiqueta="Teléfono / WhatsApp"
          ayuda="Es el número que van a usar los dueños para contactarte."
          error={errores.telefono}
          value={form.telefono}
          onChangeText={(v) => actualizar('telefono', v)}
          placeholder="Ej: 4123456 o 299 4123456"
          keyboardType="phone-pad"
          accessibilityLabel="Teléfono de contacto"
          autoComplete="tel"
        />
      </Seccion>

      <Seccion numero={3} titulo="Tu cuenta" retraso={180}>
        <View style={[styles.fila, dosColumnas && styles.filaDoble]}>
          <Campo
            etiqueta="Correo electrónico"
            error={errores.email}
            value={form.email}
            onChangeText={(v) => actualizar('email', v)}
            placeholder="Ej: lucia@correo.com"
            enFila={dosColumnas}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Correo electrónico"
            autoComplete="email"
          />
          <Campo
            etiqueta="Contraseña"
            error={errores.password}
            value={form.password}
            onChangeText={(v) => actualizar('password', v)}
            placeholder="Mínimo 8 caracteres"
            enFila={dosColumnas}
            secureTextEntry
            autoCapitalize="none"
            accessibilityLabel="Contraseña"
            autoComplete="new-password"
          />
        </View>
      </Seccion>

      <Seccion numero={4} titulo="Tu servicio" retraso={240}>
        <View style={styles.campo}>
          <Text style={styles.label}>Ciudad *</Text>
          <View style={styles.chipsContainer}>
            {CIUDADES.map((opcion) => {
              const activa = form.ciudad === opcion;
              return (
                <TouchableOpacity
                  key={opcion}
                  style={[styles.chip, styles.chipCiudad, activa && styles.chipActivo]}
                  onPress={() => actualizar('ciudad', opcion as Ciudad)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Seleccionar ciudad ${opcion}`}
                  accessibilityState={{ selected: activa }}
                >
                  <Text style={[styles.chipTexto, activa && styles.chipTextoActivo]}>
                    {activa ? '✓ ' : ''}{opcion}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errores.ciudad && <Text style={styles.errorTexto}>{errores.ciudad}</Text>}
        </View>

        <Campo
          etiqueta="Barrio donde trabajás"
          error={errores.barrio}
          value={form.barrio}
          onChangeText={(v) => actualizar('barrio', v)}
          placeholder="Ej: Cipolletti Centro o Brentana"
          accessibilityLabel="Barrio de cobertura"
        />
        {barriosSugeridos.length > 0 && (
          <View style={[styles.chipsContainer, styles.sugerencias]}>
            {barriosSugeridos.map((barrio) => {
              const activo = form.barrio === barrio;
              return (
                <TouchableOpacity
                  key={barrio}
                  style={[styles.chipChico, activo && styles.chipActivo]}
                  onPress={() => actualizar('barrio', barrio)}
                  accessibilityRole="button"
                  accessibilityLabel={`Usar barrio ${barrio}`}
                >
                  <Text style={[styles.chipChicoTexto, activo && styles.chipTextoActivo]}>
                    {barrio}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Campo
          etiqueta="Precio por hora (ARS)"
          prefijo="$"
          error={errores.precioHora}
          value={form.precioHora}
          onChangeText={(v) => actualizar('precioHora', v)}
          placeholder="Ej: 1800"
          keyboardType="numeric"
          accessibilityLabel="Precio por hora"
        />

        <Campo
          etiqueta="Contá sobre vos y tu experiencia"
          ayuda={`${largoDescripcion} caracteres · mínimo ${MIN_DESCRIPCION}`}
          error={errores.descripcion}
          value={form.descripcion}
          onChangeText={(v) => actualizar('descripcion', v)}
          placeholder="Ej: Tengo 4 años de experiencia cuidando perros de todo tamaño. Hacemos caminatas dinámicas en parques y siempre mando fotos durante los recorridos..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          accessibilityLabel="Sobre mí y experiencia"
        />
      </Seccion>

      <Seccion numero={5} titulo="Razas y tamaños que aceptás" retraso={300}>
        <View style={styles.chipsContainer}>
          {RAZAS_OPTIONS.map((raza) => {
            const seleccionada = razasSeleccionadas.includes(raza);
            return (
              <TouchableOpacity
                key={raza}
                style={[styles.chip, seleccionada && styles.chipActivo]}
                onPress={() => toggleRaza(raza)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: seleccionada }}
              >
                <Text style={[styles.chipTexto, seleccionada && styles.chipTextoActivo]}>
                  {seleccionada ? '✓ ' : ''}{raza}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Seccion>

      <Seccion
        numero={6}
        titulo="Tus redes"
        descripcion="Opcional. Ayudan a los dueños a conocer tu trabajo."
        retraso={360}
      >
        <CamposRedes redes={redes} onCambiar={setRedes} />
      </Seccion>

      <Seccion
        numero={7}
        titulo="Permisos y certificaciones"
        descripcion="Opcional. Por ejemplo, habilitación municipal o cursos."
        retraso={420}
      >
        <SelectorCertificaciones
          certificaciones={certificaciones}
          onCambiar={setCertificaciones}
        />
      </Seccion>

      <Aparecer retraso={480}>
        <TouchableOpacity
          style={[styles.btnPrincipal, styles.btnRegistrar, cargando && styles.btnDeshabilitado]}
          onPress={handleRegistro}
          disabled={cargando}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Crear mi perfil de paseador"
          accessibilityState={{ disabled: cargando, busy: cargando }}
        >
          {cargando ? (
            <ActivityIndicator color={colors.blanco} />
          ) : (
            <Text style={styles.btnPrincipalTexto}>Crear mi Perfil de Paseador 🐾</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.notaFinal}>
          Tu correo y tu contraseña no se muestran en el perfil público.
        </Text>
      </Aparecer>
      </View>
    </ScrollView>
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

  // Encabezado
  encabezado: {
    paddingVertical: spacing.md,
  },
  eyebrow: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.pesos.semi,
    color: colors.verdeOliva,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  titulo: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.display,
    color: colors.verdeOscuro,
    marginBottom: spacing.sm,
  },
  descripcionGuia: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
    lineHeight: 22,
  },
  alertError: {
    backgroundColor: colors.errorClaro,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  alertErrorTexto: {
    color: colors.error,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
  },

  // Secciones

  // Campos
  fila: {
    gap: spacing.md,
  },
  filaDoble: {
    flexDirection: 'row',
  },
  campo: {
    gap: spacing.xs + 2,
  },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.verdeOscuro,
  },
  errorTexto: {
    color: colors.error,
    fontSize: fonts.sizes.xs + 1,
    fontWeight: fonts.pesos.medio,
  },

  // Chips
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sugerencias: {
    marginTop: -spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.grisMedio,
    backgroundColor: colors.blanco,
  },
  chipCiudad: {
    paddingHorizontal: spacing.lg,
  },
  chipActivo: {
    backgroundColor: colors.verde,
    borderColor: colors.verde,
  },
  chipTexto: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.grisOscuro,
  },
  chipTextoActivo: {
    color: colors.blanco,
  },
  chipChico: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.verdePastel,
    borderWidth: 1,
    borderColor: colors.verdePastel,
  },
  chipChicoTexto: {
    fontSize: fonts.sizes.xs + 1,
    fontWeight: fonts.pesos.medio,
    color: colors.verde,
  },

  // Botones
  btnPrincipal: {
    backgroundColor: colors.verde,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  btnRegistrar: {
    marginTop: spacing.sm,
  },
  btnDeshabilitado: {
    opacity: 0.7,
  },
  btnPrincipalTexto: {
    color: colors.blanco,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.semi,
  },
  btnSecundario: {
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.verde,
  },
  btnSecundarioTexto: {
    color: colors.verde,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.semi,
  },
  notaFinal: {
    marginTop: spacing.sm,
    textAlign: 'center',
    fontSize: fonts.sizes.xs + 1,
    color: colors.grisOscuro,
  },

  // Éxito
  contenedorExito: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  exitoCard: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: colors.blanco,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.linea,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  exitoIcono: {
    fontSize: 56,
  },
  exitoTitulo: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.titulo,
    color: colors.verdeOscuro,
  },
  exitoSubtitulo: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
    textAlign: 'center',
    lineHeight: 22,
  },
  previewTitulo: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.grisOscuro,
  },
  previewProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.crema,
  },
  previewInfo: {
    flex: 1,
    gap: 2,
  },
  previewNombre: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.semi,
    color: colors.negro,
  },
  previewBarrio: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
  },
  previewPrecio: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.verde,
  },
  previewResenas: {
    fontSize: fonts.sizes.xs + 1,
    color: colors.grisOscuro,
  },
  botonesExitoGroup: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
