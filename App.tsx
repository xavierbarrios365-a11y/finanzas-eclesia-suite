
import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend, ComposedChart, Line
} from 'recharts';
import {
  Wallet, RefreshCw, Calendar, Database,
  PieChart as PieIcon, CreditCard, Banknote,
  TrendingDown as DevaluationIcon, Search, Info, Coins, Bug, Globe,
  ArrowLeft, ArrowRight, LineChart, PlusCircle, Filter,
  Edit3, ExternalLink, CheckCircle2, AlertCircle, Layers, TrendingUp, ShieldCheck,
  LayoutDashboard, ArrowUpCircle, ArrowDownCircle, BadgeCheck, Sun, Moon, X, Target, Landmark,
  Share2, FileText, Download, Copy, Check, Printer, FileDown,
  BookOpen, Zap, DollarSign, PiggyBank, ChevronUp, ChevronDown
} from 'lucide-react';

// --- ELITE ADMIN SUITE v11.5 - ULTIMATE PRECISION CORE ---
const API_URL = 'https://script.google.com/macros/s/AKfycbxv-o6l6-SZeeoRfQyN8wHMcm4aoHlJT6vJ42xXU5L2--dcVN8-IBCh5naUSDt8_98/exec';
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc4F3QHE9zfASEjS0eS5x5X0PjvAGm_G33AEC2AJR5yy9FQoQ/viewform';
const LOGO_URL = 'https://storage.googleapis.com/gpt-engineer-file-uploads/JgA2Pk99Ycb89gHZAYwVI5IDcpK2/uploads/1760879140672-Logo Turen.png';

const BRAND = {
  primary: '#2E6061', // Deep Teal JES
  accent: '#F59E0B',  // Amber JES
  warm: '#F8F7F2'     // Bone Warm
};

const COLORS = [BRAND.primary, '#10b981', BRAND.accent, '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const BANK_CONFIG = {
  bank: "Mercantil",
  phone: "04126856037",
  id: "9562664",
  code: "0105",
  note: "Envía capture al número telefónico"
};

const PARSE_NUM = (v: any) => {
  if (typeof v === 'number') return v;
  let s = String(v || "0").replace(/[^\d,.-]/g, "").trim();
  if (s.includes(",") && s.includes(".")) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (s.includes(",")) s = s.replace(",", ".");
  return parseFloat(s) || 0;
};

