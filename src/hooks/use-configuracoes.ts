import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { MENSAGEM_COBRANCA_PADRAO } from "@/lib/whatsapp";
import type { Configuracao } from "@/types/assinaturas";

export const configuracoesQueryKey = ["configuracoes"] as const;

export const CHAVE_MENSAGEM_COBRANCA = "mensagem_cobranca";

export function useConfiguracoes() {
  return useQuery({
    queryKey: configuracoesQueryKey,
    queryFn: async (): Promise<Configuracao[]> => {
      const { data, error } = await supabase.from("configuracoes").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Mensagem padrão de cobrança do WhatsApp, configurável pelo banco. */
export function useMensagemCobranca(): string {
  const { data } = useConfiguracoes();
  const configurada = data?.find((item) => item.chave === CHAVE_MENSAGEM_COBRANCA)?.valor;
  return configurada?.trim() || MENSAGEM_COBRANCA_PADRAO;
}

export function useAtualizarConfiguracao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chave, valor }: { chave: string; valor: string }) => {
      const { error } = await supabase
        .from("configuracoes")
        .update({ valor })
        .eq("chave", chave);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: configuracoesQueryKey }),
  });
}
