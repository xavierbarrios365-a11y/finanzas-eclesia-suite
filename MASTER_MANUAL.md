# Manual de Ingeniería: Elite Admin Suite A-Z 🏛️💎
*Guía Definitiva para la Replicación de Sistemas Financieros Inteligentes*

Este manual permite a cualquier persona activar un sistema financiero de élite con automatización de "1-Clic", gestión de reportes y datos bancarios.

---

## 👥 Roles
- **Antigravity (IA):** Escribe el código y diseña la experiencia premium.
- **Humano (Tú):** Sigue los pasos y conecta las piezas.

---

## 🔑 Fase 0: Credenciales Estelares (Telegram)
Antes de empezar, necesitas tus "llaves" de comunicación:

1. **Obtener el TOKEN del Bot:**
   - Busca a `@BotFather` en Telegram.
   - Escribe `/newbot`, dale un nombre y un usuario (debe terminar en `_bot`).
   - Copia el código largo que te da (ej: `78234:ABC...`). **Ese es tu TOKEN**.
2. **Obtener tu CHAT_ID:**
   - Busca a `@IDBot` (o `@userinfobot`) en Telegram.
   - Escribe `/getid` (o `/start`).
   - Copia el número que te da (ej: `12345678`). **Ese es tu CHAT_ID**.

---

## 🛠️ Fase 1: El Cerebro (Automatización de 1-Clic)

