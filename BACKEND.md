/**
 * ELITE ADMIN SUITE v11.6 - ULTIMATE PRECISION & AUTO-TRIGGER
 * Mapeo dinámico total, soporte de decimales latinos y auto-configuración de triggers.
 */

// 🔒 CREDENCIALES (Inmunes a borrados)
function guardarMisCredenciales() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty("TELEGRAM_TOKEN", "8047121954:AAHhWY3s_YB9C33Ut2JpinhqGmv_cMPsYg8"); 
  props.setProperty("TELEGRAM_CHAT_ID", "1009537014,7581655183"); // Soporte multi-ID
  props.setProperty("TASA_ACTUAL", "40.5");
  SpreadsheetApp.getUi().alert("✅ Credenciales guardadas con éxito (Multi-ID Activo).");
}

const SHEET_NAME = "Base_Datos_Maestra"; 
const FORM_SHEET_NAME = "ENTRADAS";
const CAMBIOS_SHEET_NAME = "OPERACIONES_CAMBIO";

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🏛️ Elite Suite')
    .addItem('🔐 Guardar Mis Credenciales', 'guardarMisCredenciales')
    .addItem('⚙️ Configurar Sistema (Triggers)', 'setupSystem')
    .addItem('🔄 Sincronizar Todo (Reparar)', 'syncAllResponses')
    .addItem('💱 Actualizar Tasa BCV', 'actualizarTasaBCV')
    .addSeparator()
    .addItem('🕵️ Probar Telegram (Sonia + Asael)', 'probarTelegram')
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
      timestamp: row[0],
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
  console.log("Formulario enviado. Procesando...");
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const named = e.namedValues;
    
    // Mapeo Blindado (Independiente de la posición de las columnas)
    const getV = (keys) => {
      if (!named) return "";
      for (let k of keys) {
        if (named[k] && named[k][0]) return named[k][0];
      }
      return "";
    };

    const entry = {
      timestamp: e.values ? e.values[0] : new Date(), 
      fecha: getV(["Fecha de Transacción", "fecha"]), 
      tipo: getV(["Tipo de Movimiento", "tipo"]), 
      cat: getV(["Categoría", "cat"]), 
      desc: getV(["Descripción / Detalle", "desc"]), 
      met: getV(["Método de Pago", "metodo"]), 
      monto: parseNum(getV(["Monto", "monto"])), 
      moneda: getV(["Moneda de la Transacción", "moneda"]).toUpperCase().includes("USD") ? "USD" : "VES", 
      tasa: parseNum(getV(["Tasa de Cambio (Referencial)", "tasa"]))
    };

    // GENERADOR DE ID BLINDADO: Evita el error #NUM!
    // Usamos el tiempo actual en ms como ID único numérico
    const idValue = Date.now(); 
    entry.id = idValue;

    console.log("Registrando entrada Blindada:", entry.desc, entry.monto, entry.moneda);
    registrarFila(entry);
  } catch (err) {
    console.error("Error en onFormSubmit:", err.toString());
  }
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
  try {
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
    
    let factor = 0;
    if (/ingreso|abono|entrada|inicial|diezmo|ofrenda/i.test(tipoStr)) factor = 1;
    else factor = -1; // Por defecto es egreso si no es ingreso
    
    const absMonto = Math.abs(v.monto);
    const usdEq = v.forced_usd !== undefined ? v.forced_usd : Number((v.moneda === "USD" ? absMonto * factor : (absMonto / tasa) * factor).toFixed(2));
    const vesEq = v.forced_ves !== undefined ? v.forced_ves : Number((v.moneda === "VES" ? absMonto * factor : (absMonto * tasa) * factor).toFixed(2));

    // ID Failsafe: Siempre numérico
    const idValue = v.id || Date.now();

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
    
    if (!silent) enviarAlertaTelegram(v, usdEq, vesEq); // Pasar VES Eq para reportes duales
  } catch (e) {
    console.error("Error en registrarFila:", e.toString());
  }
}

function getCredential(key) { return PropertiesService.getScriptProperties().getProperty(key); }

