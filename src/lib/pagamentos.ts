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
