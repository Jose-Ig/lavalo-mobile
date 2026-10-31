# Inicio y navegación

La apertura normal muestra Home. Los enlaces explícitos uash://checkout/result mantienen el retorno al pago.
Las reservas guardadas siguen disponibles desde Tengo una reserva; no se borran ni se modifica el backend.
La suscripción permanece implementada pero sin acceso desde Home por ahora.

La entrada espera el layout y las preferencias de accesibilidad; muestra el wordmark centrado, lo desplaza
y revela las acciones. No representa una espera de red. Se omite el movimiento si el sistema lo solicita.
Los botones son desplazables en pantallas pequeñas o con texto ampliado. Las acciones invisibles no reciben toques.

Android: botones filled/tonal de 64 dp y 32 dp de radio, ripple, navegación de al menos 80 dp,
indicador activo de 60x32 dp e iconos de 24 dp. Convenciones de Material 3 Expressive con colores de Uash.
iOS: botones de al menos 56 pt y barra flotante, Liquid Glass nativo cuando está disponible,
BlurView en versiones anteriores y superficie opaca al activar Reducir transparencia.
El contraste de etiquetas e iconos no depende del color del contenido detrás del vidrio.

Los cuatro iconos SVG son idénticos en ambas plataformas: casa, pin, WhatsApp e información.
Se conservan los destinos de mapas, WhatsApp e Instagram y se manejan errores al abrirlos.

Reiniciar Metro tras instalar las dependencias: npx expo start --clear.
Una development build anterior necesita recompilarse para incluir expo-glass-effect y expo-blur.
El aspecto nativo de Liquid Glass depende de iOS compatible y del SDK con el que fue compilada la app.
La animación descrita pertenece a la pantalla de React Native, no reemplaza el splash nativo de Expo Go.

Referencias:
https://m3.material.io/components/buttons/overview
https://m3.material.io/components/navigation-bar/specs
https://developer.apple.com/design/human-interface-guidelines/materials
https://docs.expo.dev/versions/latest/sdk/glass-effect/