function doGet(e) {
  try {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sh) return ContentService.createTextOutput("Sheet not found");
    const data = sh.getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify({success: true, data: data.map(r => r.map(c => (c instanceof Date) ? c.toISOString() : c))})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === "cambio") {
      registrarCambio(data);
      return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
    }
    if (data.action === "updateRate") {
      const nuevaTasa = actualizarTasaBCV(true); // Ejecución silenciosa desde web
      return ContentService.createTextOutput(JSON.stringify({success: true, tasa: nuevaTasa})).setMimeType(ContentService.MimeType.JSON);
    }
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
    registrarFila(entry, false); // Alertar en Telegram (No silencioso) por defecto en Dashboard
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function registrarCambio(v) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CAMBIOS_SHEET_NAME) || ss.insertSheet(CAMBIOS_SHEET_NAME);
  if (sh.getLastRow() === 0) {
    const h = ["ID", "Fecha", "Tipo", "Monto Sale", "Moneda Sale", "Monto Entra", "Moneda Entra", "Tasa Mercado", "Desc"];
    sh.getRange(1, 1, 1, h.length).setValues([h]).setBackground("#0f172a").setFontColor("white");
  }
  const row = [v.id, v.fecha, v.tipo_cambio, v.monto_sale, v.moneda_sale, v.monto_entra, v.moneda_entra, v.tasa_mercado, v.desc];
  sh.appendRow(row);

  registrarFila({
    id: v.id + "_M",
    timestamp: v.id,
    fecha: v.fecha,
    tipo: "Permuta",
    cat: "Cambio de Divisa",
    desc: v.desc || `Cambio ${v.monto_sale}${v.moneda_sale} -> ${v.monto_entra}${v.moneda_entra}`,
    met: "Transferencia",
    monto: 0,
    moneda: "USD",
    tasa: v.tasa_mercado,
    forced_usd: v.moneda_sale === "USD" ? -v.monto_sale : v.monto_entra,
    forced_ves: v.moneda_sale === "VES" ? -v.monto_sale : v.monto_entra
  }, false); // Notificar permuta
}

function actualizarTasaBCV(silentMode = false) {
  try {
    const res = UrlFetchApp.fetch("https://ve.dolarapi.com/v1/dolares/oficial");
    const json = JSON.parse(res.getContentText());
    if (json.promedio) {
      const tasaVieja = PropertiesService.getScriptProperties().getProperty("TASA_ACTUAL");
      const nuevaTasa = json.promedio;
      PropertiesService.getScriptProperties().setProperty("TASA_ACTUAL", nuevaTasa);
      
      // Notificar cambio de tasa
      enviarAlertaTelegram({tipo: "Cambio Tasa", desc: `🔄 *Tasa BCV Actualizada*\nDe: ${tasaVieja} ➔ A: ${nuevaTasa} VES`}, 0);
      
      if (!silentMode) SpreadsheetApp.getUi().alert("✅ Tasa actualizada a: " + nuevaTasa);
      return nuevaTasa;
    }
  } catch (e) {
    console.error("Error actualización tasa:", e.toString());
  }
  return null;
}

