import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CIUDADES, Ciudad } from '../../src/constants/ciudades';
import { colors, fonts, spacing } from '../../src/constants/theme';
import { actualizarMiCuenta } from '../../src/services/cuenta.service';
import { Usuario } from '../../src/types/paseador';
import { formatearTelefono, normalizarTelefono } from '../../src/utils/telefono';
import { BotonGuardar } from '../formulario/BotonGuardar';
import { Campo } from '../formulario/Campo';
import { OpcionesChips } from '../formulario/OpcionesChips';

// "Mis datos": lo que cualquier usuario puede editar de su cuenta.
// Para clientes suma ciudad, barrio y sus mascotas (solo visible para él).

type Props = {
  usuario: Usuario;
  onGuardado: (usuario: Usuario) => void;
};

export function FormularioCuenta({ usuario, onGuardado }: Props) {
  const esPaseador = usuario.rol === 'paseador';
  const { width } = useWindowDimensions();
  const dosColumnas = width >= 640;

  const [nombre, setNombre] = useState(usuario.nombre);
  const [apellido, setApellido] = useState(usuario.apellido);
  const [telefono, setTelefono] = useState(formatearTelefono(usuario.telefono) ?? '');
  const [ciudad, setCiudad] = useState<Ciudad | null>(usuario.ciudad ?? null);
  const [barrio, setBarrio] = useState(usuario.barrio ?? '');
  const [mascotas, setMascotas] = useState(usuario.mascotas ?? '');

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [errorTelefono, setErrorTelefono] = useState<string | undefined>();

  const guardar = async () => {
    setMensaje(null);
    setErrorTelefono(undefined);

    if (telefono.trim() && !normalizarTelefono(telefono)) {
      setErrorTelefono('Ingresá un teléfono válido (ej. 4123456 o 299 4123456)');
      return;
    }
    if (esPaseador && !telefono.trim()) {
      setErrorTelefono('Los paseadores necesitan un teléfono de contacto.');
      return;
    }

    setGuardando(true);
    try {
      const actualizado = await actualizarMiCuenta({
        nombre,
        apellido,
        telefono: telefono.trim(),
        ...(esPaseador ? {} : { ciudad, barrio: barrio.trim(), mascotas: mascotas.trim() }),
      });
      onGuardado(actualizado);
      setMensaje({ tipo: 'exito', texto: 'Tus datos se guardaron.' });
    } catch (e) {
      setMensaje({
        tipo: 'error',
        texto: e instanceof Error ? e.message : 'No pudimos guardar tus datos.',
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      <View style={[styles.fila, dosColumnas && styles.filaDoble]}>
        <Campo etiqueta="Nombre" value={nombre} onChangeText={setNombre} enFila={dosColumnas} accessibilityLabel="Nombre" />
        <Campo etiqueta="Apellido" value={apellido} onChangeText={setApellido} enFila={dosColumnas} accessibilityLabel="Apellido" />
      </View>

      <Campo
        etiqueta={esPaseador ? 'Teléfono / WhatsApp' : 'Teléfono'}
        obligatorio={esPaseador}
        ayuda={esPaseador ? 'Se muestra en tu perfil público.' : 'Opcional. No se muestra a otros usuarios.'}
        error={errorTelefono}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="Ej: 4123456 o 299 4123456"
        keyboardType="phone-pad"
        accessibilityLabel="Teléfono"
      />

      <View style={styles.soloLectura}>
        <Text style={styles.soloLecturaLabel}>Correo electrónico</Text>
        <Text style={styles.soloLecturaValor}>{usuario.email}</Text>
      </View>

      {!esPaseador && (
        <>
          <View style={styles.grupo}>
            <Text style={styles.label}>Tu ciudad</Text>
            <OpcionesChips
              opciones={CIUDADES}
              seleccionadas={ciudad ? [ciudad] : []}
              onAlternar={(opcion) => setCiudad(ciudad === opcion ? null : (opcion as Ciudad))}
              etiquetaAccesible={(opcion) => `Mi ciudad es ${opcion}`}
            />
          </View>
          <Campo
            etiqueta="Tu barrio"
            obligatorio={false}
            value={barrio}
            onChangeText={setBarrio}
            placeholder="Ej: Alta Barda"
            accessibilityLabel="Tu barrio"
          />
          <Campo
            etiqueta="Tus mascotas"
            obligatorio={false}
            ayuda="Nombre, raza, edad o lo que convenga contarle al paseador."
            value={mascotas}
            onChangeText={setMascotas}
            placeholder="Ej: Rocky, labrador de 3 años, tira de la correa."
            multiline
            textAlignVertical="top"
            maxLength={300}
            accessibilityLabel="Tus mascotas"
          />
        </>
      )}

      <BotonGuardar etiqueta="Guardar mis datos" onPress={guardar} guardando={guardando} mensaje={mensaje} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: spacing.md,
  },
  fila: {
    gap: spacing.md,
  },
  filaDoble: {
    flexDirection: 'row',
  },
  grupo: {
    gap: spacing.xs + 2,
  },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.verdeOscuro,
  },
  soloLectura: {
    gap: 2,
  },
  soloLecturaLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.verdeOscuro,
  },
  soloLecturaValor: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
  },
});
