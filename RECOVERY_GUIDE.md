# Guía de Recuperación de Credenciales: Telegram 🆘⚙️

Si has perdido tus tokens de Telegram debido a la actualización del código, no te preocupes. Recuperarlos toma menos de 2 minutos siguiendo estos pasos:

## 1. Recuperar el TOKEN del Bot
El token es la "llave" que permite al sistema enviar mensajes.

1. Abre **Telegram** y busca al bot oficial `@BotFather`.
2. Escribe el comando `/mybots`.
3. Selecciona tu bot de la lista.
4. Haz clic en el botón **"API Token"**.
5. Telegram te mostrará el token (una cadena larga de números y letras). **Cópialo**.

## 2. Recuperar tu CHAT ID
El Chat ID es el "número de casa" de tu grupo o chat personal donde llegan las alertas.

1. Si las alertas llegan a un **Chat Personal**:
   - Busca al bot `@userinfobot` o `@IDBot` en Telegram.
   - Escribe `/start`.
   - Te responderá con un número (ej: `12345678`). **Ese es tu ID**.
2. Si las alertas llegan a un **Grupo**:
   - Agrega temporalmente al bot `@IDBot` a tu grupo.
   - El bot escribirá automáticamente el ID del grupo (normalmente empieza con un signo menos, ej: `-987654321`). **Ese es tu Chat ID**.

---

## 🔐 Cómo volver a activarlos (Paso Final)
Una vez que tengas ambos datos:

1. Ve a tu código en **Apps Script**.
2. Busca la función `guardarMisCredenciales` (está al principio).
3. Pega tu Token y tu Chat ID donde dice `"TU_TOKEN_AQUÍ"` y `"TU_CHAT_ID_AQUÍ"`.
4. En el menú de arriba, selecciona la función `guardarMisCredenciales` y dale a **"Ejecutar"**.
5. **Listo!** Ya puedes borrar los tokens del código si quieres; Google los recordará para siempre.

---
**Elite Suite • Guía de Emergencia (2026)**
