import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { vencimentoAposExclusao } from "@/lib/pagamentos";
import type { PagamentoComCliente } from "@/types/assinaturas";

export const pagamentosQueryKey = ["pagamentos"] as const;

// Mesma chave usada por useClientes; declarada aqui para evitar import circular.
const clientesQueryKey = ["clientes"] as const;

const SELECT_PAGAMENTO = "*, clientes(id, nome_completo, whatsapp)";

export function usePagamentos() {
  return useQuery({
    queryKey: pagamentosQueryKey,
    queryFn: async (): Promise<PagamentoComCliente[]> => {
      const { data, error } = await supabase
        .from("pagamentos")
        .select(SELECT_PAGAMENTO)
        .order("data_pagamento", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PagamentoComCliente[];
    },
  });
}

export function usePagamentosDoCliente(clienteId: string | undefined) {
  return useQuery({
    queryKey: [...pagamentosQueryKey, "cliente", clienteId],
    enabled: Boolean(clienteId),
    queryFn: async (): Promise<PagamentoComCliente[]> => {
      const { data, error } = await supabase
        .from("pagamentos")
        .select(SELECT_PAGAMENTO)
        .eq("cliente_id", clienteId as string)
        .order("data_pagamento", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PagamentoComCliente[];
    },
  });
}

export interface ResultadoExclusaoPagamento {
  vencimentoRevertidoPara: string | null;
}

/**
 * Exclui um pagamento registrado por engano (ex.: cobrança duplicada).
 * Após a exclusão, o próximo vencimento do cliente é recalculado pela cadeia de
 * pagamentos que continua existindo — indicadores derivados (situação, valor em dia,
 * valor vencido) acompanham automaticamente.
 */
export function useExcluirPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      pagamento: Pick<
        PagamentoComCliente,
        "id" | "cliente_id" | "vencimento_anterior" | "vencimento_novo"
      >,
    ): Promise<ResultadoExclusaoPagamento> => {
      const { data: irmaos, error: erroIrmaos } = await supabase
        .from("pagamentos")
        .select("id, vencimento_anterior, vencimento_novo")
        .eq("cliente_id", pagamento.cliente_id);
      if (erroIrmaos) throw erroIrmaos;

      const { error: erroExclusao } = await supabase
        .from("pagamentos")
        .delete()
        .eq("id", pagamento.id);
      if (erroExclusao) throw erroExclusao;

      const { data: cliente, error: erroCliente } = await supabase
        .from("clientes")
        .select("id, proximo_vencimento")
        .eq("id", pagamento.cliente_id)
        .maybeSingle();
      if (erroCliente) throw erroCliente;

      const novoVencimento = vencimentoAposExclusao({
        excluido: {
          id: pagamento.id,
          vencimento_anterior: pagamento.vencimento_anterior,
          vencimento_novo: pagamento.vencimento_novo,
        },
        outrosPagamentos: (irmaos ?? []).filter((irmao) => irmao.id !== pagamento.id),
        vencimentoAtualCliente: cliente?.proximo_vencimento ?? null,
      });

      if (!cliente || !novoVencimento) return { vencimentoRevertidoPara: null };

      const { error: erroAtualizacao } = await supabase
        .from("clientes")
        .update({ proximo_vencimento: novoVencimento })
        .eq("id", cliente.id);
      if (erroAtualizacao) throw erroAtualizacao;

      return { vencimentoRevertidoPara: novoVencimento };
    },
    onSuccess: () => {
      // refetchType "all" garante que telas fora de foco (Dashboard, detalhes) também
      // recarreguem e deixem de somar o pagamento excluído.
      queryClient.invalidateQueries({ queryKey: pagamentosQueryKey, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: clientesQueryKey, refetchType: "all" });
    },
  });
}
