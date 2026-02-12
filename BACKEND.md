/**
 * ELITE ADMIN SUITE v11.5 - ULTIMATE PRECISION CORE
 * Mapeo dinámico total (Sincronización + Formulario) y soporte de decimales latinos.
 */

// 🔒 CREDENCIALES (Inmunes a borrados)
function guardarMisCredenciales() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty("TELEGRAM_TOKEN", "8047121954:AAHhWY3s_YB9C33Ut2JpinhqGmv_cMPsYg8"); 
  props.setProperty("TELEGRAM_CHAT_ID", "1009537014"); 
  props.setProperty("TASA_ACTUAL", "40.5");
  SpreadsheetApp.getUi().alert("✅ Credenciales guardadas con éxito.");
}

const SHEET_NAME = "Base_Datos_Maestra"; 
const FORM_SHEET_NAME = "ENTRADAS";

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🏛️ Elite Suite')
    .addItem('🔐 Guardar Mis Credenciales', 'guardarMisCredenciales')
    .addItem('⚙️ Configurar Sistema', 'setupSystem')
    .addItem('🔄 Sincronizar Todo (Reparar)', 'syncAllResponses')
    .addItem('💱 Actualizar Tasa BCV', 'actualizarTasaBCV')
    .addToUi();
}

/** 
 * HELPER: Detector de columnas inteligente (Normalizado)
 */
function getMapping(headersRow) {
  const normalize = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const headers = headersRow.map(normalize);
  const find = (keys) => {
    const kNormalized = keys.map(normalize);
    return headers.findIndex(h => kNormalized.some(kn => h.includes(kn)));
  };

  return {
    t: 0, 
    f: find(["fecha"]),
    tp: find(["tipo"]),
    c: find(["cat"]),
    d: find(["desc"]),
    m: find(["metodo"]), 
    mt: find(["monto"]),
    mn: find(["moneda"]),
    ts: find(["tasa"])
  };
}

/** 
 * SINCRONIZACIÓN MANUAL (RECONSTRUCCIÓN TOTAL)
 */
function syncAllResponses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let shBD = ss.getSheetByName(SHEET_NAME);
  let shForm = ss.getSheetByName(FORM_SHEET_NAME) || ss.getSheets()[0];

  if (!shBD || !shForm) {
    SpreadsheetApp.getUi().alert("❌ Error: No se encuentran las tablas.");
    return;
  }
  
  const formValues = shForm.getDataRange().getValues();
  if (formValues.length < 2) return;

  const idx = getMapping(formValues[0]);

  if (idx.f === -1 || idx.mt === -1) {
    SpreadsheetApp.getUi().alert("❌ Error de Mapeo: Columnas críticas no detectadas.");
    return;
  }

  const lastRow = shBD.getLastRow();
  if (lastRow > 1) {
    shBD.getRange(2, 1, shBD.getMaxRows() - 1, shBD.getMaxColumns()).clearContent();
  }

  let count = 0;
  for (let i = 1; i < formValues.length; i++) {
    const row = formValues[i];
    const data = {
      timestamp: row[idx.t],
      fecha: row[idx.f],
      tipo: row[idx.tp],
      cat: idx.c !== -1 ? row[idx.c] : "General",
      desc: idx.d !== -1 ? row[idx.d] : "",
      met: idx.m !== -1 ? row[idx.m] : "Efectivo",
      monto: parseNum(row[idx.mt]),
      moneda: idx.mn !== -1 ? (String(row[idx.mn]).toUpperCase().includes("USD") ? "USD" : "VES") : "USD",
      tasa: idx.ts !== -1 ? parseNum(row[idx.ts]) : 0
    };
    registrarFila(data, true); 
    count++;
  }
  SpreadsheetApp.getUi().alert("✅ EXITO: " + count + " registros reparados.");
}

/** 
 * EVENTO AUTOMÁTICO: Captura nuevas entradas del formulario
 */
function onFormSubmit(e) {
  if (!e) return;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shForm = ss.getSheetByName(FORM_SHEET_NAME) || ss.getSheets()[0];
  const headers = shForm.getDataRange().getValues()[0];
  const idx = getMapping(headers);

  // e.values viene en orden de la hoja
  const res = e.values; 
  if (!res) return;

  registrarFila({
    timestamp: res[0], 
    fecha: res[idx.f], 
    tipo: res[idx.tp], 
    cat: idx.c !== -1 ? res[idx.c] : "Gral.", 
    desc: idx.d !== -1 ? res[idx.d] : "", 
    met: idx.m !== -1 ? res[idx.m] : "Efectivo", 
    monto: parseNum(res[idx.mt]), 
    moneda: idx.mn !== -1 ? (String(res[idx.mn]).toUpperCase().includes("USD") ? "USD" : "VES") : "USD", 
    tasa: idx.ts !== -1 ? parseNum(res[idx.ts]) : 0
  });
}

/** Procesa números con formato latino (1.234,56) o internacional (1,234.56) */
function parseNum(v) {
  if (typeof v === 'number') return v;
  let s = String(v || "0").replace(/[^\d,.-]/g, "").trim();
  if (s.includes(",") && s.includes(".")) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, ""); 
  } else if (s.includes(",")) s = s.replace(",", ".");
  return parseFloat(s) || 0;
}

