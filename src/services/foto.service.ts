import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { MAX_FOTO_SUBIDA } from '../utils/fotoPerfil';

// Abre la galería (en web, el selector de archivos), recorta en cuadrado y
// achica la imagen a 400 px en JPEG. Devuelve un data URI listo para guardar
// en el perfil, o null si el usuario canceló.

const LADO = 400;

export async function elegirFotoDePerfil(): Promise<string | null> {
  const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permiso.granted) {
    throw new Error('Necesitamos permiso para acceder a tus fotos.');
  }

  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  if (resultado.canceled || !resultado.assets[0]) return null;

  const contexto = ImageManipulator.manipulate(resultado.assets[0].uri);
  contexto.resize({ width: LADO });
  const imagen = await contexto.renderAsync();
  const guardada = await imagen.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.7,
    base64: true,
  });

  if (!guardada.base64) {
    throw new Error('No pudimos procesar la foto. Probá con otra.');
  }

  const dataUri = `data:image/jpeg;base64,${guardada.base64}`;
  if (dataUri.length > MAX_FOTO_SUBIDA) {
    throw new Error('La foto es demasiado pesada. Probá con otra.');
  }
  return dataUri;
}
