import { nomeDoMes } from "@/lib/format";
import { hojeISO } from "@/lib/assinaturas";
import type { DespesaLancamento, ResumoCaixa } from "@/types/caixa";

/** Primeiro dia do mês de referência (YYYY-MM-01). */
export function competenciaDe(iso: string = hojeISO()): string {
  return `${iso.slice(0, 7)}-01`;
}

export function mudarCompetencia(competencia: string, meses: number): string {
  const [ano, mes] = competencia.split("-").map(Number);
  const data = new Date(ano, mes - 1 + meses, 1);
  return `${data.getFullYear()}-${`${data.getMonth() + 1}`.padStart(2, "0")}-01`;
}

export function rotuloCompetencia(competencia: string): string {
  const [ano, mes] = competencia.split("-").map(Number);
  return `${nomeDoMes(mes - 1)} de ${ano}`;
}

/** Data de vencimento no mês, respeitando meses mais curtos (ex.: dia 31 em fevereiro). */
export function dataVencimentoNoMes(competencia: string, dia: number): string {
  const [ano, mes] = competencia.split("-").map(Number);
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const diaFinal = Math.min(Math.max(dia, 1), ultimoDia);
  return `${competencia.slice(0, 8)}${`${diaFinal}`.padStart(2, "0")}`;
}

/** Totais do mês + dinheiro disponível (somente despesas pagas são descontadas). */
export function calcularResumoCaixa(
  valorInformado: number,
  lancamentos: DespesaLancamento[],
): ResumoCaixa {
  const doMes = lancamentos;
  const totalFixas = doMes
    .filter((item) => item.fixa_id !== null)
    .reduce((total, item) => total + Number(item.valor), 0);
  const totalOutras = doMes
    .filter((item) => item.fixa_id === null)
    .reduce((total, item) => total + Number(item.valor), 0);
  const totalPagas = doMes
    .filter((item) => item.status === "pago")
    .reduce((total, item) => total + Number(item.valor), 0);
  const totalPendentes = doMes
    .filter((item) => item.status === "pendente")
    .reduce((total, item) => total + Number(item.valor), 0);

  return {
    valorInformado,
    totalFixas,
    totalOutras,
    totalPagas,
    totalPendentes,
    disponivel: valorInformado - totalPagas,
  };
}
