// Las pruebas usan el repositorio en memoria salvo que mockeen la configuración.
process.env.EXPO_PUBLIC_DATA_SOURCE = 'mock';

// Almacenamiento en memoria para las pruebas. Evita depender del módulo nativo.
jest.mock('@react-native-async-storage/async-storage', () => {
  let almacenamiento: Record<string, string> = {};

  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (clave: string) => almacenamiento[clave] ?? null),
      setItem: jest.fn(async (clave: string, valor: string) => {
        almacenamiento[clave] = valor;
      }),
      removeItem: jest.fn(async (clave: string) => {
        delete almacenamiento[clave];
      }),
      clear: jest.fn(async () => {
        almacenamiento = {};
      }),
    },
  };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  const crearIcono = (familia: string) => {
    const Icono = ({ name }: { name: string }) =>
      React.createElement(Text, null, `icon:${familia}:${name}`);
    Icono.displayName = `Icono${familia}`;
    return Icono;
  };

  return {
    FontAwesome: crearIcono('FontAwesome'),
    Entypo: crearIcono('Entypo'),
    MaterialIcons: crearIcono('MaterialIcons'),
    Ionicons: crearIcono('Ionicons'),
  };
});
