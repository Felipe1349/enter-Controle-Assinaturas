import { useMemo } from "react";

import { useClientes } from "@/hooks/use-clientes";
import { usePagamentos } from "@/hooks/use-pagamentos";
import {
  calcularAlertas,
  calcularMetricas,
  calcularReceitaMensal,
  contarPorEmpresa,
  contarPorStatus,
  hojeISO,
  SITUACAO_LABEL,
  SITUACAO_ORDEM,
  situacaoDoCliente,
  type SituacaoFinanceira,
} from "@/lib/assinaturas";
import type { ClienteComRelacoes } from "@/types/assinaturas";

export function useDashboard() {
  const clientesQuery = useClientes();
  const pagamentosQuery = usePagamentos();

  const dadosClientes = clientesQuery.data;
  const dadosPagamentos = pagamentosQuery.data;

  const clientes = useMemo(() => dadosClientes ?? [], [dadosClientes]);
  const pagamentos = useMemo(() => dadosPagamentos ?? [], [dadosPagamentos]);
  const referencia = hojeISO();

  const dados = useMemo(() => {
    const ativos = clientes.filter((cliente) => cliente.status === "ativo");
    const distribuicao = new Map<SituacaoFinanceira, ClienteComRelacoes[]>(
      SITUACAO_ORDEM.map((situacao) => [situacao, [] as ClienteComRelacoes[]]),
    );

    for (const cliente of ativos) {
      const { situacao } = situacaoDoCliente(cliente, referencia);
      distribuicao.get(situacao)?.push(cliente);
    }

    return {
      metricas: calcularMetricas(clientes, pagamentos, referencia),
      alertas: calcularAlertas(clientes, pagamentos, referencia),
      receitaMensal: calcularReceitaMensal(pagamentos, 12, referencia),
      porStatus: contarPorStatus(clientes),
      porEmpresa: contarPorEmpresa(clientes),
      porSituacao: SITUACAO_ORDEM.map((situacao) => ({
        situacao,
        label: SITUACAO_LABEL[situacao],
        total: distribuicao.get(situacao)?.length ?? 0,
      })),
    };
  }, [clientes, pagamentos, referencia]);

  return {
    ...dados,
    clientes,
    pagamentos,
    carregando: clientesQuery.isLoading || pagamentosQuery.isLoading,
    erro: clientesQuery.isError || pagamentosQuery.isError,
  };
}
