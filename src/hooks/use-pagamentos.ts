import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { PagamentoComCliente } from "@/types/assinaturas";

export const pagamentosQueryKey = ["pagamentos"] as const;

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
