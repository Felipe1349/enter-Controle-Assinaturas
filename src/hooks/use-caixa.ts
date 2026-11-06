import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { competenciaDe, dataVencimentoNoMes, calcularResumoCaixa } from "@/lib/caixa";
import type {
  CaixaSaldo,
  DespesaFixa,
  DespesaLancamento,
  ResumoCaixa,
  StatusDespesa,
} from "@/types/caixa";

export const saldoQueryKey = ["caixa-saldo"] as const;
export const fixasQueryKey = ["despesas-fixas"] as const;
export const lancamentosQueryKey = ["despesas-lancamentos"] as const;

export function useCaixaSaldo() {
  return useQuery({
    queryKey: saldoQueryKey,
    queryFn: async (): Promise<CaixaSaldo | null> => {
      const { data, error } = await supabase
        .from("caixa_saldo")
        .select("*")
        .order("atualizado_em", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });
}

export function useSalvarSaldo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, valor }: { id?: string; valor: number }) => {
      if (id) {
        const { error } = await supabase
          .from("caixa_saldo")
          .update({ valor, atualizado_em: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("caixa_saldo").insert({ valor });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: saldoQueryKey }),
  });
}

export function useDespesasFixas() {
  return useQuery({
    queryKey: fixasQueryKey,
    queryFn: async (): Promise<DespesaFixa[]> => {
      const { data, error } = await supabase
        .from("despesas_fixas")
        .select("*")
        .order("descricao", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCriarDespesaFixa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: { descricao: string; valor: number; dia_vencimento: number }) => {
      const { error } = await supabase.from("despesas_fixas").insert(dados);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fixasQueryKey }),
  });
}

export function useExcluirDespesaFixa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("despesas_fixas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fixasQueryKey });
      queryClient.invalidateQueries({ queryKey: lancamentosQueryKey });
    },
  });
}

export function useLancamentos(competencia: string) {
  return useQuery({
    queryKey: [...lancamentosQueryKey, competencia],
    queryFn: async (): Promise<DespesaLancamento[]> => {
      const { data, error } = await supabase
        .from("despesas_lancamentos")
        .select("*")
        .eq("competencia", competencia)
        .order("data_vencimento", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Gera os lançamentos do mês para as despesas fixas que ainda não têm registro (sem duplicar). */
export function useGerarLancamentosFixos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fixas,
      competencia,
    }: {
      fixas: DespesaFixa[];
      competencia: string;
    }) => {
      const linhas = fixas.map((fixa) => ({
        fixa_id: fixa.id,
        descricao: fixa.descricao,
        valor: fixa.valor,
        categoria: null,
        competencia,
        data_vencimento: dataVencimentoNoMes(competencia, fixa.dia_vencimento),
        status: "pendente" as StatusDespesa,
      }));
      const { error } = await supabase
        .from("despesas_lancamentos")
        .upsert(linhas, { onConflict: "fixa_id,competencia", ignoreDuplicates: true });
      if (error) throw error;
    },
    onSuccess: (_resultado, variaveis) => {
      queryClient.invalidateQueries({
        queryKey: [...lancamentosQueryKey, variaveis.competencia],
      });
    },
  });
}

export function useCriarLancamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: {
      descricao: string;
      valor: number;
      categoria: string | null;
      data_vencimento: string;
      competencia: string;
    }) => {
      const { error } = await supabase.from("despesas_lancamentos").insert({
        ...dados,
        fixa_id: null,
        status: "pendente",
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: lancamentosQueryKey }),
  });
}

export function useAtualizarLancamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dados,
    }: {
      id: string;
      dados: {
        status?: StatusDespesa;
        pago_em?: string | null;
        descricao?: string;
        valor?: number;
        categoria?: string | null;
        data_vencimento?: string;
      };
    }) => {
      const { error } = await supabase.from("despesas_lancamentos").update(dados).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: lancamentosQueryKey }),
  });
}

export function useExcluirLancamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("despesas_lancamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: lancamentosQueryKey }),
  });
}

/** Resumo do mês: fixas, outras, pagas, pendentes e disponível. */
export function useResumoCaixa(competencia: string): ResumoCaixa {
  const { data: saldo } = useCaixaSaldo();
  const { data: lancamentos } = useLancamentos(competencia ?? competenciaDe());
  return calcularResumoCaixa(Number(saldo?.valor ?? 0), lancamentos ?? []);
}
