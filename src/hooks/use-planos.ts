import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planosQueryKey }),
  });
}