function enviarAlertaTelegram(v, usd, ves = 0) {
  try {
    const token = getCredential("TELEGRAM_TOKEN");
    const chatids = (getCredential("TELEGRAM_CHAT_ID") || "").split(",");
    if (!token || token.includes("TU_TOKEN") || chatids.length === 0) return;
    
    // Calcular Balances (Total + Categoría)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME);
    let balanceTotal = 0;
    let balancesCat = {}; // { "Categoría": monto }

    if (sh) {
      const data = sh.getRange(2, 7, sh.getLastRow() - 1, 7).getValues(); // Col 7 (Cat) a Col 13 (Total USD)
      data.forEach(row => {
        const cat = String(row[0] || "General").trim();
        const usdVal = parseFloat(row[6]) || 0;
        balanceTotal += usdVal;
        balancesCat[cat] = (balancesCat[cat] || 0) + usdVal;
      });
    }

    let msg = "";
    if (v.tipo === "Cambio Tasa") {
       msg = v.desc;
    } else {
       const icono = String(v.tipo).toLowerCase().includes("ingreso") ? "💰" : "💸";
       const montoStr = v.moneda === "VES" 
          ? `${Math.abs(v.monto).toFixed(2)} VES (*$${Math.abs(usd).toFixed(2)}*)`
          : `$${Math.abs(v.monto).toFixed(2)}`;
       
       msg = `${icono} *${v.tipo} Registrado*\n`;
       msg += `──────────────\n`;
       msg += `📝 *Concepto:* ${v.desc}\n`;
       msg += `📊 *Categoría:* ${v.cat}\n`;
       msg += `💵 *Monto:* ${montoStr}\n`;
       msg += `──────────────\n`;
       msg += `📑 *Balances por Categoría:*\n`;
       
       Object.keys(balancesCat).forEach(c => {
         if (Math.abs(balancesCat[c]) > 0.01) {
           msg += `• ${c}: $${balancesCat[c].toFixed(2)}\n`;
         }
       });

       msg += `──────────────\n`;
       msg += `🏦 *TOTAL DISPONIBLE:* $${balanceTotal.toFixed(2)}`;
    }

    chatids.forEach(id => {
      if (id.trim()) {
        try {
          UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${id.trim()}&text=${encodeURIComponent(msg)}&parse_mode=Markdown`);
        } catch(e) { console.error("Error enviando a ID:", id); }
      }
    });
  } catch (e) {
    console.error("Error envío Telegram:", e.toString());
  }
}

function probarTelegram() {
  const token = getCredential("TELEGRAM_TOKEN");
  const chatids = (getCredential("TELEGRAM_CHAT_ID") || "").split(",");
  if (!token || chatids.length === 0) {
    SpreadsheetApp.getUi().alert("❌ No hay credenciales configuradas.");
    return;
  }

  chatids.forEach(id => {
    if (id.trim()) {
      const msg = `🕵️ *Prueba de Conexión Élite*\nID: ${id.trim()}\nEstado: ✅ Activo y Recibiendo.`;
      try {
        UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${id.trim()}&text=${encodeURIComponent(msg)}&parse_mode=Markdown`);
      } catch(e) { 
        console.error("Error en test para ID:", id); 
      }
    }
  });
  
  SpreadsheetApp.getUi().alert("✅ Mensajes de prueba enviados. Verifica Telegram (Sonia y Asael).");
}

function setupSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Configurar Base de Datos Maestra
  let sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  const headers = ["ID", "Fecha", "Año", "Q", "Mes", "Tipo", "Cat", "Desc", "Metodo", "Monto Orig", "Moneda", "Tasa", "Total USD", "Total VES"];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setBackground("#1e293b").setFontColor("white").setFontWeight("bold");
  sh.setFrozenRows(1);

  // 2. Configurar Registro de Cambios
  let shC = ss.getSheetByName(CAMBIOS_SHEET_NAME) || ss.insertSheet(CAMBIOS_SHEET_NAME);
  const hC = ["ID", "Fecha", "Tipo", "Monto Sale", "Moneda Sale", "Monto Entra", "Moneda Entra", "Tasa Mercado", "Desc"];
  shC.getRange(1, 1, 1, hC.length).setValues([hC]).setBackground("#0f172a").setFontColor("white").setFontWeight("bold");
  shC.setFrozenRows(1);

  // 3. AUTO-CONFIGURACIÓN DE TRIGGERS
  const triggers = ScriptApp.getProjectTriggers();
  let formTriggerExists = false;
  
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onFormSubmit') {
      formTriggerExists = true;
      break;
    }
  }
  
  if (!formTriggerExists) {
    ScriptApp.newTrigger('onFormSubmit')
      .forSpreadsheet(ss)
      .onFormSubmit()
      .create();
    console.log("Trigger onFormSubmit creado con éxito.");
  }

  SpreadsheetApp.getUi().alert("✅ Sistema Configurado. Tablas creadas y Triggers activados automáticamente.");
}
