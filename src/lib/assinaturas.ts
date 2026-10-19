import { MESES_ABREVIADOS, paraData, paraISO } from "@/lib/format";
import type {
  ClienteComRelacoes,
  Pagamento,
  Plano,
  StatusCliente,
} from "@/types/assinaturas";

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function hojeISO(): string {
  return paraISO(new Date());
}

export function adicionarDias(iso: string, dias: number): string {
  const data = paraData(iso);
  data.setDate(data.getDate() + dias);
  return paraISO(data);
}

/** Diferença em dias entre o vencimento e a data de referência (padrão: hoje). */
export function diasAteVencimento(iso: string, referencia: string = hojeISO()): number {
  return Math.round(
    (paraData(iso).getTime() - paraData(referencia).getTime()) / MS_POR_DIA,
  );
}

export type StatusCobranca = "urgente" | "hoje" | "atencao" | "em_dia";

export const STATUS_COBRANCA_LABEL: Record<StatusCobranca, string> = {
  urgente: "Cobrar Urgente",
  hoje: "Cobrar Hoje",
  atencao: "Atenção",
  em_dia: "Em Dia",
};

/**
 * Regra do documento:
 * vencido -> Cobrar Urgente | hoje -> Cobrar Hoje | 1 a 2 dias -> Atenção | 3 dias ou mais -> Em Dia
 */
export function statusCobranca(dias: number): StatusCobranca {
  if (dias < 0) return "urgente";
  if (dias === 0) return "hoje";
  if (dias <= 2) return "atencao";
  return "em_dia";
}

/** Coluna de validade: "VENCIDO HÁ X DIAS" | "VENCE HOJE" | "RESTAM X DIAS" */
export function validadeLabel(dias: number): string {
  if (dias < 0) {
    const total = Math.abs(dias);
    return `VENCIDO HÁ ${total} ${total === 1 ? "DIA" : "DIAS"}`;
  }
  if (dias === 0) return "VENCE HOJE";
  return `RESTAM ${dias} ${dias === 1 ? "DIA" : "DIAS"}`;
}

export type SituacaoFinanceira = "em_dia" | "proximos_7" | "vence_hoje" | "vencidos";

export const SITUACAO_LABEL: Record<SituacaoFinanceira, string> = {
  em_dia: "Em Dia",
  proximos_7: "Próximos 7 dias",
  vence_hoje: "Vence Hoje",
  vencidos: "Vencidos",
};

export const SITUACAO_ORDEM: SituacaoFinanceira[] = [
  "em_dia",
  "proximos_7",
  "vence_hoje",
  "vencidos",
];

/** Buckets do gráfico de situação financeira. */
export function situacaoFinanceira(dias: number): SituacaoFinanceira {
  if (dias < 0) return "vencidos";
  if (dias === 0) return "vence_hoje";
  if (dias <= 7) return "proximos_7";
  return "em_dia";
}

/**
 * Novo vencimento após um pagamento, mantendo a periodicidade do plano:
 * em atraso -> data do pagamento + intervalo; dentro do prazo/antecipado -> vencimento atual + intervalo.
 */
export function calcularNovoVencimento(
  proximoVencimento: string,
  dataPagamento: string,
  intervaloDias: number,
): string {
  const emAtraso = diasAteVencimento(proximoVencimento, dataPagamento) < 0;
  const base = emAtraso ? dataPagamento : proximoVencimento;
  return adicionarDias(base, intervaloDias);
}

export interface SituacaoCliente {
  dias: number;
  status: StatusCobranca;
  situacao: SituacaoFinanceira;
  validade: string;
}

export function situacaoDoCliente(
  cliente: Pick<ClienteComRelacoes, "proximo_vencimento">,
  referencia: string = hojeISO(),
): SituacaoCliente {
  const dias = diasAteVencimento(cliente.proximo_vencimento, referencia);
  return {
    dias,
    status: statusCobranca(dias),
    situacao: situacaoFinanceira(dias),
    validade: validadeLabel(dias),
  };
}