const fmt = (v: any) => {
  const n = typeof v === 'number' ? v : parseFloat(v) || 0;
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const MONTH_MAP: any = {
  "01": "01-ene", "02": "02-feb", "03": "03-mar", "04": "04-abr",
  "05": "05-may", "06": "06-jun", "07": "07-jul", "08": "08-ago",
  "09": "09-sep", "10": "10-oct", "11": "11-nov", "12": "12-dic"
};

const ALL_MONTHS = [
  { id: "ANUAL", name: "Anual" },
  { id: "01-ene", name: "Ene" }, { id: "02-feb", name: "Feb" },
  { id: "03-mar", name: "Mar" }, { id: "04-abr", name: "Abr" },
  { id: "05-may", name: "May" }, { id: "06-jun", name: "Jun" },
  { id: "07-jul", name: "Jul" }, { id: "08-ago", name: "Ago" },
  { id: "09-sep", name: "Sep" }, { id: "10-oct", name: "Oct" },
  { id: "11-nov", name: "Nov" }, { id: "12-dic", name: "Dic" }
];

const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [tasa, setTasa] = useState<number>(36.50);
  const [filtroActivo, setFiltroActivo] = useState<string>("ANUAL");
  const [activeTab, setActiveTab] = useState<'dash' | 'income' | 'expense' | 'audit' | 'bank' | 'reports'>('dash');
  const [isDark, setIsDark] = useState(false);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [searchCat, setSearchCat] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TODAS");
  const [showExchange, setShowExchange] = useState(false);

  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reportPage, setReportPage] = useState(1);
  const REPORT_TABLE_SIZE = 10;
  const [preparedBySig, setPreparedBySig] = useState<string | null>(null);
  const [approvedBySig, setApprovedBySig] = useState<string | null>(null);

  // --- RBAC Authentication ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'supervisor' | 'admin' | 'view'>('view');
  const [userName, setUserName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedUser, setSelectedUser] = useState<'supervisor' | 'admin' | 'vista'>('supervisor');

  const DEFAULT_USERS = [
    { user: 'supervisor', pass: '20.Gym..20', role: 'supervisor' as const, name: 'Supervisor General' },
    { user: 'admin', pass: '9562664', role: 'admin' as const, name: 'Administrador' },
    { user: 'vista', pass: 'vista2026', role: 'view' as const, name: 'Usuario Vista' },
  ];
  const canEdit = userRole === 'supervisor';
  const isAdmin = userRole === 'supervisor' || userRole === 'admin';
  const isVista = userRole === 'view';

  // Persistence & Biometrics
  useEffect(() => {
    const saved = localStorage.getItem('jes_session');
    if (saved) {
      try {
        const { role, name } = JSON.parse(saved);
        setUserRole(role);
        setUserName(name);
        setIsAuthenticated(true);
      } catch (e) { localStorage.removeItem('jes_session'); }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jes_session');
    setIsAuthenticated(false);
    setActiveTab('dash');
  };

  const PAGE_SIZE = 12;

  // El usuario solicitó Modo Claro por defecto siempre
  useEffect(() => {
    setIsDark(false);
  }, []);

  const normalizeMonth = (val: any, fecha?: string) => {
    let s = String(val || "").toLowerCase().trim();

    // Fallback: If month label is empty, extract from date
    if (!s && fecha) {
      const d = fecha.split(/[-/]/);
      if (d.length >= 2) {
        // Handle YYYY-MM-DD or DD/MM/YYYY
        const mIdx = d[0].length === 4 ? parseInt(d[1]) : parseInt(d[1]);
        if (mIdx >= 1 && mIdx <= 12) return MONTH_MAP[mIdx.toString().padStart(2, '0')];
      }
    }

    if (!s || s === "unknown") return "unknown";

    // Case 1: ISO 2026-02-10
    const isoMatch = s.match(/^(\d{4})-(\d{2})-\d{2}/);
    if (isoMatch) return MONTH_MAP[isoMatch[2]] || s;

    // Case 2: DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dmyMatch) return MONTH_MAP[dmyMatch[2].padStart(2, '0')] || s;

    // Case 3: Raw number (e.g. "02" or "2")
    if (/^\d{1,2}$/.test(s)) {
      const idx = s.padStart(2, '0');
      if (MONTH_MAP[idx]) return MONTH_MAP[idx];
    }

    // Case 4: Just keywords
    const m = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    for (let i = 0; i < m.length; i++) if (s.includes(m[i])) return `${(i + 1).toString().padStart(2, '0')}-${m[i]}`;

    return s;
  };

  const fetchData = async (quiet = false) => {
    if (syncing) return; // Protección contra solapamiento
    if (!quiet) setLoading(true);
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}?action=getData&t=${Date.now()}`); // CACHE BUSTING
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // Unified Precision Parser v5.0
        const pNum = (v: any) => {
          if (typeof v === 'number') return v;
          let s = String(v || "0").replace(/[^\d,.-]/g, "").trim();
          if (s.includes(",") && s.includes(".")) {
            if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
            else s = s.replace(/,/g, "");
          } else if (s.includes(",")) s = s.replace(",", ".");
          return parseFloat(s) || 0;
        };

        let hIdx = json.data.findIndex((r: any[]) => r.some(c => String(c || "").toLowerCase().includes("id")));
        if (hIdx === -1) hIdx = 0;
        const hdr = json.data[hIdx].map((c: any) => String(c || "").toLowerCase().trim());

        // Detector de columnas ultra-preciso
        const f = (...keywords: string[]) => {
          // Prioridad 1: Coincidencia exacta
          let idx = hdr.findIndex(h => keywords.some(k => h === k.toLowerCase()));
          if (idx !== -1) return idx;
          // Prioridad 2: Contiene la palabra
          return hdr.findIndex(h => keywords.some(k => h.includes(k.toLowerCase())));
        };

        const col = {
          id: f("id"),
          mes: f("mes"),
          tipo: f("tipo"),
          cat: f("cat", "categoría"),
          desc: f("desc", "concepto", "descripción"),
          met: f("metodo", "met"),
          m: f("monto orig", "monto", "mnt"),
          mon: f("moneda", "cur"),
          t: f("tasa"),
          usd: f("total usd", "usd"),
          ves: f("total ves", "ves"),
          fecha: f("fecha")
        };

        const mapped = json.data.slice(hIdx + 1)
          .filter((r: any[]) => {
            const id = String(r[col.id] || "").trim();
            const monto = pNum(r[col.m]);
            return id.length > 0 && monto !== 0;
          })
          .map((r: any[]) => {
            const fRaw = String(r[col.fecha] || "").split('T')[0];
            const mRaw = String(r[col.mon] || "").toUpperCase();
            const isUSD = mRaw.includes("USD") || mRaw.includes("$") || mRaw.includes("DIVISA") || mRaw.includes("DOLAR");

            // Precision mapping: use unified parser for absolute values
            const m_orig = Math.abs(pNum(r[col.m]));
            const t_reg = pNum(r[col.t]) || tasa;
            let v_usd = Math.abs(pNum(r[col.usd]));
            let v_ves = Math.abs(pNum(r[col.ves]));

            if (isUSD) {
              v_usd = v_usd || m_orig;
              v_ves = 0;
            } else {
              v_ves = v_ves || m_orig;
              v_usd = v_usd || (v_ves / (t_reg > 1 ? t_reg : tasa));
            }

            return {
              id: String(r[col.id] || ""),
              mes: normalizeMonth(r[col.mes], fRaw),
              tipo: String(r[col.tipo] || "").toLowerCase(),
              cat: String(r[col.cat] || "General"),
              desc: String(r[col.desc] || ""),
              met: String(r[col.met] || "").toLowerCase(),
              m_orig, mon_orig: isUSD ? "USD" : "VES",
              t_reg, usd: v_usd, ves: v_ves,
              fecha: fRaw
            };
          });
        setData(mapped.sort((a: any, b: any) => {
          const idA = parseFloat(String(a.id).replace(/[^\d.]/g, '')) || 0;
          const idB = parseFloat(String(b.id).replace(/[^\d.]/g, '')) || 0;
          return idB - idA;
        }));
      }
    } catch (e) { } finally { setLoading(false); setSyncing(false); }
  };

  useEffect(() => {
    fetchData();
    const handleSyncRate = async () => {
      setSyncing(true);
      try {
        const r = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        const j = await r.json();
        let t = j.promedio || 0;
        if (t > 0) {
          setTasa(t);
        } else {
          const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "updateRate" })
          });
          const json = await res.json();
          if (json.success && json.tasa) {
            setTasa(json.tasa);
            fetchData(true);
          }
        }
      } catch (e) { } finally { setSyncing(false); }
    };
    handleSyncRate();

    // MOTOR DE SINCRONIZACIÓN GLOBAL (60s) - Estabilidad total solicitado por el usuario
    const interval = setInterval(() => {
      fetchData(true);
    }, 60000); // 1 minuto exacto

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();

    // Consistent base data: only records with valid months (Allowing current or previous year transition)
    const validData = data.filter(d => {
      const dMonthIdx = ALL_MONTHS.findIndex(m => m.id === d.mes);
      // Robust Year Detection: Look for 4 digits or common 2-digit years
      const parts = String(d.fecha || "").split(/[-/]/);
      const rowYear = parts.find(p => p.length === 4) || parts.find(p => p.length === 2 && (p === "25" || p === "26"));

      const isCorrectYear = rowYear && (rowYear.includes(String(currentYear)) || rowYear.includes(String(currentYear).slice(-2)));
      return dMonthIdx >= 1 && isCorrectYear;
    });
    const getMult = (d: any) => {
      // Motor de detección v16.0 - PRIORIDAD: campo "tipo" del backend
      const tipo = String(d.tipo || "").toLowerCase();
      if (/ingreso|entrada/i.test(tipo)) return 1;
      if (/egreso|salida|gasto/i.test(tipo)) return -1;
      // Fallback: revisar categoría y descripción (NO método, para evitar falsos positivos con 'Pago Móvil')
      const catDesc = String((d.cat || "") + (d.desc || "")).toLowerCase();
      if (/diezmo|ofrenda|aporte|abono|venta|donacion/i.test(catDesc)) return 1;
      if (/comision|compra/i.test(catDesc)) return -1;
      return 0;
    };

    // PERFORMANCE DATA: Restricted to selected period
    let performanceData = [];
    if (filtroActivo === "ANUAL") {
      performanceData = validData;
    } else {
      performanceData = validData.filter(d => d.mes === filtroActivo);
    }

    // KPI DATA: Filtered to CURRENT YEAR ONLY (2026) to avoid historical inflation
    const kpiData = validData;

    // Calibración de Liquidez v16.0 (Mapeo Estricto Backend)
    let u = 0, vc = 0, vb = 0, dev = 0, o = 0;
    kpiData.forEach(d => {
      const mult = getMult(d);
      if (mult === 0) return;

      const met = String(d.met || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const mon = (d.mon_orig || "VES").toUpperCase();
      const isUSD = mon.includes('USD') || mon.includes('$');
      const isCash = met.includes('efectivo') || met.includes('cash') || met.includes('caja');
      const isPagoMovil = met.includes('pago movil') || met.includes('pago móvil');

      o += d.usd * mult;
      if (isUSD) {
        // Caja Divisa: solo efectivo USD físico
        if (isCash) u += d.usd * mult;
        // USD no-efectivo (Zelle, etc) también suma al total operativo pero no a caja física
        // o ya lo acumula arriba
      } else {
        // VES: separar estrictamente Efectivo vs Pago Móvil
        if (isCash) {
          vc += d.ves * mult;
        } else if (isPagoMovil) {
          vb += d.ves * mult;
        }
        // Transferencias genéricas NO suman a ningún tile de liquidez
        const tr = d.t_reg > 1 ? d.t_reg : tasa;
        dev += ((d.ves / tasa) - (d.ves / tr)) * mult;
      }
    });

    const vt = vc + vb;
    const t = u + (vt / tasa);

    const isAnual = filtroActivo === "ANUAL";
    let trendData: any[] = [];
    if (isAnual) {
      const trm: any = {};
      ALL_MONTHS.slice(1).forEach(m => trm[m.id] = { name: m.name, in: 0, out: 0, net: 0 });
      validData.forEach(d => {
        if (trm[d.mes]) {
          const mult = getMult(d);
          if (mult > 0) trm[d.mes].in += d.usd; else if (mult < 0) trm[d.mes].out += Math.abs(d.usd);
          trm[d.mes].net = trm[d.mes].in - trm[d.mes].out;
        }
      });
      trendData = ALL_MONTHS.slice(1).map(m => trm[m.id]);
    } else {
      const days: any = {};
      performanceData.forEach(d => {
        // Universal Day Detection (v2.1)
        const parts = String(d.fecha || "").split(/[-/]/);
        const day = parts.length === 3 ? (parts[0].length === 4 ? parts[2] : parts[0]) : "??";

        if (!days[day]) days[day] = { name: day, in: 0, out: 0, net: 0 };
        const m = getMult(d);
        if (m > 0) days[day].in += d.usd; else if (m < 0) days[day].out += Math.abs(d.usd);
        days[day].net = days[day].in - days[day].out;
      });
      trendData = Object.keys(days).sort((a, b) => parseInt(a) - parseInt(b)).map(k => days[k]);
    }

    const isExchange = (d: any) => /permuta|cambio|transf/i.test((d.cat || "") + (d.desc || ""));
    const mIn = performanceData.reduce((a, b) => a + (!isExchange(b) && getMult(b) === 1 ? b.usd : 0), 0);
    const mOut = performanceData.reduce((a, b) => a + (!isExchange(b) && getMult(b) === -1 ? Math.abs(b.usd) : 0), 0);

    const viewFiltered = performanceData.filter(d => {
      const matchesSearch = !searchCat || d.cat.toLowerCase().includes(searchCat.toLowerCase()) || d.desc.toLowerCase().includes(searchCat.toLowerCase());
      const matchesCategory = selectedCategory === "TODAS" || d.cat === selectedCategory;
      if (!matchesSearch || !matchesCategory) return false;
      if (activeTab === 'income') return d.tipo.includes('ingreso');
      if (activeTab === 'expense') return d.tipo.includes('egreso');
      return true;
    });

    const categoryList = Array.from(new Set(data.map(d => d.cat))).sort();

    const getP = (tp: string) => {
      const dict: any = {};
      performanceData.filter(d => d.tipo.includes(tp)).forEach(d => { dict[d.cat] = (dict[d.cat] || 0) + Math.abs(d.usd); });
      return Object.keys(dict).map(k => ({ name: k, value: dict[k] })).sort((a, b) => b.value - a.value);
    };

    const breakdown = performanceData.reduce((acc: any, d: any) => {
      const mult = getMult(d);
      const isInc = mult > 0;
      const mon = (d.mon_orig || "USD").toUpperCase();
      const met = (d.met || "").toLowerCase();
      const monKey = mon.includes("VES") ? "ves" : "usd";
      const metKey = met.includes("efectivo") || met.includes("cash") || met.includes("caja") ? "cash" : "bank";
      const typeKey = isInc ? "in" : "out";
      acc[typeKey][monKey] += Math.abs(d.m_orig);
      acc[typeKey][monKey + "Eq"] += Math.abs(d.usd);
      acc[typeKey][metKey] += Math.abs(d.usd);
      return acc;
    }, {
      in: { usd: 0, ves: 0, usdEq: 0, vesEq: 0, cash: 0, bank: 0 },
      out: { usd: 0, ves: 0, usdEq: 0, vesEq: 0, cash: 0, bank: 0 }
    });

    return {
      c: { u, vc, vb, vt, t, d: dev, o },
      m: { in: mIn, out: mOut, total: viewFiltered.length, list: viewFiltered.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE) },
      p: { in: getP('ingreso'), out: getP('egreso') },
      trend: trendData,
      categories: categoryList,
      breakdown
    };
  }, [data, filtroActivo, tasa, paginaActual, activeTab, searchCat, selectedCategory]);

  const pNum = (n: any) => fmt(n);

  useEffect(() => { setPaginaActual(1); }, [activeTab, filtroActivo, searchCat, selectedCategory]);

  // Consolidamos handleSyncRate como función accesible
  const handleRateSyncBtn = () => {
    const fn = async () => {
      setSyncing(true);
      try {
        const r = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        const j = await r.json();
        let t = j.promedio || 0;
        if (t > 0) {
          setTasa(t);
          return;
        }
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: "updateRate" })
        });
        const json = await res.json();
        if (json.success && json.tasa) {
          setTasa(json.tasa);
          fetchData(true);
        }
      } catch (e) { } finally { setSyncing(false); }
    };
    fn();
  };

  const handleEdit = (r: any) => { setEditingRow({ ...r }); setIsEditModalOpen(true); };
  const save = async () => {
    setSyncing(true);
    setIsEditModalOpen(false);
    try {
      // text/plain evita preflight OPTIONS que Apps Script rechaza
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ ...editingRow, action: 'edit', tasa: tasa }) // Enviar tasa actual para sincronía
      });
      fetchData(true);
    } catch (e) {
      alert("Error al guardar cambios");
      setSyncing(false);
    }
  };

  const themeClass = isDark ? "bg-[#020306] text-slate-100 dark" : "bg-[#f8fafc] text-slate-900 light";
  const cardClass = isDark ? "bg-[#0a0c10] border-white/5 shadow-2xl shadow-black/40" : "bg-white border-slate-200 shadow-sm shadow-slate-200/50";
  const navClass = isDark ? "bg-[#0a0c10] border-white/5" : "bg-white border-slate-200 shadow-lg";

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const p = (form.elements.namedItem('pass') as HTMLInputElement).value;
      const match = DEFAULT_USERS.find(x => x.user === selectedUser && x.pass === p);
      if (match) {
        if (rememberMe) {
          localStorage.setItem('jes_session', JSON.stringify({ role: match.role, name: match.name }));
        }
        setUserRole(match.role);
        setUserName(match.name);
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        setLoginError('Contraseña incorrecta');
      }
    };

    const handleBiometricLogin = async () => {
      if (!window.PublicKeyCredential) {
        alert("Tu dispositivo no soporta biometría web.");
        return;
      }
      // Demo: En un entorno real se validaría el challenge del servidor.
      // Aquí simulamos el acceso si ya hubo una sesión previa guardada.
      const saved = localStorage.getItem('jes_session');
      if (saved) {
        const { role, name } = JSON.parse(saved);
        setUserRole(role);
        setUserName(name);
        setIsAuthenticated(true);
      } else {
        alert("Primero inicia sesión con contraseña para activar biometría.");
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0c10] via-[#0f172a] to-[#020306] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src={LOGO_URL} className="w-16 h-16 mx-auto mb-4 object-contain" alt="JES" />
            <h1 className="text-lg font-black uppercase tracking-tight text-white">Finanzas <span style={{ color: BRAND.accent }}>JES</span> Suite</h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Acceso Seguro</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-black/50 space-y-4">
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Seleccionar Usuario</label>
              <div className="grid grid-cols-3 gap-2">
                {(['supervisor', 'admin', 'vista'] as const).map(u => (
                  <button key={u} type="button" onClick={() => setSelectedUser(u)}
                    className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${selectedUser === u ? 'bg-[#2E6061] border-[#2E6061] text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Contraseña</label>
              <input name="pass" type="password" required
                className="w-full bg-white/5 border border-white/10 text-white p-3 rounded-xl text-sm outline-none focus:border-[#2E6061] transition-all font-bold placeholder:text-slate-600"
                placeholder="••••••••" />
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="hidden" />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-[#2E6061] border-[#2E6061]' : 'border-white/20 group-hover:border-white/40'}`}>
                  {rememberMe && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-300 transition-colors">Recordar sesión</span>
              </label>
            </div>

            {loginError && <p className="text-rose-400 text-[10px] font-bold text-center animate-pulse">{loginError}</p>}

            <button type="submit"
              className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary}, #1a4040)` }}
            >
              Iniciar Sesión
            </button>

            <button type="button" onClick={handleBiometricLogin}
              className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-300 border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" /> Acceso Biométrico
            </button>

            <div className="text-center pt-2">
              <p className="text-[8px] text-slate-600">Roles: Supervisor · Administrador · Vista</p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className={`min-h-screen ${themeClass} flex items-center justify-center`}>
      <div className="text-center animate-pulse px-10">
        <img src={LOGO_URL} className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 object-contain" alt="Iglesia JES" />
        <p className="font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] opacity-50" style={{ color: BRAND.primary }}>Finanzas JES Suite</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${themeClass} font-['Inter',sans-serif] flex flex-col md:flex-row transition-colors duration-500`}>

      {/* PROFESSIONAL NAVIGATION */}
      <nav className={`fixed bottom-0 md:relative w-full md:w-64 ${navClass} border-t md:border-t-0 md:border-r z-50 md:h-screen flex md:flex-col overflow-hidden`}>
        <div className="hidden md:flex p-6 items-center gap-3 border-b border-white/5 h-24">
          <img src={LOGO_URL} className="w-10 h-10 object-contain" alt="JES" />
          <div>
            <h1 className="text-xs font-black uppercase tracking-tighter">Finanzas <span style={{ color: BRAND.accent }}>JES</span> Suite</h1>
            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Identidad Oficial Iglesia JES</p>
          </div>
        </div>

        <div className="flex md:flex-col w-full md:p-4 overflow-x-hidden md:overflow-y-auto no-scrollbar gap-2 p-2">
          <NavBtn active={activeTab === 'dash'} onClick={() => setActiveTab('dash')} icon={<LayoutDashboard />} label="Dashboard" isDark={isDark} />
          {isAdmin && <NavBtn active={activeTab === 'income'} onClick={() => setActiveTab('income')} icon={<ArrowUpCircle />} label="Ingresos" isDark={isDark} />}
          {isAdmin && <NavBtn active={activeTab === 'expense'} onClick={() => setActiveTab('expense')} icon={<ArrowDownCircle />} label="Egresos" isDark={isDark} />}
          {isAdmin && <NavBtn active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<BadgeCheck />} label="Auditoría" isDark={isDark} />}
          {isAdmin && <NavBtn active={activeTab === 'bank'} onClick={() => setActiveTab('bank')} icon={<Landmark />} label="Datos Banco" isDark={isDark} />}
          <NavBtn active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileText />} label="Reportes" isDark={isDark} />
        </div>

        <div className="hidden md:block mt-auto p-4 border-t border-white/5 space-y-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'} mb-2`}>
            <ShieldCheck className="w-4 h-4" style={{ color: BRAND.primary }} />
            <div className="flex-1 min-w-0">
              <p className={`text-[9px] font-black uppercase truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{userName}</p>
              <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{userRole === 'supervisor' ? 'Supervisor' : userRole === 'admin' ? 'Administrador' : 'Solo Vista'}</p>
            </div>
          </div>
          <button onClick={() => window.open('file:///c:/Users/sahel/Downloads/finanzas-jes---dashboard/MASTER_MANUAL.md', '_blank')} className="w-full h-11 flex items-center justify-center gap-2 bg-blue-600/10 rounded-xl text-[10px] font-black uppercase border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-all">
            <BookOpen className="w-4 h-4" /> Manual Técnico
          </button>
          <button onClick={() => setIsDark(!isDark)} className="w-full h-11 flex items-center justify-center gap-2 bg-white/5 rounded-xl text-[10px] font-black uppercase border border-white/5 hover:bg-white/10 transition-all">
            {isDark ? <><Sun className="w-4 h-4 text-amber-500" /> Claro</> : <><Moon className="w-4 h-4 text-blue-500" /> Oscuro</>}
          </button>
          <button onClick={handleLogout} className="w-full h-9 flex items-center justify-center gap-2 rounded-xl text-[9px] font-black uppercase border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
            <X className="w-3 h-3" /> Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* WORKSPACE - ZERO SCROLL ENFORCED */}
      <main className={`flex-1 ${activeTab === 'dash' ? 'h-screen overflow-hidden' : 'h-screen overflow-y-auto'} pb-24 md:pb-0`}>

        {/* UPPER HEADER */}
        <header className={`h-16 md:h-24 px-4 md:px-8 flex items-center justify-between border-b ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-200 bg-white'} sticky top-0 z-40 backdrop-blur-md`}>
          <div className="flex items-center gap-2 md:gap-4 truncate">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
            </div>
            <select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
              className={`bg-transparent text-[10px] md:text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:opacity-70 transition-all ${isDark ? 'text-white' : 'text-slate-900'} max-w-[120px] md:max-w-none`}
            >
              {ALL_MONTHS.map(m => <option key={m.id} value={m.id} className={isDark ? 'bg-[#0a0c10]' : 'bg-white'}>{m.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className={`hidden sm:flex items-center px-4 py-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} gap-3`}>
              <span className="text-[8px] font-black text-slate-500 uppercase">Tasa BCV</span>
              <span className={`text-[11px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{tasa.toFixed(2)}</span>
              <button
                onClick={handleRateSyncBtn}
                disabled={syncing}
                title="Sincronizar Tasa"
                className={`ml-1 p-1 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'} ${syncing ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 md:gap-3">
              {canEdit && (
                <>
                  <button onClick={() => setShowExchange(true)} className="flex items-center justify-center w-9 h-9 md:w-auto md:px-4 md:h-11 rounded-xl text-white transition-all hover:scale-105 shadow-lg active:scale-95" style={{ backgroundColor: BRAND.accent }}>
                    <RefreshCw className="w-4 h-4" /> <span className="hidden md:inline font-black uppercase text-[10px] tracking-widest ml-2">Intercambio</span>
                  </button>
                  <button onClick={() => window.open(FORM_URL, '_blank')} className="flex items-center justify-center w-9 h-9 md:w-auto md:px-4 md:h-11 rounded-xl text-white transition-all hover:scale-105 shadow-xl active:scale-95" style={{ backgroundColor: BRAND.primary }}>
                    <PlusCircle className="w-4 h-4" /> <span className="hidden md:inline font-black uppercase text-[10px] tracking-widest ml-2">Nuevo Asiento</span>
                  </button>
                </>
              )}
              <button onClick={() => fetchData(true)} className={`w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl border ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'} transition-all ${syncing ? 'animate-spin' : ''}`}>
                <RefreshCw className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>
        </header>

        <div className={`p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto flex-1 h-full flex flex-col min-h-0`}>

          {activeTab === 'dash' && (
            <div className="animate-in fade-in duration-700 h-full flex flex-col gap-4">
              {/* KPIs COMPACTOS (ZERO-SCROLL) */}
              <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
                <KpiTile label="Caja Divisa" val={`$ ${fmt(stats.c.u)}`} icon={<DollarSign />} c="jes" isDark={isDark} />
                <KpiTile label="Caja VES" val={`Bs. ${fmt(stats.c.vc)}`} sub={`$ ${fmt(stats.c.vc / (tasa > 1 ? tasa : 1))}`} icon={<CreditCard />} c="jes" isDark={isDark} />
                <KpiTile label="Móvil/Banco" val={`Bs. ${fmt(stats.c.vb)}`} sub={`$ ${fmt(stats.c.vb / (tasa > 1 ? tasa : 1))}`} icon={<Landmark />} c="jes" isDark={isDark} />
                <KpiTile label="Total VES" val={`Bs. ${fmt(stats.c.vt)}`} sub={`$ ${fmt(stats.c.vt / (tasa > 1 ? tasa : 1))}`} icon={<PiggyBank />} c="amber" isDark={isDark} />
                <KpiTile label="Tasa BCV" val={`${tasa.toFixed(2)}`} sub="VES/$" icon={<Database />} c="amber" isDark={isDark} />
                <KpiTile label="Poder Real" val={`$ ${fmt(stats.c.t)}`} sub={`vs $${fmt(stats.c.o)}`} icon={<TrendingUp />} c="jes" isDark={isDark} />
                <KpiTile label="Diferencial" val={`${stats.c.d >= 0 ? '+' : ''}$ ${fmt(stats.c.d)}`} sub={stats.c.d < 0 ? 'Deval.' : 'Ganancia'} icon={<DevaluationIcon />} c={stats.c.d < 0 ? "rose" : "emerald"} isDark={isDark} />
              </section>

              {/* CONTENEDOR DE GRÁFICOS FLEXIBLE */}
              <div className="flex-1 min-h-[400px] flex flex-col gap-4">
                {/* PERFORMANCE CHART ADAPTADO */}
                <div className={`${cardClass} rounded-[2rem] p-4 lg:p-6 flex-[1.5] flex flex-col min-h-[250px]`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[12px] font-black uppercase tracking-tighter">Performance {filtroActivo === "ANUAL" ? "Anual" : "Mensual"}</h3>
                    <div className="flex gap-4 text-[8px] font-black uppercase">
                      <span className="flex items-center gap-2" style={{ color: BRAND.primary }}><div className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND.primary }} /> Ingresos</span>
                      <span className="flex items-center gap-2" style={{ color: BRAND.accent }}><div className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND.accent }} /> Flujo</span>
                    </div>
                  </div>
                  <div className="w-full relative h-[180px] md:h-[250px] mt-4">
                    {stats.trend.length === 0 || stats.trend.every((pt: any) => pt.in === 0 && pt.out === 0) ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                        <Bug className="w-10 h-10 mb-2" style={{ color: BRAND.primary }} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sin datos para {filtroActivo === 'ANUAL' ? '2026' : filtroActivo}</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={stats.trend} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                          <defs>
                            <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={BRAND.primary} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={BRAND.primary} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)"} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: isDark ? '#475569' : '#94a3b8' }} />
                          <YAxis hide domain={['auto', 'auto']} />
                          <Tooltip
                            cursor={{ stroke: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', strokeWidth: 20 }}
                            formatter={(v: any) => [`$${parseFloat(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`]}
                            contentStyle={{ backgroundColor: isDark ? '#020306' : '#fff', border: 'none', borderRadius: '16px', fontSize: '10px', fontWeight: 900, color: isDark ? '#fff' : '#000' }}
                          />
                          <Area type="monotone" dataKey="in" stroke="none" fill="url(#colorIn)" />
                          <Bar dataKey="in" fill={BRAND.primary} radius={[4, 4, 0, 0]} barSize={12} />
                          <Bar dataKey="out" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                          <Line type="monotone" dataKey="net" stroke={BRAND.accent} strokeWidth={3} dot={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* TORTICAS LADO A LADO */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                  <SmartPie title="Fuentes de Ingreso" data={stats.p.in} isDark={isDark} />
                  <SmartPie title="Estructura de Gastos" data={stats.p.out} isDark={isDark} />
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'income' || activeTab === 'expense' || activeTab === 'audit') && (
            <div className="animate-in slide-in-from-right-10 duration-500 h-full space-y-4">

              <div className="flex flex-col md:flex-row gap-4">
                <div className={`${cardClass} flex-1 rounded-2xl p-4 flex items-center gap-4 border-l-4 ${activeTab === 'income' ? 'border-l-emerald-500' : activeTab === 'expense' ? 'border-l-rose-500' : 'border-l-blue-500'} transition-all`}>
                  <div className="p-2.5 rounded-xl bg-white/5"><Search className="w-4 h-4 text-slate-500" /></div>
                  <input
                    className={`flex-1 bg-transparent border-none outline-none text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'} placeholder:text-slate-600 uppercase tracking-widest`}
                    placeholder="Buscador inteligente (Concepto o Categoría)..."
                    value={searchCat}
                    onChange={(e) => setSearchCat(e.target.value)}
                  />
                  {searchCat && <button onClick={() => setSearchCat("")}><X className="w-4 h-4 text-slate-500 hover:text-white" /></button>}
                </div>

                <div className={`${cardClass} md:w-72 rounded-2xl p-4 flex items-center gap-4 border-l-4 border-l-blue-500 transition-all relative group`}>
                  <div className="p-2.5 rounded-xl bg-white/5"><Filter className="w-4 h-4 text-slate-500" /></div>
                  <div className="flex-1 relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`w-full bg-transparent border-none outline-none text-[10px] md:text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'} uppercase tracking-widest appearance-none cursor-pointer pr-8`}
                    >
                      <option value="TODAS" className={isDark ? 'bg-[#0a0c10]' : 'bg-white'}>TODAS LAS CATEGORÍAS</option>
                      {stats.categories.map((c: string) => (
                        <option key={c} value={c} className={isDark ? 'bg-[#0a0c10]' : 'bg-white'}>{c.toUpperCase()}</option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none transition-transform group-hover:translate-y-[-40%]`} />
                  </div>
                </div>
              </div>

              <div className={`${cardClass} rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-2xl transition-all`}>
                <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white/[0.01]">
                  <div className="flex items-center gap-5">
                    <div className={`p-5 rounded-[1.25rem] ${activeTab === 'income' ? 'bg-emerald-500/10 text-emerald-500 shadow-xl shadow-emerald-500/10' : activeTab === 'expense' ? 'bg-rose-500/10 text-rose-500 shadow-xl shadow-rose-500/10' : 'bg-blue-500/10 text-blue-500 shadow-xl shadow-blue-500/10'}`}>
                      {activeTab === 'income' ? <ArrowUpCircle className="w-7 h-7" /> : activeTab === 'expense' ? <ArrowDownCircle className="w-7 h-7" /> : <BadgeCheck className="w-7 h-7" />}
                    </div>
                    <div>
                      <h3 className="text-[17px] font-black uppercase tracking-tighter leading-none">{activeTab === 'income' ? 'Registro de Ingresos' : activeTab === 'expense' ? 'Registro de Egresos' : 'Panel de Auditoría'}</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mt-2 italic opacity-50">{ALL_MONTHS.find(m => m.id === filtroActivo)?.name.toUpperCase()} â€¢ {stats.m.total} MOVIMIENTOS</p>
                    </div>
                  </div>
                  <Pagination cur={paginaActual} total={Math.ceil(stats.m.total / PAGE_SIZE)} onCh={setPaginaActual} isDark={isDark} />
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-[65vh] md:max-h-full scrollbar-thin">
                  <table className="w-full text-left text-[11px] border-collapse min-w-full md:min-w-[800px]">
                    <thead className={`sticky top-0 ${isDark ? 'bg-[#0e1117]' : 'bg-slate-100'} z-10 border-b ${isDark ? 'border-white/5' : 'border-slate-200'} hidden md:table-header-group`}>
                      <tr>
                        <th className="px-6 md:px-10 py-4 md:py-6 text-slate-500 uppercase font-black tracking-widest text-[10px]">Asiento / Detalles</th>
                        <th className="px-10 py-6 text-center text-slate-500 uppercase font-black tracking-widest text-[10px] hidden md:table-cell">Categoría</th>
                        <th className="px-10 py-6 text-right text-slate-500 uppercase font-black tracking-widest text-[10px] hidden md:table-cell">Origen</th>
                        <th className="px-6 md:px-10 py-4 md:py-6 text-right text-slate-500 uppercase font-black tracking-widest text-[10px]">Equiv. USD</th>
                        {activeTab === 'audit' && <th className="px-10 py-6 text-center text-slate-500 uppercase font-black tracking-widest text-[10px] hidden md:table-cell">Acción</th>}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-slate-200'}`}>
                      {stats.m.list.map((r, i) => (
                        <AsientoRow key={i} r={r} isDark={isDark} showAudit={canEdit} onAudit={() => handleEdit(r)} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="animate-in fade-in zoom-in duration-500 space-y-8 max-w-4xl mx-auto">
              <div className={`${cardClass} rounded-[3rem] overflow-hidden shadow-3xl`}>
                <div className="p-10 border-b border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Datos de Pago Institucional</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Comparte estos datos para recibir ofrendas o pagos</p>
                  </div>
                  <button onClick={() => window.print()} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95 no-print">
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-10 flex flex-col items-center justify-center space-y-8">
                  <div className="max-w-md w-full">
                    <BankCard
                      bank={BANK_CONFIG.bank}
                      owner="Dato de Pago"
                      id={`C.I. ${BANK_CONFIG.id}`}
                      acc={BANK_CONFIG.phone}
                      type={`Pago Móvil (${BANK_CONFIG.code})`}
                      isDark={isDark}
                    />
                    <div className={`mt-6 p-6 rounded-2xl border ${isDark ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'} text-center`}>
                      <p className="text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <Info className="w-4 h-4" /> {BANK_CONFIG.note}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (() => {
            const allFiltered = filtroActivo === "ANUAL"
              ? data.filter(d => {
                const dMonthIdx = ALL_MONTHS.findIndex(m => m.id === d.mes);
                const parts = String(d.fecha || "").split(/[-/]/);
                const rowYear = parts.find(p => p.length === 4) || parts.find(p => p.length === 2 && (p === "25" || p === "26"));
                const currentYear = new Date().getFullYear();
                const isCorrectYear = rowYear && (rowYear.includes(String(currentYear)) || rowYear.includes(String(currentYear).slice(-2)));
                return dMonthIdx >= 1 && isCorrectYear;
              })
              : data.filter(d => d.mes === filtroActivo);
            const getMult = (d: any) => { const t = String(d.tipo || "").toLowerCase(); if (/ingreso|entrada/i.test(t)) return 1; if (/egreso|salida|gasto/i.test(t)) return -1; return 0; };
            const totalTablePages = Math.max(1, Math.ceil(allFiltered.length / REPORT_TABLE_SIZE));
            const cPage = Math.min(reportPage, totalTablePages);
            const visibleRows = allFiltered.slice((cPage - 1) * REPORT_TABLE_SIZE, cPage * REPORT_TABLE_SIZE);
            return (
              <div className="animate-in fade-in slide-in-from-bottom-10 duration-500 print:m-0 print:p-0">
                <style>{`
              @page { size: A4; margin: 12mm; }
              @media print {
                nav, .no-print, header, .recharts-wrapper { display: none !important; }
                html, body { margin: 0 !important; padding: 0 !important; background: white !important; color: #333 !important; }
                main { padding: 0 !important; margin: 0 !important; height: auto !important; overflow: visible !important; max-width: 100% !important; }
                .print-report { display: block !important; width: 100% !important; border: none !important; border-radius: 0 !important; box-shadow: none !important; background: white !important; padding: 0 !important; margin: 0 !important; overflow: visible !important; }
                .print-only { display: table-row-group !important; }
                .screen-only { display: none !important; }
                .print-summary { -webkit-print-color-adjust: exact; print-color-adjust: exact; page-break-inside: avoid; }
                .print-summary.income { background-color: #e8f5e9 !important; border-color: #c8e6c9 !important; }
                .print-summary.income * { color: #2e7d32 !important; }
                .print-summary.expense { background-color: #ffebee !important; border-color: #ffcdd2 !important; }
                .print-summary.expense * { color: #c62828 !important; }
                .print-summary.balance { background-color: #e3f2fd !important; border-color: #bbdefb !important; }
                .print-summary.balance * { color: #1565c0 !important; }
                .print-thead { background-color: #2c3e50 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .print-thead th { color: white !important; }
                .print-signatures { page-break-inside: avoid; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                * { transition: none !important; animation: none !important; color: #333 !important; }
              }
              `}</style>
                <div className="flex justify-between items-center mb-3 no-print">
                  <div>
                    <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Informe de Gestión</h2>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ðŸ“Š {filtroActivo === "ANUAL" ? "CONSOLIDADO ANUAL 2026" : `MENSUAL: ${filtroActivo.toUpperCase()}`}</p>
                  </div>
                  <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                    <Printer className="w-3.5 h-3.5" /> Imprimir A4
                  </button>
                </div>
                <div className={`print-report ${cardClass} rounded-2xl`} style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", overflow: 'visible' }}>
                  <div className={`px-4 py-1.5 border-b ${isDark ? 'border-slate-700' : 'border-[#2c3e50]'} flex justify-between items-center`}>
                    <div className="flex items-center gap-2">
                      <img src={LOGO_URL} className="w-7 h-7 object-contain" alt="Logo JES" />
                      <div>
                        <h1 className={`text-[12px] font-bold uppercase leading-tight ${isDark ? 'text-white' : 'text-[#2c3e50]'}`}>Informe de Gestión de Recursos</h1>
                        <p className={`text-[8px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Administración y Finanzas</p>
                      </div>
                    </div>
                    <p className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}><strong>Periodo:</strong> {filtroActivo === "ANUAL" ? "Ene - Dic 2026" : filtroActivo.toUpperCase() + " 2026"} | <strong>Generado:</strong> {new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="px-4 py-2">
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className={`print-summary income p-2 rounded-lg text-center border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[#e8f5e9] border-[#c8e6c9]'}`}>
                        <h3 className={`text-[7px] font-bold uppercase mb-0.5 ${isDark ? 'text-emerald-400' : 'text-slate-500'}`}>Total Ingresos</h3>
                        <div className={`text-base font-bold ${isDark ? 'text-emerald-400' : 'text-[#2e7d32]'}`}>$ {fmt(stats.m.in)}</div>
                      </div>
                      <div className={`print-summary expense p-2 rounded-lg text-center border ${isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-[#ffebee] border-[#ffcdd2]'}`}>
                        <h3 className={`text-[7px] font-bold uppercase mb-0.5 ${isDark ? 'text-rose-400' : 'text-slate-500'}`}>Total Egresos</h3>
                        <div className={`text-base font-bold ${isDark ? 'text-rose-400' : 'text-[#c62828]'}`}>$ {fmt(stats.m.out)}</div>
                      </div>
                      <div className={`print-summary balance p-2 rounded-lg text-center border ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-[#e3f2fd] border-[#bbdefb]'}`}>
                        <h3 className={`text-[7px] font-bold uppercase mb-0.5 ${isDark ? 'text-blue-400' : 'text-slate-500'}`}>Balance Neto</h3>
                        <div className={`text-base font-bold ${isDark ? 'text-blue-400' : 'text-[#1565c0]'}`}>$ {fmt(stats.m.in - stats.m.out)}</div>
                      </div>
                    </div>
                    <div className={`grid grid-cols-4 gap-2 mb-1.5 p-2 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="text-[9px]">
                        <p className="text-[7px] font-bold text-slate-500 uppercase mb-0.5">USD In/Out</p>
                        <span className="font-mono font-bold">${fmt(stats.breakdown.in.usd)} / ${fmt(stats.breakdown.out.usd)}</span>
                      </div>
                      <div className="text-[9px]">
                        <p className="text-[7px] font-bold text-slate-500 uppercase mb-0.5">VES In/Out</p>
                        <span className="font-mono font-bold">Bs.{fmt(stats.breakdown.in.ves)} / {fmt(stats.breakdown.out.ves)}</span>
                      </div>
                      <div className="text-[9px]">
                        <p className="text-[7px] font-bold text-slate-500 uppercase mb-0.5">Efectivo In/Out</p>
                        <span className="font-mono font-bold">${fmt(stats.breakdown.in.cash)} / ${fmt(stats.breakdown.out.cash)}</span>
                      </div>
                      <div className="text-[9px]">
                        <p className="text-[7px] font-bold text-slate-500 uppercase mb-0.5">Banco In/Out</p>
                        <span className="font-mono font-bold">${fmt(stats.breakdown.in.bank)} / ${fmt(stats.breakdown.out.bank)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-1">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className={`text-[11px] font-bold pl-2 border-l-2 ${isDark ? 'text-white border-slate-500' : 'text-[#2c3e50] border-[#2c3e50]'}`}>Detalle de Movimientos ({allFiltered.length})</h2>
                      {totalTablePages > 1 && (
                        <div className="flex items-center gap-1 no-print">
                          <button onClick={() => setReportPage(Math.max(1, reportPage - 1))} disabled={cPage <= 1} className={`p-1 rounded-lg transition-all ${cPage <= 1 ? 'opacity-20' : isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}><ArrowLeft className="w-3 h-3" /></button>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 ${isDark ? 'text-white' : 'text-slate-700'}`}>{cPage}/{totalTablePages}</span>
                          <button onClick={() => setReportPage(Math.min(totalTablePages, reportPage + 1))} disabled={cPage >= totalTablePages} className={`p-1 rounded-lg transition-all ${cPage >= totalTablePages ? 'opacity-20' : isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}><ArrowRight className="w-3 h-3" /></button>
                        </div>
                      )}
                    </div>
                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr className={`print-thead ${isDark ? 'bg-slate-800' : 'bg-[#2c3e50]'}`}>
                          <th className="px-2 py-2 text-left text-white text-[9px] font-semibold uppercase tracking-wider" style={{ width: '11%' }}>Fecha</th>
                          <th className="px-2 py-2 text-left text-white text-[9px] font-semibold uppercase tracking-wider" style={{ width: '35%' }}>Descripción</th>
                          <th className="px-2 py-2 text-left text-white text-[9px] font-semibold uppercase tracking-wider" style={{ width: '15%' }}>Categoría</th>
                          <th className="px-2 py-2 text-right text-white text-[9px] font-semibold uppercase tracking-wider" style={{ width: '13%' }}>Ingreso</th>
                          <th className="px-2 py-2 text-right text-white text-[9px] font-semibold uppercase tracking-wider" style={{ width: '13%' }}>Egreso</th>
                          <th className="px-2 py-2 text-right text-white text-[9px] font-semibold uppercase tracking-wider" style={{ width: '13%' }}>USD</th>
                        </tr>
                      </thead>
                      <tbody className="screen-only">
                        {visibleRows.map((r: any, i: number) => {
                          const m = getMult(r); const inc = m > 0; const gi = (cPage - 1) * REPORT_TABLE_SIZE + i; return (
                            <tr key={gi} className={`border-b ${isDark ? 'border-white/5' : 'border-slate-200'} ${gi % 2 === 1 ? (isDark ? 'bg-white/[0.02]' : 'bg-[#f9f9f9]') : ''}`}>
                              <td className={`px-1.5 py-1 text-[9px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{r.fecha}</td>
                              <td className={`px-1.5 py-1 text-[9px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{r.desc || r.cat}</td>
                              <td className={`px-1.5 py-1 text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{r.cat}</td>
                              <td className={`px-1.5 py-1 text-[9px] text-right font-mono ${inc ? 'text-emerald-600 font-semibold' : ''}`}>{inc ? `${r.mon_orig === 'USD' ? '$' : 'Bs.'}${fmt(r.m_orig)}` : '-'}</td>
                              <td className={`px-1.5 py-1 text-[9px] text-right font-mono ${!inc && m !== 0 ? 'text-rose-600 font-semibold' : ''}`}>{!inc && m !== 0 ? `${r.mon_orig === 'USD' ? '$' : 'Bs.'}${fmt(r.m_orig)}` : '-'}</td>
                              <td className={`px-1.5 py-1 text-[9px] text-right font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>${fmt(r.usd)}</td>
                            </tr>);
                        })}
                      </tbody>
                      <tbody className="print-only" style={{ display: 'none' }}>
                        {allFiltered.map((r: any, i: number) => {
                          const m = getMult(r); const inc = m > 0; return (
                            <tr key={i} className={`border-b border-slate-200 ${i % 2 === 1 ? 'bg-[#f9f9f9]' : ''}`}>
                              <td className="px-1.5 py-1 text-[9px] text-slate-700">{r.fecha}</td>
                              <td className="px-1.5 py-1 text-[9px] text-slate-800">{r.desc || r.cat}</td>
                              <td className="px-1.5 py-1 text-[9px] text-slate-600">{r.cat}</td>
                              <td className={`px-1.5 py-1 text-[9px] text-right font-mono ${inc ? 'text-emerald-600 font-semibold' : ''}`}>{inc ? `${r.mon_orig === 'USD' ? '$' : 'Bs.'}${fmt(r.m_orig)}` : '-'}</td>
                              <td className={`px-1.5 py-1 text-[9px] text-right font-mono ${!inc && m !== 0 ? 'text-rose-600 font-semibold' : ''}`}>{!inc && m !== 0 ? `${r.mon_orig === 'USD' ? '$' : 'Bs.'}${fmt(r.m_orig)}` : '-'}</td>
                              <td className="px-1.5 py-1 text-[9px] text-right font-mono font-bold text-slate-700">${fmt(r.usd)}</td>
                            </tr>);
                        })}
                      </tbody>
                      <tfoot>
                        <tr className={`font-bold border-t-2 ${isDark ? 'border-slate-600 bg-white/5' : 'border-[#2c3e50] bg-slate-100'}`}>
                          <td colSpan={3} className="px-1.5 py-1 text-right text-[9px] uppercase tracking-wider">Totales:</td>
                          <td className="px-1.5 py-1 text-right text-[9px] font-mono text-emerald-600">$ {fmt(stats.m.in)}</td>
                          <td className="px-1.5 py-1 text-right text-[9px] font-mono text-rose-600">$ {fmt(stats.m.out)}</td>
                          <td className="px-1.5 py-1 text-right text-[9px] font-mono font-black">$ {fmt(stats.m.in - stats.m.out)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="px-4 py-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0' }}>
                    <div className={`p-2 rounded-lg border mb-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#fafafa] border-slate-200'}`}>
                      <p className={`text-[9px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <strong>Nota:</strong> {stats.m.in > stats.m.out
                          ? `Superávit de $${fmt(stats.m.in - stats.m.out)}. Se recomienda reservar un porcentaje para contingencias.`
                          : `Déficit de $${fmt(stats.m.out - stats.m.in)}. Revisar gastos operativos y evaluar fuentes adicionales.`}
                      </p>
                    </div>
                    <div className="print-signatures flex justify-between pt-1">
                      <div className="w-[40%] text-center">
                        <p className={`text-[9px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Elaborado por:</p>
                        {preparedBySig ? (
                          <img src={preparedBySig} alt="Firma" className="mx-auto h-12 object-contain mb-1" />
                        ) : (
                          <div className="mb-5"></div>
                        )}
                        <div className={`border-t ${isDark ? 'border-slate-600' : 'border-slate-400'} mx-auto w-36`}></div>
                        <p className={`text-[8px] mt-0.5 text-slate-500`}>Firma y Sello</p>
                        <label className="no-print cursor-pointer mt-1 inline-flex items-center gap-1 text-[8px] text-blue-500 hover:text-blue-400 transition-all">
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setPreparedBySig(r.result as string); r.readAsDataURL(f); } }} />
                          📷 {preparedBySig ? 'Cambiar' : 'Subir firma'}
                        </label>
                      </div>
                      <div className="w-[40%] text-center">
                        <p className={`text-[9px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Aprobado por:</p>
                        {approvedBySig ? (
                          <img src={approvedBySig} alt="Firma" className="mx-auto h-12 object-contain mb-1" />
                        ) : (
                          <div className="mb-5"></div>
                        )}
                        <div className={`border-t ${isDark ? 'border-slate-600' : 'border-slate-400'} mx-auto w-36`}></div>
                        <p className={`text-[8px] mt-0.5 text-slate-500`}>Dirección General</p>
                        <label className="no-print cursor-pointer mt-1 inline-flex items-center gap-1 text-[8px] text-blue-500 hover:text-blue-400 transition-all">
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setApprovedBySig(r.result as string); r.readAsDataURL(f); } }} />
                          📷 {approvedBySig ? 'Cambiar' : 'Subir firma'}
                        </label>
                      </div>
                    </div>
                    <div className={`mt-2 pt-1 text-center border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                      <p className={`text-[7px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        Generado el {new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })} | Finanzas JES Suite
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* AUDIT MODAL PROFESIONAL v2.0 */}
          {
            isEditModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" onClick={() => setIsEditModalOpen(false)}>
                <div onClick={(e) => e.stopPropagation()} className={`${isDark ? 'bg-[#0f1218]' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-slate-200'} rounded-[2rem] w-full max-w-md overflow-hidden animate-in zoom-in duration-300 shadow-2xl`}>
                  <div className={`p-6 border-b ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'} flex justify-between items-center`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/10"><Edit3 className="w-4 h-4 text-blue-500" /></div>
                      <h3 className={`text-xs font-black uppercase tracking-[0.15em] ${isDark ? 'text-white' : 'text-slate-800'}`}>Edición de Control</h3>
                    </div>
                    <button onClick={() => setIsEditModalOpen(false)} className={`p-2 rounded-xl ${isDark ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'} transition-all hover:rotate-90`}><X className="w-4 h-4" /></button>
                  </div>
                  <div className="p-6 space-y-5">
                    {/* Concepto */}
                    <div className="space-y-2">
                      <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Concepto del Asiento</label>
                      <input className={`w-full ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} p-4 rounded-xl text-[12px] outline-none focus:border-blue-500 border-2 transition-all font-bold`} value={editingRow.desc} onChange={(e) => setEditingRow({ ...editingRow, desc: e.target.value })} />
                    </div>

                    {/* Tipo + Categoría */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Tipo</label>
                        <select className={`w-full ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} p-4 rounded-xl text-[12px] outline-none appearance-none border-2 font-bold`} value={editingRow.tipo} onChange={(e) => setEditingRow({ ...editingRow, tipo: e.target.value })}>
                          <option value="ingreso">Ingreso</option>
                          <option value="egreso">Egreso</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Categoría</label>
                        <input className={`w-full ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} p-4 rounded-xl text-[12px] outline-none focus:border-blue-500 border-2 transition-all font-bold`} value={editingRow.cat} onChange={(e) => setEditingRow({ ...editingRow, cat: e.target.value })} />
                      </div>
                    </div>

                    {/* Método + Moneda */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Método</label>
                        <select className={`w-full ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} p-4 rounded-xl text-[12px] outline-none appearance-none border-2 font-bold`} value={editingRow.met} onChange={(e) => setEditingRow({ ...editingRow, met: e.target.value })}>
                          <option value="efectivo">Efectivo</option>
                          <option value="pago movil">Pago Móvil</option>
                          <option value="transferencia">Transferencia</option>
                          <option value="punto">Punto</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Moneda</label>
                        <select className={`w-full ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} p-4 rounded-xl text-[12px] outline-none appearance-none border-2 font-bold`} value={editingRow.mon_orig} onChange={(e) => setEditingRow({ ...editingRow, mon_orig: e.target.value })}>
                          <option value="VES">Bolívares (VES)</option>
                          <option value="USD">Dólares (USD)</option>
                        </select>
                      </div>
                    </div>

                    {/* Monto + Tasa */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Monto Original</label>
                        <input type="number" className={`w-full ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} p-4 rounded-xl text-[12px] border-2 font-bold outline-none transition-all`} value={editingRow.m_orig} onChange={(e) => setEditingRow({ ...editingRow, m_orig: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-2">
                        <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Tasa Registro</label>
                        <input type="number" className={`w-full ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} p-4 rounded-xl text-[12px] border-2 font-bold outline-none transition-all`} value={editingRow.t_reg} onChange={(e) => setEditingRow({ ...editingRow, t_reg: Number(e.target.value) })} />
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setIsEditModalOpen(false)} className={`flex-1 py-4 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all border ${isDark ? 'text-slate-400 bg-white/5 border-white/5 hover:bg-white/10' : 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>Cancelar</button>
                      <button onClick={save} className="flex-1 py-4 text-[10px] font-black bg-blue-600 text-white rounded-xl uppercase shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all active:scale-95">Guardar Cambios</button>
                    </div>
                    <p className={`text-[8px] text-center font-bold uppercase flex justify-center gap-2 mt-2 opacity-40 italic tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}><ShieldCheck className="w-3 h-3" /> Registro Auditado hacia la Nube</p>
                  </div>
                </div>
              </div>
            )
          }
        </div >
      </main >
      {
        showExchange && (
          <ExchangeModal
            isOpen={showExchange}
            onClose={() => setShowExchange(false)}
            currentTasa={tasa}
            onExchange={fetchData}
            stats={stats}
            isDark={isDark}
          />
        )
      }
    </div >
  );
};

// --- SUB-COMPONENTES ATÓMICOS v9.7 ---
const NavBtn = ({ active, onClick, icon, label, isDark }: any) => {
  const c = active
    ? `text-white shadow-2xl transition-all scale-105`
    : (isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100 shadow-sm');

  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-2.5 p-3.5 md:px-5 md:py-3.5 rounded-xl transition-all font-black uppercase text-[11px] flex-1 md:flex-none ${c}`}
      style={active ? { backgroundColor: BRAND.primary } : {}}
    >
      <div className="w-6 h-6 md:w-5 md:h-5">{icon}</div>
      <span className="hidden md:block tracking-[0.15em] whitespace-nowrap">{label}</span>
    </button>
  );
};

const KpiTile = ({ label, val, sub, icon, c, isDark }: any) => {
  const g: any = {
    jes: `from-[${BRAND.primary}] to-[#3a7c7d] shadow-[${BRAND.primary}]/20`,
    amber: "from-amber-400 to-orange-600 shadow-amber-500/20",
    rose: "from-rose-500 to-red-700 shadow-rose-500/20",
    emerald: "from-emerald-500 to-teal-700 shadow-emerald-500/20"
  };

  return (
    <div className={`relative overflow-hidden p-3 md:p-4 rounded-[1.25rem] border transition-all duration-300 hover:translate-y-[-2px] ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-100 shadow-lg'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${g[c] || g.jes} text-white shadow-lg shrink-0`}>
          {React.cloneElement(icon, { size: 14, strokeWidth: 3 })}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-500 truncate mb-1">{label}</p>
          <h4 className={`text-[12px] md:text-[14px] font-black tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'} truncate`}>{val}</h4>
          {sub && <p className="text-[7.5px] font-bold text-slate-500/60 truncate mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  );
};

const SmartPie = ({ title, data, isDark }: any) => (
  <div className={`${isDark ? 'bg-[#0a0c10] border-white/5' : 'bg-white border-slate-100 shadow-lg'} p-4 rounded-[1.5rem] border flex flex-col h-full min-h-0`}>
    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic opacity-70 border-b border-white/5 pb-2">{title}</h3>
    <div className="flex-1 flex flex-col md:flex-row items-center min-h-0">
      <div className="w-full md:w-1/3 h-[120px] md:h-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius="55%" outerRadius="85%" paddingAngle={4} dataKey="value" style={{ outline: 'none' }}>
              {data.map((_: any, i: any) => (<Cell key={i} fill={COLORS[i % COLORS.length]} style={{ outline: 'none' }} />))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#020306' : '#fff', borderRadius: '12px', fontSize: '9px', fontWeight: 900 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full md:flex-1 grid grid-cols-2 gap-1.5 mt-2 md:mt-0 md:ml-4">
        {data.slice(0, 4).map((m: any, i: any) => (
          <div key={i} className={`${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'} p-1.5 md:p-2 rounded-xl flex flex-col items-start border`}>
            <span className="text-[7px] font-black text-slate-500 uppercase truncate w-full">{m.name}</span>
            <span className={`text-[10px] md:text-[11px] font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>$ {fmt(m.value)}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Pagination = ({ cur, total, onCh, isDark }: any) => (
  <div className="flex items-center gap-4">
    <button onClick={() => onCh(Math.max(1, cur - 1))} disabled={cur === 1} className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/5' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'} border disabled:opacity-20 transition-all`}><ArrowLeft className="w-4 h-4" /></button>
    <div className={`px-6 py-3 rounded-2xl text-[12px] font-black border ${isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} tracking-widest`}>{cur || 1} de {total || 1}</div>
    <button onClick={() => onCh(Math.min(total, cur + 1))} disabled={cur >= total} className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/5' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'} border disabled:opacity-20 transition-all`}><ArrowRight className="w-4 h-4" /></button>
  </div>
);

const BankCard = ({ bank, owner, id, acc, type, isDark }: any) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(`${bank}: ${acc} (${owner})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-8 rounded-[2rem] border transition-all hover:scale-[1.02] group ${isDark ? 'bg-white/[0.03] border-white/5 hover:border-blue-500/30' : 'bg-slate-50 border-slate-200 hover:border-blue-500/30 shadow-lg shadow-slate-200/50'}`}>
      <div className="flex justify-between items-start mb-6 no-print">
        <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500"><Landmark className="w-6 h-6" /></div>
        <button onClick={handleCopy} className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500/10 text-emerald-500' : 'hover:bg-white/10 text-slate-500'}`}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{bank}</p>
      <h3 className={`text-xl font-black tracking-tighter mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{acc}</h3>
      <div className="space-y-1.5 opacity-60">
        <p className="text-[10px] font-black uppercase tracking-tight">{owner}</p>
        <p className="text-[10px] font-black uppercase tracking-tight">{id}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 italic mt-2">{type}</p>
      </div>
    </div>
  );
};

const AsientoRow = ({ r, isDark, showAudit, onAudit }: any) => {
  const [open, setOpen] = useState(false);
  const isI = r.tipo.includes('ingreso');

  return (
    <>
      <tr
        onClick={() => { if (window.innerWidth < 768) setOpen(!open); }}
        className={`group transition-all ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-blue-50'} duration-300 cursor-pointer md:cursor-default`}
      >
        <td className="px-4 md:px-10 py-4 md:py-7">
          <div className="flex flex-col gap-1 md:gap-2">
            <span className={`text-[12px] md:text-[14px] font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} transition-all group-hover:translate-x-1`}>
              {r.desc || 'MOVIMIENTO SIN DETALLE'}
            </span>
            <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] opacity-40">
              <span className="whitespace-nowrap">{r.fecha}</span>
              <div className="w-1.5 md:w-2 h-px bg-slate-700" />
              <span className="truncate max-w-[100px] md:max-w-none">{r.met}</span>
              <span className="md:hidden ml-auto">
                {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            </div>
          </div>
        </td>
        <td className="px-10 py-7 text-center hidden md:table-cell">
          <span className={`px-5 py-2 rounded-xl text-[10px] font-extrabold border ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-600'} uppercase tracking-widest shadow-sm`}>{r.cat}</span>
        </td>
        <td className={`px-10 py-7 text-right font-black ${isDark ? 'text-slate-500' : 'text-slate-400'} font-mono tracking-tighter uppercase text-[12px] hidden md:table-cell`}>
          <div className="flex flex-col items-end">
            <span>{r.mon_orig} {fmt(Math.abs(r.m_orig))}</span>
            {r.mon_orig === 'VES' && <span className="text-[10px] opacity-60">Eq. Tasa BCV: $ {fmt(Math.abs(r.usd))}</span>}
          </div>
        </td>
        <td className={`px-4 md:px-10 py-4 md:py-7 text-right font-black text-[14px] md:text-[17px] ${isI ? 'text-emerald-500' : 'text-rose-500'} tracking-tighter`}>
          {isI ? '+' : '-'}$ {fmt(Math.abs(r.usd))}
        </td>
        {showAudit && (
          <td className="px-10 py-7 text-center hidden md:table-cell">
            <button onClick={(e) => { e.stopPropagation(); onAudit(); }} className="p-3.5 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-[1.25rem] transition-all border border-blue-500/40 shadow-xl shadow-blue-500/10 active:scale-90">
              <Edit3 className="w-4 h-4" />
            </button>
          </td>
        )}
      </tr>

      {/* MOBILE EXPANDABLE DETAILS */}
      {open && (
        <tr className="md:hidden animate-in slide-in-from-top-2 duration-200">
          <td colSpan={showAudit ? 3 : 2} className={`px-4 py-4 ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'} border-t border-white/5`}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-60">Categoría</p>
                <p className={`text-[10px] font-black uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{r.cat}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-60">Original</p>
                <p className={`text-[10px] font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{r.mon_orig} {fmt(Math.abs(r.m_orig))}</p>
              </div>
              {showAudit && (
                <div className="col-span-2 pt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onAudit(); }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                  >
                    <Edit3 className="w-3 h-3" /> Editar Registro
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// --- SUB-COMPONENTES ATÓMICOS v9.7 ---

const MetricCard = ({ title, val, desc, color, isDark }: any) => {
  const colors: any = {
    emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10'
  };
  return (
    <div className={`${isDark ? 'bg-[#0a0c10] border-white/5' : 'bg-white border-slate-100 shadow-lg'} p-8 rounded-[2.5rem] border flex justify-between items-center transition-all hover:scale-[1.02]`}>
      <div className="text-left">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{title}</p>
        <h4 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{val}</h4>
        <p className="text-[9px] font-bold text-slate-500 uppercase mt-1.5 opacity-60 italic tracking-widest">{desc}</p>
      </div>
      <div className={`p-5 rounded-[1.25rem] ${colors[color]} shadow-xl shadow-current/10`}>
        <TrendingUp className="w-7 h-7" />
      </div>
    </div>
  );
};

const ExchangeModal = ({ isOpen, onClose, currentTasa, onExchange, stats, isDark }: any) => {
  const [tipo, setTipo] = useState<'buy' | 'sell'>('sell');
  const [montoU, setMontoU] = useState('');
  const [tasaM, setTasaM] = useState(currentTasa.toString());
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const muVal = parseFloat(montoU) || 0;
  const tmVal = parseFloat(tasaM) || 0;
  const montoB = muVal * tmVal;
  const isValid = muVal > 0 && tmVal > 0;
  const balanceOk = tipo === 'sell' ? stats.c.u >= muVal : stats.c.vt >= montoB;

  const handleAction = async () => {
    setLoading(true);
    const op = {
      action: "cambio", id: Date.now(), fecha: new Date().toISOString(),
      tipo_cambio: tipo === 'sell' ? "Venta USD" : "Compra USD",
      monto_sale: tipo === 'sell' ? muVal : montoB,
      moneda_sale: tipo === 'sell' ? "USD" : "VES",
      monto_entra: tipo === 'sell' ? montoB : muVal,
      moneda_entra: tipo === 'sell' ? "VES" : "USD",
      tasa_mercado: tmVal,
      desc: tipo === 'sell' ? `Venta de ${montoU}$ a tasa ${tasaM}` : `Compra de ${montoU}$ a tasa ${tasaM}`
    };
    try {
      const r = await fetch(API_URL, { method: 'POST', body: JSON.stringify(op) });
      const j = await r.json();
      if (j.success) {
        onExchange();
        onClose();
      } else {
        alert("Error: " + (j.error || "Desconocido"));
      }
    } catch (e) { alert("Error al conectar con el servidor"); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`${isDark ? 'bg-[#020306] border-white/5' : 'bg-white border-slate-200'} border w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'} italic`}>ðŸ’± Intercambio de Divisa</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-rose-500 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className={`grid grid-cols-2 gap-2 mb-8 p-1 ${isDark ? 'bg-white/5' : 'bg-slate-100'} rounded-2xl`}>
          <button onClick={() => setTipo('sell')} className={`py-4 rounded-xl text-[10px] font-black uppercase transition-all ${tipo === 'sell' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>Vender USD (Hacer Bs)</button>
          <button onClick={() => setTipo('buy')} className={`py-4 rounded-xl text-[10px] font-black uppercase transition-all ${tipo === 'buy' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>Comprar USD (Guardar $)</button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[8px] font-black text-slate-500 uppercase ml-2 tracking-widest">Monto en Dólares ($)</label>
            <input type="number" value={montoU} onChange={e => setMontoU(e.target.value)} placeholder="0.00" className={`w-full h-16 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-2xl px-6 text-[18px] font-black focus:border-blue-500 transition-all outline-none`} />
          </div>

          <div className="space-y-2">
            <label className="text-[8px] font-black text-slate-500 uppercase ml-2 tracking-widest">Tasa de Mercado (Bs/$)</label>
            <input type="number" value={tasaM} onChange={e => setTasaM(e.target.value)} placeholder={currentTasa.toString()} className={`w-full h-16 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-2xl px-6 text-[18px] font-black focus:border-blue-500 transition-all outline-none`} />
          </div>

          <div className={`${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} p-6 rounded-2xl text-center space-y-1`}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recibirás aproximadamente</p>
            <h3 className={`text-[24px] font-black tracking-tighter ${tipo === 'sell' ? 'text-amber-500' : 'text-emerald-500'}`}>
              {tipo === 'sell' ? `Bs. ${montoB.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : `$ ${muVal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}
            </h3>
            {!balanceOk && isValid && <p className="text-[9px] font-black text-rose-500 uppercase mt-2 animate-pulse">âš ï¸ Saldo Insuficiente en {tipo === 'sell' ? 'Divisas' : 'Bolívares'}</p>}
          </div>

          <button
            disabled={!isValid || !balanceOk || loading}
            onClick={handleAction}
            className={`w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${(!isValid || !balanceOk || loading) ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-900/30 active:scale-95'}`}
          >
            {loading ? <RefreshCw className="animate-spin mx-auto w-5 h-5" /> : 'Confirmar Intercambio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
