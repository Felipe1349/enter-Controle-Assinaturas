import { ChevronLeft, ChevronRight, CalendarDays, CircleDot } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatusClienteBadge } from "@/components/status-badge";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ReceberPagamentoDialog } from "@/components/receber-pagamento-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientes } from "@/hooks/use-clientes";
import { usePagamentos } from "@/hooks/use-pagamentos";
import { hojeISO } from "@/lib/assinaturas";
import { formatarData, formatarMoeda, paraData, paraISO } from "@/lib/format";
import { FORMA_PAGAMENTO_LABEL } from "@/types/assinaturas";
import type { ClienteComRelacoes, PagamentoComCliente } from "@/types/assinaturas";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

type TomDia = "vencido" | "hoje" | "proximo" | "pago" | "neutro";

const ESTILOS_TOM: Record<TomDia, string> = {
  vencido: "border-status-vencido/40 bg-status-vencido/10",
  hoje: "border-status-hoje/45 bg-status-hoje/12",
  proximo: "border-status-atencao/40 bg-status-atencao/10",
  pago: "border-status-em-dia/40 bg-status-em-dia/10",
  neutro: "border-border/60 bg-background/60",
};

const LEGENDA: { tom: TomDia; label: string; cor: string }[] = [
  { tom: "vencido", label: "Vencido", cor: "bg-status-vencido" },
  { tom: "hoje", label: "Hoje", cor: "bg-status-hoje" },
  { tom: "proximo", label: "Próximo", cor: "bg-status-atencao" },
  { tom: "pago", label: "Pago", cor: "bg-status-em-dia" },
];

