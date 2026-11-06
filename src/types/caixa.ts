export type StatusDespesa = "pendente" | "pago";

export interface CaixaSaldo {
  id: string;
  valor: number;
  atualizado_em: string;
}

export interface DespesaFixa {
  id: string;
  descricao: string;
  valor: number;
  dia_vencimento: number;
  ativo: boolean;
  created_at: string;
}

export interface DespesaLancamento {
  id: string;
  fixa_id: string | null;
  descricao: string;
  valor: number;
  categoria: string | null;
  competencia: string;
  data_vencimento: string;
  status: StatusDespesa;
  pago_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumoCaixa {
  valorInformado: number;
  totalFixas: number;
  totalOutras: number;
  totalPagas: number;
  totalPendentes: number;
  disponivel: number;
}

export interface DespesaEventualFormulario {
  descricao: string;
  valor: string;
  categoria: string;
  data_vencimento: string;
}

export const CATEGORIAS_DESPESA = [
  "Operacional",
  "Pessoal",
  "Impostos",
  "Marketing",
  "Equipamentos",
  "Outros",
];
