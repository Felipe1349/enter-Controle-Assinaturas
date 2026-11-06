import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { paraNumero } from "@/lib/format";
import type {
  ClienteComRelacoes,
  ClienteFormulario,
  PagamentoFormulario,
} from "@/types/assinaturas";

import { calcularNovoVencimento, intervaloDoPlano } from "@/lib/assinaturas";
import { pagamentosQueryKey } from "@/hooks/use-pagamentos";

export const clientesQueryKey = ["clientes"] as const;

const SELECT_CLIENTE = "*, empresas(*), planos(*)";

export function paraPayloadCliente(dados: ClienteFormulario) {
  const responsavelValido =
    dados.responsavel === "LUCAS" || dados.responsavel === "KALLEO"
      ? dados.responsavel
      : null;

  return {
    nome_completo: dados.nome_completo.trim(),
    responsavel: responsavelValido,
    whatsapp: dados.whatsapp.trim() || null,
    empresa_id: dados.empresa_id || null,
    plano_id: dados.plano_id || null,
    valor: paraNumero(dados.valor),
    data_cadastro: dados.data_cadastro,
    proximo_vencimento: dados.proximo_vencimento,
    status: dados.status,
    observacoes: dados.observacoes.trim() || null,
  };
}

export function useClientes() {
  return useQuery({
    queryKey: clientesQueryKey,
    queryFn: async (): Promise<ClienteComRelacoes[]> => {
      const { data, error } = await supabase
        .from("clientes")
        .select(SELECT_CLIENTE)
        .order("proximo_vencimento", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as ClienteComRelacoes[];
    },
  });
}

export function useCliente(id: string | undefined) {
  return useQuery({
    queryKey: [...clientesQueryKey, id],
    enabled: Boolean(id),
    queryFn: async (): Promise<ClienteComRelacoes | null> => {
      const { data, error } = await supabase
        .from("clientes")
        .select(SELECT_CLIENTE)
        .eq("id", id as string)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as ClienteComRelacoes) ?? null;
    },
  });
}

export function useSalvarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dados }: { id?: string; dados: ClienteFormulario }) => {
      const payload = paraPayloadCliente(dados);
      if (id) {
        const { error } = await supabase.from("clientes").update(payload).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase
        .from("clientes")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientesQueryKey }),
  });
}

export function useExcluirCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesQueryKey });
      queryClient.invalidateQueries({ queryKey: pagamentosQueryKey });
    },
  });
}

export interface ResultadoPagamento {
  vencimentoAnterior: string;
  vencimentoNovo: string;
}

/**
 * Registra o pagamento no histórico e recalcula o próximo vencimento
 * conforme a periodicidade do plano do cliente.
 */
export function useRegistrarPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cliente,
      dados,
    }: {
      cliente: Pick<ClienteComRelacoes, "id" | "proximo_vencimento" | "planos">;
      dados: PagamentoFormulario;
    }): Promise<ResultadoPagamento> => {
      const vencimentoAnterior = cliente.proximo_vencimento;
      const vencimentoNovo = calcularNovoVencimento(
        vencimentoAnterior,
        dados.data_pagamento,
        intervaloDoPlano(cliente.planos),
      );

      const { error: erroPagamento } = await supabase.from("pagamentos").insert({
        cliente_id: cliente.id,
        valor_pago: paraNumero(dados.valor_pago),
        data_pagamento: dados.data_pagamento,
        forma_pagamento: dados.forma_pagamento,
        observacao: dados.observacao.trim() || null,
        vencimento_anterior: vencimentoAnterior,
        vencimento_novo: vencimentoNovo,
      });
      if (erroPagamento) throw erroPagamento;

      const { error: erroCliente } = await supabase
        .from("clientes")
        .update({ proximo_vencimento: vencimentoNovo })
        .eq("id", cliente.id);
      if (erroCliente) throw erroCliente;

      return { vencimentoAnterior, vencimentoNovo };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesQueryKey });
      queryClient.invalidateQueries({ queryKey: pagamentosQueryKey });
    },
  });
}
