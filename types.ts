
export interface Transaction {
  id: string;
  fecha: string;
  mes: string;
  tipo: string;
  categoria: string;
  descripcion: string;
  metodo: string;
  total_usd: number;
  total_ves: number;
}

export interface MonthlySummary {
  mes: string;
  ingresos: number;
  egresos: number;
}

export type ViewPeriod = 'Mensual' | 'Trimestral' | 'Anual';
