# Manual de Ingeniería: Elite Admin Suite A-Z 🏛️💎
*Guía Definitiva para la Replicación de Sistemas Financieros Inteligentes*

Este manual está diseñado para ser seguido por cualquier persona, desde un ingeniero hasta un niño de 10 años. Sigue los pasos EXACTAMENTE como se describen.

---

## 👥 Definición de Roles
- **Antigravity (Tu IA):** Se encarga de escribir el código (`App.tsx`, `Code.gs`), configurar la lógica de APIs y diseñar la interfaz.
- **Humano (Tú):** Te encargas de crear archivos, copiar/pegar URLs de Google, otorgar permisos y configurar tokens de Telegram.

---

## 🛠️ Fase 1: El Terreno (Cuenta y Carpetas)
1. Inicia sesión en tu cuenta de **Google**.
2. Ve a [Google Drive](https://drive.google.com).
3. Crea una carpeta llamada `SISTEMA_FINANCIERO`.
4. Dentro, crea una nueva **Hoja de Cálculo** llamada `Base de Datos Elite`.

## 📊 Fase 2: El Cerebro (Estructura de la Tabla)
Abre tu Hoja de Cálculo y nombra la primera pestaña como **"BD"**. En la fila 1, escribe estos encabezados EXACTAMENTE:
**ID | Fecha | Año | Q | Mes | Tipo | Cat | Desc | Metodo | Monto | Moneda | Tasa | USD Eq | VES Eq**

## ⚙️ Fase 3: El Motor (Apps Script Backend)
1. En tu Hoja de Cálculo, ve a **Extensiones > Apps Script**.
2. Borra todo lo que aparezca y pega este código:

```javascript
/**
 * BACKEND CORE: ELITE ADMIN SUITE v10.0
 * Este código maneja la base de datos, API y alertas de Telegram.
 */

const SHEET_NAME = "BD"; 
const TELEGRAM_TOKEN = "TU_BOT_TOKEN_AQUI"; 
const TELEGRAM_CHAT_ID = "TU_CHAT_ID_AQUI";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    registrarFila(data);
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME);
  const data = sh.getDataRange().getValues();
  const cleanData = data.map(r => r.map(c => (c instanceof Date) ? c.toISOString() : c));
  return ContentService.createTextOutput(JSON.stringify({success: true, data: cleanData})).setMimeType(ContentService.MimeType.JSON);
}

function registrarFila(v) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.getSheetByName(SHEET_NAME);
  const fObj = new Date(v.fecha || new Date());
  const ano = fObj.getFullYear();
  const mesNombres = ["01-ene", "02-feb", "03-mar", "04-abr", "05-may", "06-jun", "07-jul", "08-ago", "09-sep", "10-oct", "11-nov", "12-dic"];
  const mesTxt = mesNombres[fObj.getMonth()];
  const q = "Q" + (Math.floor(fObj.getMonth() / 3) + 1);
  const id = new Date().getTime();

  let usdEq = 0, vesEq = 0;
  const monto = Number(v.monto);
  const tasa = Number(v.tasa);
  const factor = v.tipo.toLowerCase().includes("ingreso") ? 1 : -1;

  if (v.moneda === "USD") {
    usdEq = monto * factor;
    vesEq = monto * tasa * factor;
  } else {
    vesEq = monto * factor;
    usdEq = (monto / tasa) * factor;
  }

  h.appendRow([id, v.fecha, ano, q, mesTxt, v.tipo, v.cat, v.desc, v.met, monto, v.moneda, tasa, usdEq, vesEq]);
  enviarAlertaTelegram(v, usdEq);
}

function actualizarTasaBCV() {
  try {
    const res = UrlFetchApp.fetch("https://ve.dolarapi.com/v1/dolares/oficial");
    const json = JSON.parse(res.getContentText());
    if (json.promedio) {
      PropertiesService.getScriptProperties().setProperty("TASA_ACTUAL", json.promedio);
    }
  } catch (e) {}
}

function enviarAlertaTelegram(v, usd) {
  if (TELEGRAM_TOKEN === "TU_BOT_TOKEN_AQUI") return;
  const emoji = v.tipo.toLowerCase().includes("ingreso") ? "💰" : "💸";
  const msg = `${emoji} *Nuevo Registro Financiero*\n\n` +
              `*Concepto:* ${v.desc}\n` +
              `*Monto:* ${Math.abs(usd).toFixed(2)} USD\n` +
              `*Fecha:* ${v.fecha}`;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(msg)}&parse_mode=Markdown`;
  UrlFetchApp.fetch(url);
}
```

3. Guarda el proyecto con el nombre "Backend Master".

## 🔗 Fase 4: Conexión API (doGet)
1. En el editor de Apps Script, dale clic al botón azul **"Implementar" (Deploy) > "Nueva implementación"**.
2. Selecciona **"Aplicación Web"**.
3. En "Quién puede acceder", selecciona **"Cualquier persona" (Anyone)**.
4. Copia la URL que te da (termina en `/exec`). **Esta es tu `API_URL`**.

## ⏰ Fase 5: El Reloj (Activadores de Dólar)
1. En la barra lateral izquierda de Apps Script, dale clic al icono de reloj (**Activadores**).
2. "Añadir activador".
3. Función: `actualizarTasaBCV`.
4. Evento: **Según tiempo > Temporizador de horas > Cada 4 horas**.
   *Esto mantiene el precio del dólar siempre al día sin que tú hagas nada.*

## 🤖 Fase 6: Lógica Telegram (Alertas)
Para recibir alertas en tu móvil:
1. Habla con `@BotFather` en Telegram para crear un Bot y obtener el **TOKEN**.
2. Habla con `@userinfobot` para obtener tu **CHAT_ID**.
3. Pega estos datos en tu `Code.gs`.

## 🎨 Fase 7: El Traje (Configuración del Frontend)
1. Asegúrate de tener **Node.js** instalado.
2. Abre la terminal en tu carpeta de proyecto React.
3. Edita `App.tsx` y reemplaza la `API_URL` por la que obtuviste en la **Fase 4**.

## 📱 Fase 8: Mobile UX (Iconos y Botones)
- El botón **"NUEVO INGRESO/EGRESO"** está arriba para que sea lo primero que toques en el móvil.
- El sistema detecta automáticamente si estás en Dark Mode o Light Mode según tu teléfono.

## 🚀 Fase 9: A la Nube (Vercel)
1. Sube tu código a **GitHub**.
2. Conecta GitHub con **Vercel**.
3. Vercel te dará una URL pública instalable en tu iPhone o Android como una WebApp.

## 👨‍🔧 Fase 10: Mantenimiento y Auditoría
- **Auditoría:** En el dashboard, pestaña "Auditoría", puedes corregir cualquier error.
- **Sincronización:** Dale clic al botón circular de flechas para traer los datos más nuevos de Google Sheets.

---
**Elite Admin Suite • Versión 10.0 Gold Edition (2026)**
