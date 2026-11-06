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
  id: string;
  vencimento_anterior: string | null;
  vencimento_novo: string | null;
}

/**
 * Recalcula o próximo vencimento do cliente a partir dos pagamentos que continuam existindo.
 *
 * Só altera a data quando o vencimento atual foi gerado pela cadeia de pagamentos
 * (é o maior `vencimento_novo` registrado). Se a data foi ajustada manualmente no
 * cadastro do cliente, nada é alterado.
 *
 * Sem pagamentos restantes, volta para `vencimento_anterior` do pagamento excluído.
 */
export function vencimentoAposExclusao({
  excluido,
  outrosPagamentos,
  vencimentoAtualCliente,
}: {
  excluido: PagamentoComVencimentos;
  outrosPagamentos: PagamentoComVencimentos[];
  vencimentoAtualCliente: string | null;
}): string | null {
  const maior = (lista: PagamentoComVencimentos[]): string | null =>
    lista.reduce<string | null>((maximo, pagamento) => {
      const data = pagamento.vencimento_novo;
      if (!data) return maximo;
      return !maximo || data > maximo ? data : maximo;
    }, null);

  const cadeiaCompleta = maior([excluido, ...outrosPagamentos]);
  if (!cadeiaCompleta || vencimentoAtualCliente !== cadeiaCompleta) return null;

  const novo = maior(outrosPagamentos) ?? excluido.vencimento_anterior;
  if (!novo || novo === vencimentoAtualCliente) return null;

  return novo;
}