export type FiltroRapido =
  | "todos"
  | "em_dia"
  | "vence_hoje"
  | "proximos_3"
  | "vencidos"
  | "ativos"
  | "inativos";

export const FILTROS_RAPIDOS: { valor: FiltroRapido; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "em_dia", label: "Em Dia" },
  { valor: "vence_hoje", label: "Vence Hoje" },
  { valor: "proximos_3", label: "Próximos 3 dias" },
  { valor: "vencidos", label: "Vencidos" },
  { valor: "ativos", label: "Ativos" },
  { valor: "inativos", label: "Inativos" },
];

export function aplicarFiltroRapido(
  cliente: ClienteComRelacoes,
  filtro: FiltroRapido,
  referencia: string = hojeISO(),
): boolean {
  if (filtro === "todos") return true;
  if (filtro === "ativos") return cliente.status === "ativo";
  if (filtro === "inativos") return cliente.status === "inativo";

  const { dias } = situacaoDoCliente(cliente, referencia);
  if (filtro === "vencidos") return dias < 0;
  if (filtro === "vence_hoje") return dias === 0;
  if (filtro === "proximos_3") return dias >= 1 && dias <= 3;
  return dias > 3;
}

export interface AlertasCobranca {
  vencidos: ClienteComRelacoes[];
  vencemHoje: ClienteComRelacoes[];
  proximos3Dias: ClienteComRelacoes[];
  semPagamento60Dias: ClienteComRelacoes[];
}

export function calcularAlertas(
  clientes: ClienteComRelacoes[],
  pagamentos: Pagamento[],
  referencia: string = hojeISO(),
  diasSemPagamento = 60,
): AlertasCobranca {
  const ativos = clientes.filter((cliente) => cliente.status === "ativo");
  const ultimoPagamento = new Map<string, string>();
  for (const pagamento of pagamentos) {
    const atual = ultimoPagamento.get(pagamento.cliente_id);
    if (!atual || pagamento.data_pagamento > atual) {
      ultimoPagamento.set(pagamento.cliente_id, pagamento.data_pagamento);
    }
  }

  const ordenar = (lista: ClienteComRelacoes[]) =>
    lista.sort(
      (a, b) => diasAteVencimento(a.proximo_vencimento, referencia) - diasAteVencimento(b.proximo_vencimento, referencia),
    );

  return {
    vencidos: ordenar(ativos.filter((c) => diasAteVencimento(c.proximo_vencimento, referencia) < 0)),
    vencemHoje: ordenar(ativos.filter((c) => diasAteVencimento(c.proximo_vencimento, referencia) === 0)),
    proximos3Dias: ordenar(
      ativos.filter((c) => {
        const dias = diasAteVencimento(c.proximo_vencimento, referencia);
        return dias >= 1 && dias <= 3;
      }),
    ),
    semPagamento60Dias: clientes.filter((c) => {
      const ultimo = ultimoPagamento.get(c.id);
      if (!ultimo) return true;
      return diasAteVencimento(ultimo, referencia) < -diasSemPagamento;
    }),
  };
}

export interface MetricasDashboard {
  totalClientes: number;
  ativos: number;
  inativos: number;
  novos: number;
  recorrentes: number;
  vencidos: number;
  valorCarteira: number;
  valorEmDia: number;
  valorVencido: number;
  mrr: number;
  totalRecebidoMes: number;
  totalEmAberto: number;
  ticketMedio: number;
  taxaInadimplencia: number;
}

const MES_CORRENTE = (referencia: string) => referencia.slice(0, 7);

