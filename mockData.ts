
import { Transaction } from './types';

export const MOCK_DATA: Transaction[] = [
  { id: "1", fecha: "2026-01-10", mes: "01-ene", tipo: "Ingreso", categoria: "Diezmos", descripcion: "Sonia - Pago Movil", metodo: "Pago Móvil / Transferencia Bs", total_usd: 120, total_ves: 4320 },
  { id: "2", fecha: "2026-01-12", mes: "01-ene", tipo: "Egreso", categoria: "Mantenimiento", descripcion: "Limpieza - Efectivo Bs", metodo: "Efectivo Bs", total_usd: 10, total_ves: 360 },
  { id: "3", fecha: "2026-01-15", mes: "01-ene", tipo: "Ingreso", categoria: "Ofrendas", descripcion: "Ofrenda - USD Cash", metodo: "Efectivo USD", total_usd: 50, total_ves: 1800 },
  { id: "4", fecha: "2026-02-05", mes: "02-feb", tipo: "Ingreso", categoria: "Diezmos", descripcion: "Zelle Transfer", metodo: "Transferencia USD", total_usd: 200, total_ves: 7200 },
  { id: "5", fecha: "2026-02-15", mes: "02-feb", tipo: "Egreso", categoria: "Servicios", descripcion: "Pago Luz - Bs Transfer", metodo: "Pago Móvil / Transferencia Bs", total_usd: 15, total_ves: 540 },
  { id: "6", fecha: "2026-03-10", mes: "03-mar", tipo: "Ingreso", categoria: "Especiales", descripcion: "Donacion Pro-Templo", metodo: "Efectivo USD", total_usd: 500, total_ves: 18000 },
  { id: "7", fecha: "2026-04-10", mes: "04-abr", tipo: "Ingreso", categoria: "Ofrendas", descripcion: "Ofrenda Q2", metodo: "Pago Móvil / Transferencia Bs", total_usd: 100, total_ves: 3600 }
];
