# Manual Maestro: Elite Admin Suite v9.8 🏛️💎

Este manual detalla paso a paso (A-Z) cómo construir esta aplicación de gestión financiera generalista (Gimnasios, Negocios, Finanzas Personales) 100% funcional y automatizada.

## 📋 Fase 1: El Cerebro (Google Sheets & Apps Script)

### 1. La Base de Datos
- Crea una hoja de cálculo en Google Sheets.
- Crea un Formulario de Google para registrar: `Tipo` (Ingreso/Egreso), `Categoría`, `Concepto`, `Método`, `Monto Orig`, `Moneda`, `Tasa`.
- Vincula el formulario a la hoja. Las respuestas aparecerán en una pestaña (usualmente `Form Responses 1`).

### 2. El Motor de Automatización (Script Único)
Ve a **Extensiones > Apps Script** en tu Google Sheets, borra todo y pega el siguiente código maestro. Este script automatiza la sincronización ISO, el Bot de Telegram, los Reportes de Cierre y la Edición desde el Dashboard.

> [!IMPORTANT]
> Reemplaza los tokens de Telegram si deseas usar notificaciones automáticas.

```javascript
/**
 * 🏛️ SISTEMA ADMINISTRATIVO ELITE - MASTER v9.8
 * Integrado para Dashboard Multi-Propósito (Gimnasios, Negocios, Finanzas).
 */

var TELEGRAM_TOKEN = "---TU_TOKEN_AQUÍ---";
var TELEGRAM_CHAT_ID = "---TU_CHAT_ID_AQUÍ---";

// --- ACTIVADORES ---
function onOpen() {
    SpreadsheetApp.getUi().createMenu('🏛️ Sistema Elite')
        .addItem('🔄 Sincronizar Todo', 'SINCRONIZAR_TODO')
        .addItem('💵 Actualizar Tasa BCV', 'actualizarTasaBCV')
        .addToUi();
}

function procesarFormulario(e) {
    if (e && e.values) {
        var info = registrarFila(e.values);
        actualizarPanel();
        var icono = info.tipo.includes("Ingreso") ? "🟢" : "🔴";
        enviarTelegram(icono + " <b>NUEVO:</b> " + info.desc);
    }
}

// --- CEREBRO: SINCRONIZACIÓN AUTOMÁTICA ---
function SINCRONIZAR_TODO() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hojaEntradas = ss.getSheetByName("Form Responses 1") || ss.getSheetByName("ENTRADAS");
    var hojaBase = ss.getSheetByName("Base_Datos_Maestra");
    if (!hojaBase) hojaBase = ss.insertSheet("Base_Datos_Maestra");
    hojaBase.clearContents();
    hojaBase.appendRow(["ID", "Fecha", "Año", "Q", "Mes", "Tipo", "Cat", "Desc", "Metodo", "Monto Orig", "Moneda", "Tasa", "Total USD", "Total VES"]);
    
    var datos = hojaEntradas.getDataRange().getValues();
    for (var i = 1; i < datos.length; i++) { 
        if (datos[i][0] !== "") registrarFila(datos[i]); 
    }
}

function registrarFila(valores) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var h = ss.getSheetByName("Base_Datos_Maestra");
    var fechaManual = valores[2];
    var fechaFinal = (fechaManual && fechaManual !== "") ? fechaManual : valores[0];
    var t = valores[3], c = valores[4], d = valores[5], moneda = valores[6];
    var mont = normalizar(valores[7]), tasa = normalizar(valores[8]);
    if (!tasa || tasa === 0) tasa = 36.50; // Tasa por defecto

    var usd = 0, ves = 0;
    if (String(moneda).includes("USD")) { usd = mont; ves = mont * tasa; }
    else { usd = mont / tasa; ves = mont; }
    if (String(t).includes("Egreso")) { usd *= -1; ves *= -1; }

    var fObj = new Date(fechaFinal);
    var mesNombres = ["01-ene", "02-feb", "03-mar", "04-abr", "05-may", "06-jun", "07-jul", "08-ago", "09-sep", "10-oct", "11-nov", "12-dic"];
    var mesTxt = mesNombres[fObj.getMonth()];

    h.appendRow([new Date().getTime(), fechaFinal, fObj.getFullYear(), "Q", mesTxt, t, c, d, valores[9], mont, moneda, tasa, usd, ves]);
    return { tipo: t, desc: d };
}

// --- API PARA EL DASHBOARD (GET / POST) ---
function doGet(e) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName("Base_Datos_Maestra");
    var values = hoja.getDataRange().getValues();
    var cleanData = values.map(function(r) {
        return r.map(function(c) { if (c instanceof Date) return c.toISOString(); return c; });
    });
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: cleanData })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    var request = JSON.parse(e.postData.contents);
    if (request.action === 'updateRow') {
        var res = updateRowData(request.data);
        return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }
}

function updateRowData(rowObj) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var h = ss.getSheetByName("Base_Datos_Maestra");
    var data = h.getDataRange().getValues();
    var idToFind = String(rowObj.id);
    for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === idToFind) {
            h.getRange(i + 1, 7).setValue(rowObj.cat);
            h.getRange(i + 1, 8).setValue(rowObj.desc);
            return { success: true };
        }
    }
    return { success: false };
}

function normalizar(v) { 
    var t = String(v); 
    if (t.includes('.') && t.includes(',')) t = t.replace(/\./g, '').replace(',', '.'); 
    else if (t.includes(',')) t = t.replace(',', '.'); 
    return parseFloat(t) || 0; 
}

function enviarTelegram(t) { try { UrlFetchApp.fetch("https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage", { "method": "post", "contentType": "application/json", "payload": JSON.stringify({ "chat_id": TELEGRAM_CHAT_ID, "text": t, "parse_mode": "HTML" }) }); } catch (e) { } }
```

---

## 💻 Fase 2: El Corazón Frontend (A-Z)

### 3. Implementación del Dashboard
El Dashboard está construido con **React + Recharts** para una visualización fluida.
- **Normalización**: El frontend agrupa los datos automáticamente por día o por mes según el filtro activo.
- **Smart Balance**: Los saldos siempre arrastran el acumulado histórico, mientras que el flujo neto es relativo al mes.

---

## 🚀 Fase 3: Despliegue & Hosting

### 4. Publicación Web
1. Sube tu código a **GitHub**.
2. Conéctalo a **Vercel**.
3. **Punto Crítico**: Al publicar el script de Google como "Web App", asegúrate de dar acceso a "Anyone" (Cualquiera) para que el Dashboard pueda leer los datos.

---
**Elite Management Suite • Plantilla Maestra v9.8**