1. Ve a [Google Sheets](https://sheets.new) y crea una hoja llamada `Base de Datos Elite`.
2. Ve a **Extensiones > Apps Script**.
3. Borra todo y pega el **CÓDIGO MASTER** (al final de este manual).
4. Reemplaza `TU_BOT_TOKEN_AQUI` y `TU_CHAT_ID_AQUI` por los que obtuviste en la Fase 0.
5. Guarda con el nombre `Backend Master`.
6. En la barra superior, selecciona la función `setupSystem` y dale clic a **"Ejecutar"**.
   - *Acepta los permisos de Google (Configuración Avanzada > Ir a Backend Master > Permitir).*
7. **RESULTADO:** Se crearán la pestaña `BD` con formato profesional y el **Formulario de Registro**.

---

## 🔗 Fase 2: Conexión y Formulario

1. **API URL:** Clic en **"Implementar" (Deploy) > "Nueva implementación"** -> Tipo: "Aplicación Web" -> Quién puede acceder: "Cualquier persona". Copia la URL (será tu `API_URL`).
2. **Formulario:** Ve a tu Google Drive, abre el nuevo archivo "Formulario de Registro Elite". Dale a **"Enviar" (Send)** -> icono de enlace -> Copia el enlace. **Esa es tu `FORM_URL`**.

---

## 📈 Fase 3: Gestión de Reportes y Datos Bancarios
La aplicación ahora incluye herramientas avanzadas de administración:

1. **Datos de Banco:** Pestaña diseñada para almacenar y compartir tus cuentas de pago. Puedes copiar los datos con un clic o imprimir la vista para enviarla como PDF/Imagen.
2. **Reportes Mensuales:** Genera una síntesis profesional de tus finanzas (Ingresos vs Egresos + Top Categorías) usando el botón "Generar Síntesis PDF" (Print-to-PDF).

---

## 🎨 Fase 4: El Traje (El Prompt de Oro - Actualizado)
Usa este prompt para que la IA recree el sistema completo con las nuevas funciones:

> **PROMPT MASTER UI v10.5:**
> "Actúa como un Ingeniero Senior de UI/UX. Crea una SPA en React con estética 'Gold Edition'.
> Requisitos Core:
> 1. Dashboard con KPIs y ComposedChart de Recharts.
> 2. Tablas animadas para Ingresos/Egresos.
> 3. **Módulo de Datos Bancarios**: Tarjetas estilizadas con función de copiado y botón de impresión.
> 4. **Módulo de Reportes**: Síntesis financiera mensual automatizada con visualización de categorías top y botón de exportación PDF.
> 5. **Mobile First**: Diseño adaptativo con sidebar profesional y botones de acción rápidos."

---

## 🤖 Código Master (Copiar y Pegar)

```javascript
/**
 * ELITE ADMIN SUITE v10.0 - CORE ENGINE
 * Automatización total de Base de Datos y Formulario.
 */

const SHEET_NAME = "BD";
const TELEGRAM_TOKEN = "TU_BOT_TOKEN_AQUI"; 
const TELEGRAM_CHAT_ID = "TU_CHAT_ID_AQUI";

function setupSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  
  const headers = ["ID", "Fecha", "Año", "Q", "Mes", "Tipo", "Cat", "Desc", "Metodo", "Monto", "Moneda", "Tasa", "USD Eq", "VES Eq"];
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground("#1e293b").setFontColor("white").setFontWeight("bold").setHorizontalAlignment("center");
  sh.setFrozenRows(1);

  const form = FormApp.create("Formulario de Registro Elite");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  form.addDateItem().setTitle("Fecha").setRequired(true);
  form.addMultipleChoiceItem().setTitle("Tipo").setChoiceValues(["Ingreso", "Egreso"]).setRequired(true);
  form.addListItem().setTitle("Categoría").setChoiceValues(["General", "Diezmos", "Ofrendas", "Inversión", "Personal", "Gastos Fijos", "Marketing", "Mantenimiento"]).setRequired(true);
  form.addTextItem().setTitle("Descripción").setRequired(true);
  form.addListItem().setTitle("Método").setChoiceValues(["Efectivo USD", "Efectivo VES", "Banco VES", "Zelle", "Binance/Cripto"]).setRequired(true);
  form.addTextItem().setTitle("Monto").setRequired(true);
  form.addMultipleChoiceItem().setTitle("Moneda").setChoiceValues(["USD", "VES"]).setRequired(true);
  form.addTextItem().setTitle("Tasa (Opcional)").setHelpText("Si dejas vacío, usa la del día.");

  Logger.log("✅ SISTEMA CONFIGURADO");
  Logger.log("🔗 URL FORMULARIO: " + form.getPublishedUrl());
}

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
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sh.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify({success: true, data: data.map(r => r.map(c => (c instanceof Date) ? c.toISOString() : c))})).setMimeType(ContentService.MimeType.JSON);
}

function onFormSubmit(e) {
  const res = e.values; 
  const v = {
    fecha: res[1], tipo: res[2], cat: res[3], desc: res[4], met: res[5],
    monto: Number(res[6]), moneda: res[7], tasa: Number(res[8])
  };
  registrarFila(v);
}

function registrarFila(v) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const fObj = new Date(v.fecha + "T12:00:00");
  const mesNombres = ["01-ene", "02-feb", "03-mar", "04-abr", "05-may", "06-jun", "07-jul", "08-ago", "09-sep", "10-oct", "11-nov", "12-dic"];
  const tasa = v.tasa || Number(PropertiesService.getScriptProperties().getProperty("TASA_ACTUAL")) || 36.5;
  const factor = v.tipo.toLowerCase().includes("ingreso") ? 1 : -1;
  const usdEq = v.moneda === "USD" ? v.monto * factor : (v.monto / tasa) * factor;
  const vesEq = v.moneda === "VES" ? v.monto * factor : (v.monto * tasa) * factor;

  sh.appendRow([new Date().getTime(), v.fecha, fObj.getFullYear(), "Q" + (Math.floor(fObj.getMonth() / 3) + 1), mesNombres[fObj.getMonth()], v.tipo, v.cat, v.desc, v.met, v.monto, v.moneda, tasa, usdEq, vesEq]);
  enviarAlertaTelegram(v, usdEq);
}

function actualizarTasaBCV() {
  try {
    const res = UrlFetchApp.fetch("https://ve.dolarapi.com/v1/dolares/oficial");
    const json = JSON.parse(res.getContentText());
    if (json.promedio) PropertiesService.getScriptProperties().setProperty("TASA_ACTUAL", json.promedio);
  } catch (e) {}
}

function enviarAlertaTelegram(v, usd) {
  if (TELEGRAM_TOKEN === "TU_BOT_TOKEN_AQUI") return;
  const msg = `${v.tipo.includes("Ingreso") ? "💰" : "💸"} *Nuevo Registro*\n*${v.desc}*\n*Monto:* ${Math.abs(usd).toFixed(2)} USD`;
  UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(msg)}&parse_mode=Markdown`);
}
```

---
**Elite Admin Suite • Versión 10.5 Gold Edition (2026)**
