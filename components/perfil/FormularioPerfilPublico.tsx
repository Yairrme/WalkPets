import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { BARRIOS_POR_CIUDAD, CIUDADES, Ciudad } from '../../src/constants/ciudades';
import { colors, fonts, spacing } from '../../src/constants/theme';
import { actualizarMiPerfilPaseador } from '../../src/services/paseadores.service';
import { Paseador, RedesSociales } from '../../src/types/paseador';
import { validarRedes } from '../../src/utils/redes';
import { MIN_DESCRIPCION } from '../../src/utils/validarRegistroPaseador';
import { BotonGuardar } from '../formulario/BotonGuardar';
import { Campo } from '../formulario/Campo';
import { CamposRedes } from '../formulario/CamposRedes';
import { OpcionesChips } from '../formulario/OpcionesChips';
import { Seccion } from '../formulario/Seccion';
import { SelectorCertificaciones } from '../formulario/SelectorCertificaciones';
import { SelectorFotoPerfil } from '../SelectorFotoPerfil';

// Panel del paseador: edita lo que ven los dueños en su perfil público.

const RAZAS = [
  'Todas las razas',
  'Razas pequeñas',
  'Razas medianas',
  'Razas grandes',
  'Cachorros',
  'Perros mayores',
];

type Props = {
  paseador: Paseador;
  onGuardado: (paseador: Paseador) => void;
};

export function FormularioPerfilPublico({ paseador, onGuardado }: Props) {
  const [disponible, setDisponible] = useState(paseador.disponible);
  const [foto, setFoto] = useState(paseador.foto);
  const [ciudad, setCiudad] = useState<Ciudad>(paseador.ciudad);
  const [barrio, setBarrio] = useState(paseador.barrio);
  const [precio, setPrecio] = useState(String(paseador.precioHora));
  const [descripcion, setDescripcion] = useState(paseador.descripcion);
  const [razas, setRazas] = useState(paseador.razasAceptadas);
  const [redes, setRedes] = useState<RedesSociales>(paseador.redes);
  const [certificaciones, setCertificaciones] = useState(paseador.certificaciones);

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const validar = () => {
    const nuevos: Record<string, string> = {};
    const precioNumero = Number.parseFloat(precio);
    if (!barrio.trim()) nuevos.barrio = 'El barrio es obligatorio';
    if (Number.isNaN(precioNumero) || precioNumero <= 0) nuevos.precio = 'El precio debe ser mayor a 0';
    if (descripcion.trim().length < MIN_DESCRIPCION) {
      nuevos.descripcion = `Escribí al menos ${MIN_DESCRIPCION} caracteres`;
    }
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const guardar = async () => {
    setMensaje(null);
    if (!validar()) {
      setMensaje({ tipo: 'error', texto: 'Revisá los campos marcados.' });
      return;
    }
    const errorRedes = validarRedes(redes);
    if (errorRedes) {
      setMensaje({ tipo: 'error', texto: errorRedes });
      return;
    }

    setGuardando(true);
    try {
      const actualizado = await actualizarMiPerfilPaseador({
        disponible,
        foto,
        ciudad,
        barrio: barrio.trim(),
        precioHora: Number.parseFloat(precio),
        descripcion: descripcion.trim(),
        razasAceptadas: razas.length > 0 ? razas : ['Todas las razas'],
        redes,
        certificaciones,
      });
      onGuardado(actualizado);
      setMensaje({ tipo: 'exito', texto: 'Tu perfil público se actualizó.' });
    } catch (e) {
      setMensaje({
        tipo: 'error',
        texto: e instanceof Error ? e.message : 'No pudimos guardar tu perfil.',
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      <Seccion titulo="Disponibilidad" retraso={120}>
        <View style={styles.disponible}>
          <View style={styles.disponibleTextos}>
            <Text style={styles.disponibleTitulo}>
              {disponible ? 'Estás tomando paseos' : 'Estás en pausa'}
            </Text>
            <Text style={styles.disponibleAyuda}>
              {disponible
                ? 'Los dueños te ven como "Disponible hoy".'
                : 'Seguís apareciendo, pero como "No disponible".'}
            </Text>
          </View>
          <Switch
            value={disponible}
            onValueChange={setDisponible}
            trackColor={{ false: colors.grisMedio, true: colors.verdeMenta }}
            thumbColor={disponible ? colors.verde : colors.blanco}
            accessibilityLabel="Disponible para paseos"
          />
        </View>
      </Seccion>

      <Seccion titulo="Foto" retraso={160}>
        <SelectorFotoPerfil
          foto={foto}
          nombre={paseador.nombre}
          apellido={paseador.apellido}
          onCambiar={setFoto}
        />
      </Seccion>

      <Seccion titulo="Tu servicio" retraso={200}>
        <View style={styles.grupo}>
          <Text style={styles.label}>Ciudad *</Text>
          <OpcionesChips
            opciones={CIUDADES}
            seleccionadas={[ciudad]}
            onAlternar={(opcion) => setCiudad(opcion as Ciudad)}
            etiquetaAccesible={(opcion) => `Trabajo en ${opcion}`}
          />
        </View>
        <Campo
          etiqueta="Barrio donde trabajás"
          error={errores.barrio}
          value={barrio}
          onChangeText={setBarrio}
          accessibilityLabel="Barrio de cobertura"
        />
        <OpcionesChips
          opciones={BARRIOS_POR_CIUDAD[ciudad]}
          seleccionadas={[barrio]}
          onAlternar={setBarrio}
          etiquetaAccesible={(opcion) => `Usar barrio ${opcion}`}
        />
        <Campo
          etiqueta="Precio por hora (ARS)"
          prefijo="$"
          error={errores.precio}
          value={precio}
          onChangeText={setPrecio}
          keyboardType="numeric"
          accessibilityLabel="Precio por hora"
        />
        <Campo
          etiqueta="Sobre vos y tu experiencia"
          ayuda={`${descripcion.trim().length} caracteres · mínimo ${MIN_DESCRIPCION}`}
          error={errores.descripcion}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Sobre mí y experiencia"
        />
        <View style={styles.grupo}>
          <Text style={styles.label}>Razas y tamaños que aceptás</Text>
          <OpcionesChips
            opciones={RAZAS}
            seleccionadas={razas}
            onAlternar={(raza) =>
              setRazas((actuales) =>
                actuales.includes(raza) ? actuales.filter((r) => r !== raza) : [...actuales, raza]
              )
            }
          />
        </View>
      </Seccion>

      <Seccion titulo="Tus redes" descripcion="Opcional." retraso={240}>
        <CamposRedes redes={redes} onCambiar={setRedes} />
      </Seccion>

      <Seccion titulo="Permisos y certificaciones" descripcion="Opcional." retraso={280}>
        <SelectorCertificaciones certificaciones={certificaciones} onCambiar={setCertificaciones} />
      </Seccion>

      <BotonGuardar
        etiqueta="Guardar mi perfil público"
        onPress={guardar}
        guardando={guardando}
        mensaje={mensaje}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: spacing.md,
  },
  grupo: {
    gap: spacing.xs + 2,
  },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.verdeOscuro,
  },
  disponible: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  disponibleTextos: {
    flex: 1,
    gap: 2,
  },
  disponibleTitulo: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.semi,
    color: colors.negro,
  },
  disponibleAyuda: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
  },
});
