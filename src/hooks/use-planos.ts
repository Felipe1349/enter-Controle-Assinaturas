import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { clientesQueryKey } from "@/hooks/use-clientes";
import { supabase } from "@/integrations/supabase/client";
import type { Plano } from "@/types/assinaturas";

export const planosQueryKey = ["planos"] as const;

export function usePlanos() {
  return useQuery({
    queryKey: planosQueryKey,
    queryFn: async (): Promise<Plano[]> => {
      const { data, error } = await supabase
        .from("planos")
        .select("*")
        .order("ordem", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAtualizarPlano() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plano: Pick<Plano, "id" | "valor_padrao" | "intervalo_dias">) => {
      const { error } = await supabase
        .from("planos")
        .update({
          valor_padrao: plano.valor_padrao,
          intervalo_dias: plano.intervalo_dias,
        })
        .eq("id", plano.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planosQueryKey });
      queryClient.invalidateQueries({ queryKey: clientesQueryKey });
    },
  });
}

export interface NovoPlano {
  nome: string;
  valor_padrao: number;
  intervalo_dias: number;
}

/** Cria um novo plano (ex.: Diário, Trimestral, Anual) no fim da lista. */
export function useCriarPlano() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: NovoPlano) => {
      const { data: ultimos, error: erroConsulta } = await supabase
        .from("planos")
        .select("ordem")
        .order("ordem", { ascending: false })
        .limit(1);
      if (erroConsulta) throw erroConsulta;

      const proximaOrdem = (ultimos?.[0]?.ordem ?? 0) + 1;
      const { error } = await supabase.from("planos").insert({
        nome: dados.nome,
        valor_padrao: dados.valor_padrao,
        intervalo_dias: dados.intervalo_dias,
        ordem: proximaOrdem,
        ativo: true,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planosQueryKey }),
  });
}

/**
 * Remove um plano. Os clientes vinculados continuam cadastrados:
 * `clientes.plano_id` fica nulo (ON DELETE SET NULL) e o valor/vencimento já gravados são mantidos.
 */
export function useExcluirPlano() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("planos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planosQueryKey });
      queryClient.invalidateQueries({ queryKey: clientesQueryKey });
    },
  });
}
