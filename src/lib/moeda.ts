import type { MoedaCodigo } from "@/lib/format";

/**
 * Moedas disponíveis para visualização dos gráficos de receita.
 * A conversão é apenas visual: nada é gravado no banco.
 */
export const MOEDAS_VISUALIZACAO: { valor: MoedaCodigo; label: string }[] = [
  { valor: "GBP", label: "GBP — Libra Esterlina (£)" },
  { valor: "BRL", label: "BRL — Real Brasileiro (R$)" },
];

export const COTACAO_PADRAO = 7;

export const SIMBOLOS: Record<MoedaCodigo, string> = {
  GBP: "£",
  BRL: "R$",
};

/** Converte um valor em libras para a moeda de visualização. */
export function converterValor(
  valorEmLibras: number,
  moeda: MoedaCodigo,
  cotacao: number,
): number {
  if (moeda === "BRL") return valorEmLibras * (cotacao > 0 ? cotacao : COTACAO_PADRAO);
  return valorEmLibras;
}

export function descricaoCotacao(moeda: MoedaCodigo, cotacao: number): string | null {
  if (moeda === "GBP") return null;
  return `Convertido a 1 £ = R$ ${cotacao.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