function registrarFila(v, silent = false) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  
  const tipoStr = String(v.tipo || "").toLowerCase();
  let fObj;
  
  if (v.fecha instanceof Date) {
    fObj = v.fecha;
    fObj.setHours(12, 0, 0, 0);
  } else if (typeof v.fecha === 'string' && v.fecha.includes('/')) {
    let parts = v.fecha.split('/');
    fObj = parts.length === 3 ? new Date(parts[2], parts[1] - 1, parts[0], 12, 0, 0) : new Date(v.fecha);
  } else {
    fObj = new Date(v.fecha || new Date());
    fObj.setHours(12, 0, 0, 0);
  }

  const mesNombres = ["01-ene", "02-feb", "03-mar", "04-abr", "05-may", "06-jun", "07-jul", "08-ago", "09-sep", "10-oct", "11-nov", "12-dic"];
  const tasa = v.tasa || Number(PropertiesService.getScriptProperties().getProperty("TASA_ACTUAL")) || 40.5;
  const isIngreso = (tipoStr.includes("ingreso") || tipoStr.includes("abono") || tipoStr.includes("entrada") || tipoStr.includes("inicial") || tipoStr.includes("diezmo") || tipoStr.includes("ofrenda"));
  const catStr = String(v.cat || "").toLowerCase();
  const isCatIngreso = (catStr.includes("diezmo") || catStr.includes("ofrenda") || catStr.includes("ingreso"));
  const factor = (isIngreso || isCatIngreso) ? 1 : -1;
  
  const usdEq = Number((v.moneda === "USD" ? v.monto * factor : (v.monto / tasa) * factor).toFixed(2));
  const vesEq = Number((v.moneda === "VES" ? v.monto * factor : (v.monto * tasa) * factor).toFixed(2));

  const idValue = (v.id) ? Number(v.id) : ((v.timestamp instanceof Date) ? v.timestamp.getTime() : (v.timestamp || new Date().getTime()));

  // LÓGICA DE ACTUALIZACIÓN: Buscar si el ID ya existe
  const data = sh.getDataRange().getValues();
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == idValue) {
      rowIdx = i + 1;
      break;
    }
  }

  const rowData = [
    idValue, 
    Utilities.formatDate(fObj, "GMT-4", "dd/MM/yyyy"), 
    fObj.getFullYear(), 
    "Q" + (Math.floor(fObj.getMonth() / 3) + 1), 
    mesNombres[fObj.getMonth()], 
    v.tipo, 
    v.cat, 
    v.desc, 
    v.met, 
    v.monto, 
    v.moneda, 
    tasa, 
    usdEq, 
    vesEq
  ];

  if (rowIdx !== -1) {
    sh.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sh.appendRow(rowData);
  }
  
  if (!silent) enviarAlertaTelegram(v, usdEq);
}

function getCredential(key) { return PropertiesService.getScriptProperties().getProperty(key); }

function doGet(e) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sh) return ContentService.createTextOutput("Sheet not found");
  const data = sh.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify({success: true, data: data.map(r => r.map(c => (c instanceof Date) ? c.toISOString() : c))})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    // Mapeo de campos del Frontend a Backend
    const entry = {
      id: data.id,
      timestamp: data.id,
      fecha: data.fecha || new Date(),
      tipo: data.tipo,
      cat: data.cat,
      desc: data.desc,
      met: data.met,
      monto: parseNum(data.m_orig || data.monto || 0),
      moneda: data.mon_orig || data.moneda || "USD",
      tasa: parseNum(data.t_reg || data.tasa || 0)
    };
    registrarFila(entry, true); // Silent para no duplicar alertas de Telegram
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function actualizarTasaBCV() {
  try {
    const res = UrlFetchApp.fetch("https://ve.dolarapi.com/v1/dolares/oficial");
    const json = JSON.parse(res.getContentText());
    if (json.promedio) {
      PropertiesService.getScriptProperties().setProperty("TASA_ACTUAL", json.promedio);
      SpreadsheetApp.getUi().alert("✅ Tasa actualizada a: " + json.promedio);
    }
  } catch (e) {}
}

function enviarAlertaTelegram(v, usd) {
  const token = getCredential("TELEGRAM_TOKEN");
  const chatid = getCredential("TELEGRAM_CHAT_ID");
  if (!token || token.includes("TU_TOKEN")) return;
  const msg = `${String(v.tipo).toLowerCase().includes("ingreso") ? "💰" : "💸"} *Nuevo Registro*\n*${v.desc}*\nMonto: ${Math.abs(usd).toFixed(2)} USD`;
  UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatid}&text=${encodeURIComponent(msg)}&parse_mode=Markdown`);
}

function setupSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  const headers = ["ID", "Fecha", "Año", "Q", "Mes", "Tipo", "Cat", "Desc", "Metodo", "Monto Orig", "Moneda", "Tasa", "Total USD", "Total VES"];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setBackground("#1e293b").setFontColor("white").setFontWeight("bold");
  sh.setFrozenRows(1);
  SpreadsheetApp.getUi().alert("✅ Sistema Configurado con éxito.");
}
