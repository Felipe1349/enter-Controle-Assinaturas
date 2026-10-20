import { nomeDoMes } from "@/lib/format";
import type { Pagamento } from "@/types/assinaturas";

export interface MesRegistrado {
  valor: string;
  label: string;
}

/** Meses (YYYY-MM) que possuem pagamentos, do mais recente para o mais antigo. */
export function registrarPorMes(pagamentos: Pagamento[]): MesRegistrado[] {
  const meses = new Set(pagamentos.map((pagamento) => pagamento.data_pagamento.slice(0, 7)));
  return [...meses]
    .sort((a, b) => b.localeCompare(a))
    .map((valor) => {
      const [ano, mes] = valor.split("-");
      return { valor, label: `${nomeDoMes(Number(mes) - 1)} de ${ano}` };
    });
}

interface PagamentoComVencimentos {
  vencimento_anterior: string | null;
  vencimento_novo: string | null;
}

/**
 * Decide para qual data volta o próximo vencimento do cliente ao excluir um pagamento.
 * Retorna a nova data ou `null` quando nada deve ser alterado:
 * - o pagamento não tem as datas de referência;
 * - o vencimento atual do cliente não foi gerado por esse pagamento;
 * - outro pagamento do mesmo cliente ainda justifica a data atual (ex.: duplicata idêntica).
 */
export function vencimentoAposExclusao({
  excluido,
  outrosPagamentos,
  vencimentoAtualCliente,
}: {
  excluido: PagamentoComVencimentos;
  outrosPagamentos: Pick<PagamentoComVencimentos, "vencimento_novo">[];
  vencimentoAtualCliente: string | null;
}): string | null {
  if (!excluido.vencimento_anterior || !excluido.vencimento_novo) return null;
  if (vencimentoAtualCliente !== excluido.vencimento_novo) return null;

  const outroJustifica = outrosPagamentos.some(
    (pagamento) => pagamento.vencimento_novo === excluido.vencimento_novo,
  );
  if (outroJustifica) return null;

  return excluido.vencimento_anterior;
}
