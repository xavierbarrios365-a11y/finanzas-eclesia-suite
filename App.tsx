
import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend, ComposedChart, Line
} from 'recharts';
import {
  Church, Wallet, RefreshCw, Calendar, Database,
  PieChart as PieIcon, CreditCard, Banknote,
  TrendingDown as DevaluationIcon, Search, Info, Coins, Bug, Globe,
  ArrowLeft, ArrowRight, LineChart, PlusCircle, Filter,
  Edit3, ExternalLink, CheckCircle2, AlertCircle, Layers, TrendingUp, ShieldCheck,
  LayoutDashboard, ArrowUpCircle, ArrowDownCircle, BadgeCheck, Sun, Moon, X, Target, Landmark
} from 'lucide-react';

// --- CONFIGURACIÓN v9.7: SMART RUNNING BALANCE SUITE ---
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
const API_URL = 'https://script.google.com/macros/s/AKfycbxv-o6l6-SZeeoRfQyN8wHMcm4aoHlJT6vJ42xXU5L2--dcVN8-IBCh5naUSDt8_98/exec';
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc4F3QHE9zfASEjS0eS5x5X0PjvAGm_G33AEC2AJR5yy9FQoQ/viewform?usp=sharing&ouid=107728327215093587965';

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
  const [activeTab, setActiveTab] = useState<'dash' | 'income' | 'expense' | 'audit'>('dash');
  const [isDark, setIsDark] = useState(true);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [searchCat, setSearchCat] = useState<string>("");

  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const PAGE_SIZE = 12;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: any) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const normalizeMonth = (val: any) => {
    let s = String(val || "").toLowerCase().trim();
    if (!s) return "unknown";
    const isoMatch = s.match(/^\d{4}-(\d{2})-\d{2}/);
    if (isoMatch) return MONTH_MAP[isoMatch[1]] || s;
    const numMatch = s.match(/^(\d+)/);
    if (numMatch) return MONTH_MAP[numMatch[1].padStart(2, '0')] || s;
    const m = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    for (let i = 0; i < m.length; i++) if (s.includes(m[i])) return `${(i + 1).toString().padStart(2, '0')}-${m[i]}`;
    return s;
  };

  const fetchData = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}?action=getData`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        let hIdx = json.data.findIndex((r: any[]) => r.some(c => String(c || "").toLowerCase().includes("id")));
        if (hIdx === -1) hIdx = 0;
        const h = json.data[hIdx].map((c: any) => String(c || "").toLowerCase().trim());
        const f = (...k: string[]) => h.findIndex((cell: string) => k.some(key => cell.includes(key)));

        const col = {
          id: f("id"), mes: f("mes"), tipo: f("tipo"), cat: f("cat"),
          desc: f("desc", "concepto"), met: f("metodo"), m: f("monto orig"),
          mon: f("moneda"), t: f("tasa"), usd: f("total usd"), ves: f("total ves"), fecha: f("fecha")
        };

        const mapped = json.data.slice(hIdx + 1).filter((r: any[]) => (r[col.id] || r[col.m]) && r[col.mes]).map((r: any[]) => ({
          id: String(r[col.id] || ""), mes: normalizeMonth(r[col.mes]), tipo: String(r[col.tipo] || "").toLowerCase(),
          cat: String(r[col.cat] || "Gral"), desc: String(r[col.desc] || ""), met: String(r[col.met] || "").toLowerCase(),
          m_orig: Number(r[col.m] || 0), mon_orig: String(r[col.mon] || "USD").toUpperCase(),
          t_reg: Number(r[col.t] || tasa), usd: Number(r[col.usd] || 0), ves: Number(r[col.ves] || 0),
          fecha: String(r[col.fecha] || "").split('T')[0]
        }));
        setData(mapped);
      }
    } catch (e) { } finally { setLoading(false); setSyncing(false); }
  };

  useEffect(() => {
    fetchData();
    const ft = async () => { try { const r = await fetch('https://ve.dolarapi.com/v1/dolares/oficial'); const j = await r.json(); if (j.promedio) setTasa(j.promedio); } catch (e) { } };
    ft();
  }, []);

  const stats = useMemo(() => {
    const isAnual = filtroActivo === "ANUAL";

    // Performance Data: Restricted to the selected period
    const performanceData = isAnual ? data : data.filter(d => d.mes === filtroActivo);

    // Balance Data: Cumulative from start of year up to the end of the selected period
    const currentMonthIdx = ALL_MONTHS.findIndex(m => m.id === filtroActivo);
    const balanceData = isAnual ? data : data.filter(d => {
      const dMonthIdx = ALL_MONTHS.findIndex(m => m.id === d.mes);
      return dMonthIdx >= 1 && dMonthIdx <= currentMonthIdx;
    });

    // Calculate Liquidity from balanceData (CUMULATIVE)
    let u = 0, vc = 0, vb = 0, dev = 0;
    balanceData.forEach(d => {
      const mult = d.tipo.includes('ingreso') ? 1 : -1;
      if (d.mon_orig.includes('USD') || d.mon_orig.includes('$')) u += mult * d.m_orig;
      else {
        const isC = d.met.includes('efectivo') || d.met.includes('cash');
        if (isC) vc += mult * d.m_orig; else vb += mult * d.m_orig;
        const tr = d.t_reg > 1 ? d.t_reg : tasa;
        dev += (mult * (d.m_orig / tr)) - (mult * (d.m_orig / tasa));
      }
    });

    // Calculate Trend Logic (Periodic)
    let trendData: any[] = [];
    if (isAnual) {
      const trm: any = {};
      ALL_MONTHS.slice(1).forEach(m => trm[m.id] = { name: m.name, in: 0, out: 0, net: 0 });
      data.forEach(d => {
        if (trm[d.mes]) {
          const mult = d.tipo.includes('ingreso') ? 1 : -1;
          if (mult > 0) trm[d.mes].in += d.usd; else trm[d.mes].out += Math.abs(d.usd);
          trm[d.mes].net = trm[d.mes].in - trm[d.mes].out;
        }
      });
      trendData = ALL_MONTHS.slice(1).map(m => trm[m.id]);
    } else {
      const days: any = {};
      performanceData.forEach(d => {
        const day = d.fecha.split('-')[2] || "??";
        if (!days[day]) days[day] = { name: day, in: 0, out: 0, net: 0 };
        const mult = d.tipo.includes('ingreso') ? 1 : -1;
        if (mult > 0) days[day].in += d.usd; else days[day].out += Math.abs(d.usd);
        days[day].net = days[day].in - days[day].out;
      });
      trendData = Object.keys(days).sort().map(k => days[k]);
    }

    // Performance Summary for selected period
    const mIn = performanceData.reduce((a, b) => a + (b.tipo.includes('ingreso') ? b.usd : 0), 0);
    const mOut = performanceData.reduce((a, b) => a + (b.tipo.includes('egreso') ? Math.abs(b.usd) : 0), 0);

    // List Filtering
    const viewFiltered = performanceData.filter(d => {
      const matchesSearch = !searchCat || d.cat.toLowerCase().includes(searchCat.toLowerCase()) || d.desc.toLowerCase().includes(searchCat.toLowerCase());
      return matchesSearch;
    });

    const getP = (tp: string) => {
      const dict: any = {};
      performanceData.filter(d => d.tipo.includes(tp)).forEach(d => { dict[d.cat] = (dict[d.cat] || 0) + Math.abs(d.usd); });
      return Object.keys(dict).map(k => ({ name: k, value: dict[k] })).sort((a, b) => b.value - a.value);
    };

    return {
      c: { u, vc, vb, vt: vc + vb, t: u + ((vc + vb) / tasa), d: dev },
      m: { in: mIn, out: mOut, total: viewFiltered.length, list: viewFiltered.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE) },
      p: { in: getP('ingreso'), out: getP('egreso') },
      trend: trendData
    };
  }, [data, filtroActivo, tasa, paginaActual, activeTab, searchCat]);

  useEffect(() => { setPaginaActual(1); }, [activeTab, filtroActivo, searchCat]);

  const handleEdit = (r: any) => { setEditingRow({ ...r }); setIsEditModalOpen(true); };
  const save = async () => { setSyncing(true); setIsEditModalOpen(false); fetchData(true); };

  const themeClass = isDark ? "bg-[#020306] text-slate-100 dark" : "bg-[#f8fafc] text-slate-900 light";
  const cardClass = isDark ? "bg-[#0a0c10] border-white/5 shadow-2xl shadow-black/40" : "bg-white border-slate-200 shadow-sm shadow-slate-200/50";
  const navClass = isDark ? "bg-[#0a0c10] border-white/5" : "bg-white border-slate-200 shadow-lg";

  if (loading) return (
    <div className={`min-h-screen ${themeClass} flex items-center justify-center`}>
      <div className="text-center animate-pulse">
        <Building2 className={`w-14 h-14 mx-auto mb-6 ${isDark ? 'text-blue-500' : 'text-blue-600'}`} />
        <p className="font-black uppercase tracking-[0.2em] text-[10px] opacity-50">Elite Admin Suite v9.8</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${themeClass} font-['Inter',sans-serif] flex flex-col md:flex-row transition-colors duration-500`}>

      {/* PROFESSIONAL NAVIGATION */}
      <nav className={`fixed bottom-0 md:relative w-full md:w-64 ${navClass} border-t md:border-t-0 md:border-r z-50 md:h-screen flex md:flex-col overflow-hidden`}>
        <div className="hidden md:flex p-6 items-center gap-3 border-b border-white/5 h-24">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-tighter">Elite <span className="text-blue-500">Admin</span></h1>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Gestión Inteligente</p>
          </div>
        </div>

        <div className="flex md:flex-col w-full md:p-4 overflow-x-auto md:overflow-y-auto no-scrollbar gap-1 p-2">
          <NavBtn active={activeTab === 'dash'} onClick={() => setActiveTab('dash')} icon={<LayoutDashboard />} label="Dashboard" isDark={isDark} />
          <NavBtn active={activeTab === 'income'} onClick={() => setActiveTab('income')} icon={<ArrowUpCircle />} label="Ingresos" isDark={isDark} />
          <NavBtn active={activeTab === 'expense'} onClick={() => setActiveTab('expense')} icon={<ArrowDownCircle />} label="Egresos" isDark={isDark} />
          <NavBtn active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<BadgeCheck />} label="Auditoría" isDark={isDark} />
        </div>

        <div className="hidden md:block mt-auto p-4 border-t border-white/5 space-y-2">
          <button onClick={() => setIsDark(!isDark)} className="w-full h-11 flex items-center justify-center gap-2 bg-white/5 rounded-xl text-[10px] font-black uppercase border border-white/5 hover:bg-white/10 transition-all">
            {isDark ? <><Sun className="w-4 h-4 text-amber-500" /> Claro</> : <><Moon className="w-4 h-4 text-blue-500" /> Oscuro</>}
          </button>
          <button onClick={() => window.open(FORM_URL, '_blank')} className="w-full bg-blue-600 text-white h-11 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all hover:bg-blue-500 shadow-xl shadow-blue-900/40">
            <PlusCircle className="w-4 h-4" /> Nuevo Asiento
          </button>
        </div>
      </nav>

      {/* WORKSPACE */}
      <main className="flex-1 h-screen overflow-y-auto pb-24 md:pb-0">

        {/* UPPER HEADER */}
        <header className={`sticky top-0 z-40 ${isDark ? 'bg-[#020306]/90' : 'bg-[#f8fafc]/90'} backdrop-blur-xl border-b ${isDark ? 'border-white/5' : 'border-slate-200'} p-4 md:px-8 flex flex-col lg:flex-row justify-between items-center gap-4`}>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 w-full lg:w-auto">
            {ALL_MONTHS.map(m => (
              <button key={m.id} onClick={() => setFiltroActivo(m.id)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${filtroActivo === m.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : isDark ? 'bg-white/5 border-transparent text-slate-500' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                {m.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <div className={`flex items-center gap-3 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'} px-5 py-2 rounded-xl border`}>
              <span className="text-[8px] font-black text-slate-500 uppercase">Tasa BCV</span>
              <span className={`text-[11px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{tasa.toFixed(2)}</span>
            </div>
            <button onClick={() => fetchData()} className={`p-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''} text-slate-500`} />
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">

          {activeTab === 'dash' && (
            <div className="animate-in fade-in duration-700 space-y-8">
              {/* KPIs TOTAL CONSOLIDADO v9.7 (SMART BALANCE) */}
              <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                <KpiTile label={`Saldo Caja Divisa`} val={`$${stats.c.u.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<Banknote />} c="blue" isDark={isDark} />
                <KpiTile label="Saldo Banco VES" val={`Bs. ${stats.c.vb.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<Landmark />} c="indigo" isDark={isDark} />
                <KpiTile label="Saldo Caja VES" val={`Bs. ${stats.c.vc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<Coins />} c="indigo" isDark={isDark} />
                <KpiTile
                  label="Saldo Total VES"
                  val={`Bs. ${stats.c.vt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  sub={`Disp: $${(stats.c.vt / tasa).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  icon={<RefreshCw className="w-4 h-4 opacity-70" />}
                  c="amber"
                  isDark={isDark}
                />
                <KpiTile label="Posición Neta ($)" val={`$${stats.c.t.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<Wallet />} c="emerald" isDark={isDark} />
                <KpiTile label="Histórico Deval." val={`-$${stats.c.d.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<DevaluationIcon />} c="rose" isDark={isDark} />
              </section>

              {/* PERFORMANCE CHART */}
              <div className={`${cardClass} rounded-[2rem] p-6 lg:p-10 transition-all`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tighter">
                      {filtroActivo === "ANUAL" ? "Movimiento Anual Institucional" : `Tráfico Mensual: ${filtroActivo.split('-')[1].toUpperCase()}`}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic opacity-60">
                      {filtroActivo === "ANUAL" ? "Balance por periodo mensual" : "Flujo diario de ingresos y egresos"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase border border-white/5 p-3 rounded-xl bg-white/[0.02]">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm" /> Ingresos</span>
                    <span className="flex items-center gap-2 text-rose-500"><div className="w-3 h-3 bg-rose-500 rounded-sm" /> Egresos</span>
                    <span className="flex items-center gap-2 text-emerald-500"><div className="w-4 h-1 bg-emerald-500 rounded-full" /> Flujo Neto</span>
                  </div>
                </div>
                <div className="h-[340px] lg:h-[420px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stats.trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 900, fill: isDark ? '#475569' : '#94a3b8' }}
                      />
                      <YAxis hide />
                      <Tooltip
                        formatter={(v: any) => [`$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]}
                        contentStyle={{ backgroundColor: isDark ? '#0a0c10' : '#fff', border: 'none', borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', fontSize: '12px', fontWeight: 900, color: isDark ? '#fff' : '#000' }}
                      />
                      <Bar dataKey="in" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={filtroActivo === "ANUAL" ? 28 : 12} />
                      <Bar dataKey="out" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={filtroActivo === "ANUAL" ? 28 : 12} />
                      <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={5} dot={{ r: filtroActivo === "ANUAL" ? 5 : 2.5, fill: '#10b981', strokeWidth: 0 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* TORTICAS (PERIODIC PERFORMANCE) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SmartPie title={`Fuentes de Ingreso (${filtroActivo === "ANUAL" ? 'Anual' : filtroActivo.split('-')[1].toUpperCase()})`} data={stats.p.in} isDark={isDark} />
                <SmartPie title={`Estructura de Gastos (${filtroActivo === "ANUAL" ? 'Anual' : filtroActivo.split('-')[1].toUpperCase()})`} data={stats.p.out} isDark={isDark} />
              </div>
            </div>
          )}

          {(activeTab === 'income' || activeTab === 'expense' || activeTab === 'audit') && (
            <div className="animate-in slide-in-from-right-10 duration-500 h-full space-y-4">

              <div className={`${cardClass} rounded-2xl p-4 flex items-center gap-4 border-l-4 ${activeTab === 'income' ? 'border-l-emerald-500' : activeTab === 'expense' ? 'border-l-rose-500' : 'border-l-blue-500'} transition-all`}>
                <div className="p-2.5 rounded-xl bg-white/5"><Search className="w-4 h-4 text-slate-500" /></div>
                <input
                  className={`flex-1 bg-transparent border-none outline-none text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'} placeholder:text-slate-600 uppercase tracking-widest`}
                  placeholder="Buscador inteligente (Concepto o Categoría)..."
                  value={searchCat}
                  onChange={(e) => setSearchCat(e.target.value)}
                />
                {searchCat && <button onClick={() => setSearchCat("")}><X className="w-4 h-4 text-slate-500 hover:text-white" /></button>}
              </div>

              <div className={`${cardClass} rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-2xl transition-all`}>
                <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white/[0.01]">
                  <div className="flex items-center gap-5">
                    <div className={`p-5 rounded-[1.25rem] ${activeTab === 'income' ? 'bg-emerald-500/10 text-emerald-500 shadow-xl shadow-emerald-500/10' : activeTab === 'expense' ? 'bg-rose-500/10 text-rose-500 shadow-xl shadow-rose-500/10' : 'bg-blue-500/10 text-blue-500 shadow-xl shadow-blue-500/10'}`}>
                      {activeTab === 'income' ? <ArrowUpCircle className="w-7 h-7" /> : activeTab === 'expense' ? <ArrowDownCircle className="w-7 h-7" /> : <BadgeCheck className="w-7 h-7" />}
                    </div>
                    <div>
                      <h3 className="text-[17px] font-black uppercase tracking-tighter leading-none">{activeTab === 'income' ? 'Registro de Ingresos' : activeTab === 'expense' ? 'Registro de Egresos' : 'Panel de Auditoría'}</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mt-2 italic opacity-50">{filtroActivo === "ANUAL" ? "HISTÓRICO ANUAL" : filtroActivo.split('-')[1].toUpperCase()} • {stats.m.total} MOVIMIENTOS</p>
                    </div>
                  </div>
                  <Pagination cur={paginaActual} total={Math.ceil(stats.m.total / PAGE_SIZE)} onCh={setPaginaActual} isDark={isDark} />
                </div>
                <div className="overflow-auto max-h-[65vh] md:max-h-full scrollbar-thin">
                  <table className="w-full text-left text-[11px] border-collapse min-w-[800px]">
                    <thead className={`sticky top-0 ${isDark ? 'bg-[#0e1117]' : 'bg-slate-100'} z-10 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                      <tr>
                        <th className="px-10 py-6 text-slate-500 uppercase font-black tracking-widest text-[10px]">Asiento / Detalles</th>
                        <th className="px-10 py-6 text-center text-slate-500 uppercase font-black tracking-widest text-[10px]">Categoría</th>
                        <th className="px-10 py-6 text-right text-slate-500 uppercase font-black tracking-widest text-[10px]">Origen</th>
                        <th className="px-10 py-6 text-right text-slate-500 uppercase font-black tracking-widest text-[10px] text-[12px]">Equiv. USD</th>
                        {activeTab === 'audit' && <th className="px-10 py-6 text-center text-slate-500 uppercase font-black tracking-widest text-[10px]">Acción</th>}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-slate-200'}`}>
                      {stats.m.list.map((r, i) => (
                        <AsientoRow key={i} r={r} isDark={isDark} showAudit={activeTab === 'audit'} onAudit={() => handleEdit(r)} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AUDIT MODAL MODERNO */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl">
            <div className={`${isDark ? 'bg-[#0f1218]' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-slate-200'} rounded-[3rem] w-full max-w-sm overflow-hidden animate-in zoom-in duration-300 shadow-3xl shadow-blue-500/20`}>
              <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center text-slate-100">
                <h3 className="text-xs font-black uppercase flex gap-3 items-center tracking-[0.2em] opacity-80">Edición de Control</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="bg-white/5 p-2 rounded-full hover:text-white transition-all hover:rotate-90">✕</button>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-3 font-black">
                  <label className="text-[9px] text-slate-600 uppercase tracking-widest ml-1">Concepto del Asiento</label>
                  <input className={`w-full ${isDark ? 'bg-white/5 border-white/10 text-white shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'} p-5 rounded-2xl text-[13px] outline-none focus:border-blue-500 border-2 transition-all font-black uppercase tracking-tight`} value={editingRow.desc} onChange={(e) => setEditingRow({ ...editingRow, desc: e.target.value })} />
                </div>
                <div className="space-y-3 font-black">
                  <label className="text-[9px] text-slate-600 uppercase tracking-widest ml-1">Clasificación Categoría</label>
                  <select className={`w-full ${isDark ? 'bg-white/5 border-white/10 text-white shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'} p-5 rounded-2xl text-[13px] outline-none appearance-none border-2 font-black uppercase tracking-tight`} value={editingRow.cat} onChange={(e) => setEditingRow({ ...editingRow, cat: e.target.value })}>
                    <option value="General">General</option><option value="Diezmos">Diezmos</option><option value="Ofrendas Generales">Ofrendas</option><option value="Construcción">Construcción</option><option value="Mantenimiento">Mantenimiento</option><option value="Personal">Personal</option><option value="Misiones">Misiones</option><option value="Eventos">Eventos</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-5 text-[10px] font-black text-slate-500 bg-white/5 rounded-2xl uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">Cancelar</button>
                  <button onClick={save} className="flex-1 py-5 text-[10px] font-black bg-blue-600 text-white rounded-2xl uppercase shadow-2xl shadow-blue-500/50 hover:bg-blue-500 transition-all active:scale-95">Sincronizar</button>
                </div>
                <p className="text-[9px] text-center text-slate-600 font-extrabold uppercase flex justify-center gap-3 mt-4 opacity-40 italic tracking-widest"><ShieldCheck className="w-4 h-4" /> Registro Auditado hacia la Nube</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// --- SUB-COMPONENTES ATÓMICOS v9.7 ---
const NavBtn = ({ active, onClick, icon, label, isDark }: any) => {
  const c = active ? isDark ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/20' : 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40' : (isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 shadow-sm');
  return (
    <button onClick={onClick} className={`flex flex-col md:flex-row items-center gap-2.5 p-3.5 md:px-5 md:py-3.5 rounded-xl transition-all font-black uppercase text-[10px] md:text-[11px] flex-1 md:flex-none ${c}`}>
      <div className="w-5 h-5">{icon}</div>
      <span className="tracking-[0.15em]">{label}</span>
    </button>
  );
};

const KpiTile = ({ label, val, sub, icon, c, isDark }: any) => {
  const colorMap: any = {
    blue: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
    indigo: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
    rose: 'text-rose-500 bg-rose-500/5 border-rose-500/10',
    amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10'
  };
  return (
    <div className={`${isDark ? 'bg-[#0a0c10] border-white/5' : 'bg-white border-slate-100 shadow-md'} ${colorMap[c]} p-6 rounded-[2rem] border flex flex-col items-center text-center transition-all hover:scale-[1.03] group`}>
      <div className={`mb-3 opacity-60 transition-all group-hover:opacity-100 group-hover:scale-110`}>{icon}</div>
      <p className={`text-[8px] font-black uppercase tracking-widest mb-1.5 italic leading-tight ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
      <h4 className={`text-[14px] font-black leading-none tracking-tighter whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>{val}</h4>
      {sub && <p className="text-[10px] font-black mt-1.5 opacity-80 tracking-tighter">{sub}</p>}
    </div>
  );
};

const SmartPie = ({ title, data, isDark }: any) => (
  <div className={`${isDark ? 'bg-[#0a0c10] border-white/5' : 'bg-white border-slate-100 shadow-lg'} p-10 rounded-[2.5rem] border transition-all hover:shadow-blue-500/5`}>
    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-12 text-center italic opacity-70 border-b border-white/5 pb-4">{title}</h3>
    <div className="h-[260px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={85} outerRadius={120} paddingAngle={8} dataKey="value">
            {data.map((_: any, i: any) => (<Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />))}
          </Pie>
          <Tooltip
            formatter={(v: any) => [`$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]}
            contentStyle={{ backgroundColor: isDark ? '#0a0c10' : '#fff', border: 'none', borderRadius: '20px', fontSize: '11px', fontWeight: '900', color: isDark ? '#fff' : '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[130px]">
        <p className="text-[12px] font-black uppercase leading-tight truncate px-2" style={{ color: isDark ? '#fff' : '#000' }}>{data[0]?.name || 'N/A'}</p>
        <div className="w-8 h-px bg-blue-500/30 mx-auto my-2" />
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Mayor Tráfico</p>
      </div>
    </div>
    <div className="mt-12 grid grid-cols-2 gap-4">
      {data.slice(0, 4).map((m: any, i: any) => (
        <div key={i} className={`${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'} p-5 rounded-2xl flex flex-col items-start border transition-all hover:bg-blue-600/5`}>
          <span className="text-[9px] font-black text-slate-500 uppercase truncate w-full mb-1">{m.name}</span>
          <span className={`text-[15px] font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>${m.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      ))}
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

const AsientoRow = ({ r, isDark, showAudit, onAudit }: any) => {
  const isI = r.tipo.includes('ingreso');
  return (
    <tr className={`group transition-all ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-blue-50'} duration-300`}>
      <td className="px-10 py-7">
        <div className="flex flex-col gap-2">
          <span className={`text-[14px] font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} transition-all group-hover:translate-x-1`}>{r.desc || 'MOVIMIENTO SIN DETALLE'}</span>
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] opacity-40">
            <span>{r.fecha}</span><div className="w-2 h-px bg-slate-700" /><span>{r.met}</span>
          </div>
        </div>
      </td>
      <td className="px-10 py-7 text-center">
        <span className={`px-5 py-2 rounded-xl text-[10px] font-extrabold border ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-600'} uppercase tracking-widest shadow-sm`}>{r.cat}</span>
      </td>
      <td className={`px-10 py-7 text-right font-black ${isDark ? 'text-slate-500' : 'text-slate-400'} font-mono tracking-tighter uppercase text-[12px]`}>
        {r.mon_orig} {r.m_orig.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className={`px-10 py-7 text-right font-black text-[17px] ${isI ? 'text-emerald-500' : 'text-rose-500'} tracking-tighter`}>
        {isI ? '+' : '-'}${Math.abs(r.usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      {showAudit && (
        <td className="px-10 py-7 text-center">
          <button onClick={onAudit} className="p-3.5 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-[1.25rem] transition-all border border-blue-500/40 shadow-xl shadow-blue-500/10 active:scale-90">
            <Edit3 className="w-4 h-4" />
          </button>
        </td>
      )}
    </tr>
  );
};

export default App;
