export type StatusCliente = "ativo" | "inativo";

export type Responsavel = "LUCAS" | "KALLEU";

export const RESPONSAVEIS: { valor: Responsavel; label: string }[] = [
  { valor: "LUCAS", label: "LUCAS" },
  { valor: "KALLEU", label: "KALLEU" },
];

export type FormaPagamento = "pix" | "cartao" | "dinheiro" | "transferencia";

export interface Empresa {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
}

export interface Plano {
  id: string;
  nome: string;
  valor_padrao: number;
  intervalo_dias: number;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

export interface Cliente {
  id: string;
  nome_completo: string;
  email: string | null;
  responsavel: Responsavel | null;
  whatsapp: string | null;
  empresa_id: string | null;
  plano_id: string | null;
  valor: number;
  data_cadastro: string;
  proximo_vencimento: string;
  status: StatusCliente;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClienteComRelacoes extends Cliente {
  empresas: Empresa | null;
  planos: Plano | null;
}

export interface Pagamento {
  id: string;
  cliente_id: string;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: FormaPagamento;
  observacao: string | null;
  vencimento_anterior: string | null;
  vencimento_novo: string | null;
  created_at: string;
}

export interface PagamentoComCliente extends Pagamento {
  clientes: { id: string; nome_completo: string; whatsapp: string | null } | null;
}

export interface Configuracao {
  id: string;
  chave: string;
  valor: string | null;
  created_at: string;
}

export interface ClienteFormulario {
  nome_completo: string;
  responsavel: string;
  whatsapp: string;
  empresa_id: string;
  plano_id: string;
  valor: string;
  data_cadastro: string;
  proximo_vencimento: string;
  status: StatusCliente;
  observacoes: string;
}

export interface PagamentoFormulario {
  valor_pago: string;
  data_pagamento: string;
  forma_pagamento: FormaPagamento;
  observacao: string;
}

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
};

export const FORMAS_PAGAMENTO: FormaPagamento[] = [
  "pix",
  "cartao",
  "dinheiro",
  "transferencia",
];

export const STATUS_CLIENTE_LABEL: Record<StatusCliente, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
};