const Calendario = () => {
  const hoje = hojeISO();
  const { data: clientes, isLoading } = useClientes();
  const { data: pagamentos } = usePagamentos();
  const [mesReferencia, setMesReferencia] = useState(() => {
    const data = paraData(hoje);
    return new Date(data.getFullYear(), data.getMonth(), 1);
  });
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [clientePagamento, setClientePagamento] = useState<ClienteComRelacoes | null>(null);

  const vencimentosPorDia = useMemo(() => {
    const mapa = new Map<string, ClienteComRelacoes[]>();
    for (const cliente of clientes ?? []) {
      if (cliente.status !== "ativo") continue;
      const chave = cliente.proximo_vencimento.slice(0, 10);
      mapa.set(chave, [...(mapa.get(chave) ?? []), cliente]);
    }
    return mapa;
  }, [clientes]);

  const recebimentosPorDia = useMemo(() => {
    const mapa = new Map<string, PagamentoComCliente[]>();
    for (const pagamento of pagamentos ?? []) {
      const chave = pagamento.data_pagamento.slice(0, 10);
      mapa.set(chave, [...(mapa.get(chave) ?? []), pagamento]);
    }
    return mapa;
  }, [pagamentos]);

  const grade = useMemo(() => {
    const ano = mesReferencia.getFullYear();
    const mes = mesReferencia.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const dias: (Date | null)[] = [];

    for (let i = 0; i < primeiroDia.getDay(); i += 1) dias.push(null);
    for (let dia = 1; dia <= ultimoDia.getDate(); dia += 1) dias.push(new Date(ano, mes, dia));
    while (dias.length % 7 !== 0) dias.push(null);

    return dias;
  }, [mesReferencia]);

  const resumoMes = useMemo(() => {
    const prefixo = `${mesReferencia.getFullYear()}-${`${mesReferencia.getMonth() + 1}`.padStart(2, "0")}`;
    const vencimentos = (clientes ?? []).filter(
      (cliente) =>
        cliente.status === "ativo" && cliente.proximo_vencimento.slice(0, 7) === prefixo,
    );
    const recebimentos = (pagamentos ?? []).filter(
      (pagamento) => pagamento.data_pagamento.slice(0, 7) === prefixo,
    );
    return {
      aReceber: vencimentos.reduce((soma, cliente) => soma + Number(cliente.valor), 0),
      qtdVencimentos: vencimentos.length,
      recebido: recebimentos.reduce((soma, pagamento) => soma + Number(pagamento.valor_pago), 0),
      qtdRecebimentos: recebimentos.length,
    };
  }, [clientes, pagamentos, mesReferencia]);

  const mudarMes = (delta: number) =>
    setMesReferencia(
      (atual) => new Date(atual.getFullYear(), atual.getMonth() + delta, 1),
    );

  const tomDoDia = (iso: string, temVencimento: boolean, temRecebimento: boolean): TomDia => {
    if (iso < hoje && temVencimento) return "vencido";
    if (iso === hoje && temVencimento) return "hoje";
    if (iso > hoje && temVencimento) return "proximo";
    if (temRecebimento) return "pago";
    return "neutro";
  };

  const vencimentosDoDia = diaSelecionado ? vencimentosPorDia.get(diaSelecionado) ?? [] : [];
  const recebimentosDoDia = diaSelecionado ? recebimentosPorDia.get(diaSelecionado) ?? [] : [];

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Calendário financeiro"
        descricao="Vencimentos do dia, recebimentos e programação futura da carteira."
        acoes={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => mudarMes(-1)} title="Mês anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const data = paraData(hoje);
                setMesReferencia(new Date(data.getFullYear(), data.getMonth(), 1));
              }}
            >
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={() => mudarMes(1)} title="Próximo mês">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Resumo rotulo="Vencimentos no mês" valor={String(resumoMes.qtdVencimentos)} />
        <Resumo rotulo="A receber no mês" valor={formatarMoeda(resumoMes.aReceber)} />
        <Resumo rotulo="Recebimentos no mês" valor={String(resumoMes.qtdRecebimentos)} />
        <Resumo rotulo="Total recebido" valor={formatarMoeda(resumoMes.recebido)} />
      </div>

      <Card className="card-gradient border-border/70 shadow-card">
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CalendarDays className="h-4 w-4 text-primary" />
            {MESES[mesReferencia.getMonth()]} de {mesReferencia.getFullYear()}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            {LEGENDA.map((item) => (
              <span key={item.tom} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`h-2.5 w-2.5 rounded-full ${item.cor}`} />
                {item.label}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[420px] rounded-xl" />
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-7 gap-1">
                {DIAS_SEMANA.map((dia) => (
                  <div
                    key={dia}
                    className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {dia}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {grade.map((dia, indice) => {
                  if (!dia) return <div key={`vazio-${indice}`} className="h-16 rounded-lg sm:h-24" />;
                  const iso = paraISO(dia);
                  const vencimentos = vencimentosPorDia.get(iso) ?? [];
                  const recebimentos = recebimentosPorDia.get(iso) ?? [];
                  const tom = tomDoDia(iso, vencimentos.length > 0, recebimentos.length > 0);
                  const ehHoje = iso === hoje;

                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setDiaSelecionado(iso)}
                      className={`flex h-16 flex-col items-start gap-1 rounded-lg border p-1.5 text-left transition-smooth hover:border-primary/50 hover:shadow-card sm:h-24 sm:p-2 ${ESTILOS_TOM[tom]}`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold sm:text-xs ${
                          ehHoje ? "brand-gradient text-primary-foreground" : "text-foreground"
                        }`}
                      >
                        {dia.getDate()}
                      </span>
                      <div className="hidden flex-col gap-0.5 sm:flex">
                        {vencimentos.length > 0 ? (
                          <span className="truncate text-[11px] font-semibold text-foreground">
                            {vencimentos.length} venc.
                          </span>
                        ) : null}
                        {recebimentos.length > 0 ? (
                          <span className="truncate text-[11px] text-muted-foreground">
                            {recebimentos.length} receb.
                          </span>
                        ) : null}
                      </div>
                      <div className="flex gap-0.5 sm:hidden">
                        {vencimentos.length > 0 ? (
                          <CircleDot className="h-3 w-3 text-status-vencido" />
                        ) : null}
                        {recebimentos.length > 0 ? (
                          <CircleDot className="h-3 w-3 text-status-em-dia" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(diaSelecionado)} onOpenChange={() => setDiaSelecionado(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{diaSelecionado ? formatarData(diaSelecionado) : ""}</DialogTitle>
            <DialogDescription>
              Vencimentos programados e recebimentos registrados neste dia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">
                Vencimentos do dia ({vencimentosDoDia.length})
              </h3>
              {vencimentosDoDia.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum vencimento programado.</p>
              ) : (
                <ul className="space-y-2">
                  {vencimentosDoDia.map((cliente) => (
                    <li
                      key={cliente.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{cliente.nome_completo}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatarMoeda(cliente.valor)} · {cliente.planos?.nome ?? "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StatusClienteBadge status={cliente.status} />
                        <WhatsAppButton nome={cliente.nome_completo} whatsapp={cliente.whatsapp} />
                        <Button
                          size="sm"
                          variant="hero"
                          onClick={() => {
                            setDiaSelecionado(null);
                            setClientePagamento(cliente);
                          }}
                        >
                          Receber
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">
                Recebimentos do dia ({recebimentosDoDia.length})
              </h3>
              {recebimentosDoDia.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum recebimento registrado.</p>
              ) : (
                <ul className="space-y-2">
                  {recebimentosDoDia.map((pagamento) => (
                    <li
                      key={pagamento.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-status-em-dia/30 bg-status-em-dia/8 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {pagamento.clientes?.nome_completo ?? "Cliente removido"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {FORMA_PAGAMENTO_LABEL[pagamento.forma_pagamento]}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-status-em-dia">
                        {formatarMoeda(pagamento.valor_pago)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </DialogContent>
      </Dialog>

      <ReceberPagamentoDialog
        cliente={clientePagamento}
        aberto={Boolean(clientePagamento)}
        aoMudarAberto={() => setClientePagamento(null)}
      />
    </div>
  );
};

function Resumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <Card className="card-gradient border-border/70 shadow-card">
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {rotulo}
        </p>
        <p className="mt-1 text-lg font-bold">{valor}</p>
      </CardContent>
    </Card>
  );
}

export default Calendario;
