# Manual Técnico A-Z: Suite de Gestión Inteligente 🏛️💎

Este documento es una auditoría técnica y guía de construcción paso a paso para replicar la arquitectura de la aplicación **Iglesia JES**.

---

## � Fase 1: Arquitectura de Datos (Google Sheets)

La base de datos debe ser una hoja de Google Sheets con una pestaña llamada `Base_Datos_Maestra`. A continuación, el detalle técnico de cada columna:

| Columna | Nombre Técnico | Tipo de Dato | Propósito y Lógica |
| :--- | :--- | :--- | :--- |
| **A** | `ID` | `TIMESTAMP` | Identificador único autogenerado por el script (`new Date().getTime()`). |
| **B** | `Fecha` | `DATE` | Fecha del movimiento (YYYY-MM-DD). |
| **C** | `Año` | `NUMBER` | Año extraído de la fecha para filtros rápidos. |
| **D** | `Q` | `STRING` | Trimestre (Q1, Q2, Q3, Q4) para reportes financieros. |
| **E** | `Mes` | `STRING` | ID del mes formateado como `01-ene`, `02-feb`, etc. (Crucial para el ordenamiento en el Dashboard). |
| **F** | `Tipo` | `ENUM` | Valores permitidos: `Ingreso` o `Egreso`. Determina si suma o resta en el saldo. |
| **G** | `Categoría` | `STRING` | Clasificación del rubro (ej: Diezmos, Ofrendas, Sueldos, Mantenimiento). |
| **H** | `Concepto` | `STRING` | Descripción detallada del movimiento. |
| **I** | `Método` | `ENUM` | Origen de los fondos: `Caja VES`, `Banco VES`, `Divisa (USD)`. |
| **J** | `Monto Orig` | `NUMBER` | El monto nominal tal cual se recibió o pagó. |
| **K** | `Moneda` | `ENUM` | `VES` o `USD`. |
| **L** | `Tasa` | `NUMBER` | Tasa de cambio aplicada en el momento del registro. |
| **M** | `Total USD` | `NUMBER` | Monto normalizado a USD (Monto / Tasa). Los egresos deben ser negativos. |
| **N** | `Total VES` | `NUMBER` | Monto normalizado a Bolívares (Monto * Tasa). Los egresos deben ser negativos. |

---

## ⚙️ Fase 2: El Motor de Automatización (Apps Script)

Este código es el "Cerebro" que vive en Google Sheets. Copia y pega esto en **Extensiones > Apps Script**:

```javascript
/**
 * 🏛️ BACKEND MAESTRO v8.0 - ELITE SUITE
 */

// --- 1. CONFIGURACIÓN ---
var TELEGRAM_TOKEN = "---TU_TOKEN---";
var TELEGRAM_CHAT_ID = "---TU_CHAT_ID---";

// --- 2. ACTIVADORES AUTOMÁTICOS ---
function onOpen() {
  SpreadsheetApp.getUi().createMenu('🏛️ Administración')
    .addItem('🔄 Sincronizar ISO', 'SINCRONIZAR_TODO')
    .addItem('💵 Actualizar BCV', 'actualizarTasaBCV')
    .addToUi();
}

// --- 3. LÓGICA DE REGISTRO INTELIGENTE ---
function registrarFila(valores) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName("Base_Datos_Maestra") || ss.insertSheet("Base_Datos_Maestra");
  
  var fechaFinal = valores[2] || valores[0]; // Fecha manual o del sistema
  var t = valores[3], c = valores[4], d = valores[5], moneda = valores[6];
  var mont = parseFloat(String(valores[7]).replace(',','.')) || 0;
  var tasa = parseFloat(String(valores[8]).replace(',','.')) || 36.5;

  var usd = 0, ves = 0;
  if (String(moneda).includes("USD")) { usd = mont; ves = mont * tasa; }
  else { usd = mont / tasa; ves = mont; }
  
  if (String(t).includes("Egreso")) { usd *= -1; ves *= -1; }

  var fObj = new Date(fechaFinal);
  var mesNombres = ["01-ene", "02-feb", "03-mar", "04-abr", "05-may", "06-jun", "07-jul", "08-ago", "09-sep", "10-oct", "11-nov", "12-dic"];
  var mesTxt = mesNombres[fObj.getMonth()];

  h.appendRow([new Date().getTime(), fechaFinal, fObj.getFullYear(), "Q", mesTxt, t, c, d, valores[9], mont, moneda, tasa, usd, ves]);
  return { success: true };
}

// --- 4. API PARA EL FRONTEND (REACT) ---
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName("Base_Datos_Maestra");
  var values = h.getDataRange().getValues();
  var cleanData = values.map(row => row.map(cell => (cell instanceof Date) ? cell.toISOString() : cell));
  return ContentService.createTextOutput(JSON.stringify({ success: true, data: cleanData })).setMimeType(ContentService.MimeType.JSON);
}
```

---

## 🧪 Fase 3: Auditoría de Lógica Frontend (App.tsx)

### 1. El "Smart Running Balance"
El Dashboard no solo filtra, sino que **calcula el historial**.
- **Lógica**: Si seleccionas `Feb`, el script recorre todos los registros de `Ene` y `Feb`.
- **Por qué?**: Porque el dinero en el banco no desaparece al cambiar de mes; se acumula.

### 2. Normalización de Meses (The Fix)
El frontend utiliza una función `normalizeMonth` que asegura que `01-ene` sea siempre diferente a `january` o `01`, permitiendo que la App lea cualquier base de datos.

### 3. Responsive Elite
- **Mobile**: Los botones de acción se mueven a la cabecera (Header) para fácil acceso con el pulgar.
- **Desktop**: Panel lateral expandido para visión periférica de la organización.

---

## 🚀 Fase 4: Despliegue (Checkout)
1. **Git**: `git commit -m "v9.9 Final Gold"`
2. **Vercel**: Conectar y desplegar.
3. **Google API**: Publicar Script como "Web App" para "Anyone".

---
**Documento Auditado por Antigravity (2026)**