export function calcularMetricas(
  clientes: ClienteComRelacoes[],
  pagamentos: Pagamento[],
  referencia: string = hojeISO(),
): MetricasDashboard {
  const ativos = clientes.filter((c) => c.status === "ativo");
  const mes = MES_CORRENTE(referencia);

  const pagamentosPorCliente = new Map<string, number>();
  for (const pagamento of pagamentos) {
    pagamentosPorCliente.set(
      pagamento.cliente_id,
      (pagamentosPorCliente.get(pagamento.cliente_id) ?? 0) + 1,
    );
  }

  const emDia = ativos.filter((c) => diasAteVencimento(c.proximo_vencimento, referencia) >= 0);
  const vencidosLista = ativos.filter((c) => diasAteVencimento(c.proximo_vencimento, referencia) < 0);

  const somar = (lista: ClienteComRelacoes[]) =>
    lista.reduce((total, cliente) => total + Number(cliente.valor), 0);

  const pagamentosDoMes = pagamentos.filter((p) => p.data_pagamento.slice(0, 7) === mes);
  const recebidoMes = pagamentosDoMes.reduce((t, p) => t + Number(p.valor_pago), 0);

  const fimDoMes = `${mes}-31`;
  const emAberto = ativos
    .filter((c) => c.proximo_vencimento.slice(0, 10) <= fimDoMes)
    .reduce((total, cliente) => total + Number(cliente.valor), 0);

  const mrr = ativos.reduce((total, cliente) => {
    const intervalo = cliente.planos?.intervalo_dias ?? 30;
    return total + (Number(cliente.valor) * 30) / intervalo;
  }, 0);

  return {
    totalClientes: clientes.length,
    ativos: ativos.length,
    inativos: clientes.length - ativos.length,
    novos: clientes.filter((c) => diasAteVencimento(c.data_cadastro, referencia) >= -30).length,
    recorrentes: clientes.filter((c) => (pagamentosPorCliente.get(c.id) ?? 0) >= 2).length,
    vencidos: vencidosLista.length,
    valorCarteira: somar(ativos),
    valorEmDia: somar(emDia),
    valorVencido: somar(vencidosLista),
    mrr,
    totalRecebidoMes: recebidoMes,
    totalEmAberto: emAberto,
    ticketMedio: pagamentosDoMes.length > 0 ? recebidoMes / pagamentosDoMes.length : 0,
    taxaInadimplencia: ativos.length > 0 ? (vencidosLista.length / ativos.length) * 100 : 0,
  };
}

export interface ReceitaMensal {
  mes: string;
  rotulo: string;
  total: number;
}

/** Receita recebida por mês nos últimos N meses (do mais antigo para o mais recente). */
export function calcularReceitaMensal(
  pagamentos: Pagamento[],
  meses = 12,
  referencia: string = hojeISO(),
): ReceitaMensal[] {
  const base = paraData(referencia);
  base.setDate(1);
  const resultado: ReceitaMensal[] = [];

  for (let i = meses - 1; i >= 0; i -= 1) {
    const data = new Date(base.getFullYear(), base.getMonth() - i, 1);
    const chave = `${data.getFullYear()}-${`${data.getMonth() + 1}`.padStart(2, "0")}`;
    const total = pagamentos
      .filter((p) => p.data_pagamento.slice(0, 7) === chave)
      .reduce((t, p) => t + Number(p.valor_pago), 0);
    resultado.push({ mes: chave, rotulo: MESES_ABREVIADOS[data.getMonth()], total });
  }

  return resultado;
}

export function intervaloDoPlano(plano: Plano | null | undefined): number {
  return plano?.intervalo_dias ?? 30;
}

export function contarPorStatus(clientes: ClienteComRelacoes[]): { status: StatusCliente; label: string; total: number }[] {
  return [
    { status: "ativo", label: "Ativo", total: clientes.filter((c) => c.status === "ativo").length },
    { status: "inativo", label: "Inativo", total: clientes.filter((c) => c.status === "inativo").length },
  ];
}

export function contarPorEmpresa(
  clientes: ClienteComRelacoes[],
): { empresa: string; total: number }[] {
  const mapa = new Map<string, number>();
  for (const cliente of clientes) {
    const nome = cliente.empresas?.nome ?? "Sem empresa";
    mapa.set(nome, (mapa.get(nome) ?? 0) + 1);
  }
  return [...mapa.entries()]
    .map(([empresa, total]) => ({ empresa, total }))
    .sort((a, b) => b.total - a.total);
}
