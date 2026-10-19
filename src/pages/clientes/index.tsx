import { AlertTriangle, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { PageHeader } from "@/components/layout/PageHeader";
import { ReceberPagamentoDialog } from "@/components/receber-pagamento-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientes } from "@/hooks/use-clientes";
import { useEmpresas } from "@/hooks/use-empresas";
import { usePlanos } from "@/hooks/use-planos";
import { aplicarFiltroRapido, type FiltroRapido } from "@/lib/assinaturas";
import type { OrdenacaoClientes } from "@/lib/ordenacao-clientes";
import type { ClienteComRelacoes } from "@/types/assinaturas";

import { ClienteFormDialog } from "./ClienteFormDialog";
import { ClientesTabela } from "./ClientesTabela";
import { ExcluirClienteDialog } from "./ExcluirClienteDialog";
import { FiltrosClientes } from "./FiltrosClientes";

const FILTROS_VALIDOS: FiltroRapido[] = [
  "todos",
  "em_dia",
  "vence_hoje",
  "proximos_3",
  "vencidos",
  "ativos",
  "inativos",
];

const Clientes = () => {
  const [params, setParams] = useSearchParams();
  const { data: clientes, isLoading, isError } = useClientes();
  const { data: empresas } = useEmpresas();
  const { data: planos } = usePlanos();

  const [busca, setBusca] = useState("");
  const [empresaId, setEmpresaId] = useState("todas");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [planoId, setPlanoId] = useState("todos");
  const [ordenacao, setOrdenacao] = useState<OrdenacaoClientes>("vencimento_asc");

  const filtroParam = params.get("filtro") as FiltroRapido | null;
  const filtro: FiltroRapido = filtroParam && FILTROS_VALIDOS.includes(filtroParam) ? filtroParam : "todos";

  const [formAberto, setFormAberto] = useState(false);
  const [clienteEdicao, setClienteEdicao] = useState<ClienteComRelacoes | null>(null);
  const [clientePagamento, setClientePagamento] = useState<ClienteComRelacoes | null>(null);
  const [pagamentoAberto, setPagamentoAberto] = useState(false);
  const [clienteExclusao, setClienteExclusao] = useState<ClienteComRelacoes | null>(null);

  // Atalho do topo/dashboard: /clientes?novo=1 abre o cadastro.
  useEffect(() => {
    if (params.get("novo") !== "1") return;
    setClienteEdicao(null);
    setFormAberto(true);
    const proximos = new URLSearchParams(params);
    proximos.delete("novo");
    setParams(proximos, { replace: true });
  }, [params, setParams]);

  const aoMudarFiltro = (novoFiltro: FiltroRapido) => {
    const proximos = new URLSearchParams(params);
    if (novoFiltro === "todos") {
      proximos.delete("filtro");
    } else {
      proximos.set("filtro", novoFiltro);
    }
    setParams(proximos, { replace: true });
  };

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const resultado = (clientes ?? []).filter((cliente) => {
      if (!aplicarFiltroRapido(cliente, filtro)) return false;
      if (empresaId !== "todas" && cliente.empresa_id !== empresaId) return false;
      if (statusFiltro !== "todos" && cliente.status !== statusFiltro) return false;
      if (planoId !== "todos" && cliente.plano_id !== planoId) return false;
      if (!termo) return true;
      return [
        cliente.nome_completo,
        cliente.email ?? "",
        cliente.whatsapp ?? "",
        cliente.empresas?.nome ?? "",
        cliente.planos?.nome ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(termo);
    });

    const ordenada = [...resultado];
    ordenada.sort((a, b) => {
      if (ordenacao === "nome") return a.nome_completo.localeCompare(b.nome_completo, "pt-BR");
      if (ordenacao === "valor_desc") return Number(b.valor) - Number(a.valor);
      if (ordenacao === "cadastro_desc") return b.data_cadastro.localeCompare(a.data_cadastro);
      if (ordenacao === "vencimento_desc")
        return b.proximo_vencimento.localeCompare(a.proximo_vencimento);
      return a.proximo_vencimento.localeCompare(b.proximo_vencimento);
    });
    return ordenada;
  }, [clientes, busca, empresaId, filtro, ordenacao, planoId, statusFiltro]);

  const abrirNovo = () => {
    setClienteEdicao(null);
    setFormAberto(true);
  };

  const abrirEdicao = (cliente: ClienteComRelacoes) => {
    setClienteEdicao(cliente);
    setFormAberto(true);
  };

  const abrirPagamento = (cliente: ClienteComRelacoes) => {
    setClientePagamento(cliente);
    setPagamentoAberto(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Clientes"
        descricao="Pesquise, filtre e gerencie assinaturas, vencimentos e cobranças."
        acoes={
          <Button onClick={abrirNovo} variant="hero" size="sm">
            <UserPlus className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      <FiltrosClientes
        busca={busca}
        aoMudarBusca={setBusca}
        empresaId={empresaId}
        aoMudarEmpresa={setEmpresaId}
        status={statusFiltro}
        aoMudarStatus={setStatusFiltro}
        planoId={planoId}
        aoMudarPlano={setPlanoId}
        filtro={filtro}
        aoMudarFiltro={aoMudarFiltro}
        ordenacao={ordenacao}
        aoMudarOrdenacao={setOrdenacao}
        empresas={empresas ?? []}
        planos={planos ?? []}
      />

      {isError ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-6 text-sm">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Não foi possível carregar os clientes. Tente novamente em instantes.
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, indice) => (
            <Skeleton key={indice} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {listaFiltrada.length}{" "}
            {listaFiltrada.length === 1 ? "cliente encontrado" : "clientes encontrados"}
            {clientes ? ` de ${clientes.length} na base` : ""}.
          </p>
          <ClientesTabela
            clientes={listaFiltrada}
            aoEditar={abrirEdicao}
            aoReceber={abrirPagamento}
            aoExcluir={setClienteExclusao}
          />
        </>
      )}

      <ClienteFormDialog aberto={formAberto} aoMudarAberto={setFormAberto} cliente={clienteEdicao} />
      <ReceberPagamentoDialog
        cliente={clientePagamento}
        aberto={pagamentoAberto}
        aoMudarAberto={setPagamentoAberto}
      />
      <ExcluirClienteDialog cliente={clienteExclusao} aoMudarAberto={() => setClienteExclusao(null)} />
    </div>
  );
};

export default Clientes;
