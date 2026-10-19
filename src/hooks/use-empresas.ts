import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { clientesQueryKey } from "@/hooks/use-clientes";
import { supabase } from "@/integrations/supabase/client";
import type { Empresa } from "@/types/assinaturas";

export const empresasQueryKey = ["empresas"] as const;

export function useEmpresas() {
  return useQuery({
    queryKey: empresasQueryKey,
    queryFn: async (): Promise<Empresa[]> => {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .order("nome", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSalvarEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, nome }: { id?: string; nome: string }) => {
      if (id) {
        const { error } = await supabase.from("empresas").update({ nome }).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("empresas").insert({ nome });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: empresasQueryKey });
      queryClient.invalidateQueries({ queryKey: clientesQueryKey });
    },
  });
}

export function useExcluirEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("empresas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: empresasQueryKey });
      queryClient.invalidateQueries({ queryKey: clientesQueryKey });
    },
  });
}
