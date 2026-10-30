# Checkout Pro: contrato de implementación

Alcance: reservas individuales en ARS, Checkout Pro con preferencias. Suscripciones fuera de alcance.
El backend calcula 1250/2500/5000 ARS para 15/30/60 minutos (tarifa actual de la app).
Los cálculos internos usan centavos enteros. El importe mostrado antes de crear el checkout es estimativo.

Una reserva pendiente retiene el espacio hasta expires_at (actualmente 10 minutos o inicio del turno).
Una preferencia por reserva, reutilizada en reintentos y dobles toques; su vencimiento coincide con el turno retenido.
Una respuesta ambigua del proveedor nunca autoriza crear otra preferencia automáticamente.
No se acepta dinero real por defecto: MP_ENABLED=false; MP_LIVE_MODE=false.

POST /api/v1/reservations/:id/checkout y GET /api/v1/reservations/:id/payment requieren el token de reserva como Bearer.
GET consulta y reconcilia el estado con Mercado Pago. Nunca se acepta un estado de pago enviado por el celular.
POST /api/v1/payments/webhook requiere firma HMAC válida y vuelve a consultar el pago al proveedor.
El retorno HTTPS /api/v1/payments/return abre uash://checkout/result sin incluir tokens privados.

Solo un pago aprobado, con importe, moneda, vendedor y referencia correctos, confirma una reserva pendiente vigente.
La confirmación usa la misma exclusión por espacio que las reservas para evitar sobreventas.
Pagos aprobados tardíos, duplicados o posteriores a cancelación requieren revisión; no confirman otro turno.
Devoluciones y contracargos actualizan el pago y bloquean la confirmación; no se ejecutan devoluciones automáticas.
Cancelar una reserva pagada requiere una política de devolución y sigue bloqueado.

La app conserva el token en almacenamiento seguro, abre el navegador nativo, y consulta al volver o recuperar la sesión.
El deep link solo navega. Pendiente/rechazado/cerrado no equivalen a reserva confirmada.

Pasos 1–5: reglas, persistencia, backend, confirmación/reconciliación, Expo.
Paso 6 (prueba completa con Mercado Pago) y paso 7 (producción) quedan a cargo del usuario.
No se crean aplicaciones, credenciales, usuarios ni webhooks en la cuenta durante la implementación.

Fuentes: https://www.mercadopago.com/developers/es/docs/checkout-pro-preferences/create-payment-preference
https://www.mercadopago.com/developers/es/docs/checkout-pro-preferences/mobile-integration/react-native-expo-go

## Uso en mobile
`Tengo una reserva` abre el estado guardado. La app recupera esa pantalla al reiniciar.
El token se guarda con expo-secure-store y no viaja en el deep link; web no dispone de este flujo seguro.
Después de crear la reserva, pulsar Preparar checkout abre Mercado Pago. Volver no significa pagar.
El estado se actualiza al enfocar, volver del navegador, reactivar la app y durante un minuto en primer plano.
Un pago rechazado permite continuar la misma preferencia antes del vencimiento.
La sesión se conserva para consultar el pago; para reservar de nuevo se cancela la reserva pendiente o se archiva un resultado final/vencido.
El historial permite volver a consultar hasta 20 reservas en el mismo dispositivo.
Los plugins y scheme requieren una nueva development build para validar el retorno real en iOS y Android.
No se crearon ni configuraron recursos en Mercado Pago. Pasos 6 y 7 siguen pendientes para el usuario.

Para compilar Expo SDK 54 usá Node >=20.19.4 (el Node global actual es más antiguo).
