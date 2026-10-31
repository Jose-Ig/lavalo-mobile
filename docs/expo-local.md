# Expo local — SDK 58

El proyecto usa Expo SDK 58 y requiere Expo Go compatible con SDK 58 en el dispositivo.
Usar Node 24 LTS (el archivo .nvmrc permite seleccionarlo con nvm use).

Desde /Users/jose.prieto/proyectos/uash/uash-mobile:

```sh
nvm use
npm install
npx expo start --clear --go
```

Detener cualquier Metro anterior antes de iniciar. En iPhone, abrir el QR con Cámara y Expo Go.
El teléfono y la computadora deben compartir red para usar LAN. EXPO_PUBLIC_API_URL debe apuntar
al backend accesible desde el teléfono; localhost en el iPhone apunta al propio iPhone.
El backend y su túnel público para webhooks se levantan por separado.

Si Expo Go indica SDK 54, cerrar el servidor anterior y confirmar que el QR corresponde a este proyecto.
Una development build creada con SDK 54 requiere recompilarse para SDK 58.

Validación de la actualización: expo-doctor, expo install --check, TypeScript, pruebas de checkout
local y exportación de bundles iOS/Android. La prueba física de cámara, diseño y conexión al backend
requiere abrir Expo Go en el teléfono.

Documentación oficial: https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
