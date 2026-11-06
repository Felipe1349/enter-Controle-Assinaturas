import { ChevronLeft, ChevronRight, Coins, Plus, Landmark, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCaixaSaldo,
  useDespesasFixas,
  useExcluirDespesaFixa,
  useExcluirLancamento,
  useGerarLancamentosFixos,
  useLancamentos,
  useSalvarSaldo,
} from "@/hooks/use-caixa";
import { competenciaDe, calcularResumoCaixa, mudarCompetencia, rotuloCompetencia } from "@/lib/caixa";
import { formatarData, formatarMoeda, paraNumero } from "@/lib/format";
import type { DespesaFixa, DespesaLancamento } from "@/types/caixa";

import { DespesaEventualDialog } from "./DespesaEventualDialog";
import { DespesaFixaDialog } from "./DespesaFixaDialog";
import { DespesaItem } from "./DespesaItem";

const Caixa = () => {
  const [competencia, setCompetencia] = useState(() => competenciaDe());
  const { data: saldo } = useCaixaSaldo();
  const { data: fixas } = useDespesasFixas();
  const { data: lancamentos, isLoading } = useLancamentos(competencia);
  const gerar = useGerarLancamentosFixos();
  const salvarSaldo = useSalvarSaldo();
  const excluirLancamento = useExcluirLancamento();
  const excluirFixa = useExcluirDespesaFixa();

  const [valorSaldo, setValorSaldo] = useState("");
  const [fixaAberta, setFixaAberta] = useState(false);
  const [eventualAberta, setEventualAberta] = useState(false);
  const [despesaEdicao, setDespesaEdicao] = useState<DespesaLancamento | null>(null);
  const [paraExcluir, setParaExcluir] = useState<DespesaLancamento | null>(null);
  const [fixaParaExcluir, setFixaParaExcluir] = useState<DespesaFixa | null>(null);
  const gerando = useRef(false);

  useEffect(() => {
    if (saldo) setValorSaldo(String(saldo.valor));
  }, [saldo]);

  // Gera os lançamentos do mês para as despesas fixas (o índice único evita duplicidade).
  useEffect(() => {
    if (!fixas || !lancamentos || gerar.isPending || gerando.current) return;
    const existentes = new Set(lancamentos.map((item) => item.fixa_id).filter(Boolean));
    const faltantes = fixas.filter((fixa) => fixa.ativo && !existentes.has(fixa.id));
    if (faltantes.length === 0) return;

    gerando.current = true;
    gerar.mutate(
      { fixas: faltantes, competencia },
      { onSettled: () => { gerando.current = false; } },
    );
  }, [fixas, lancamentos, competencia, gerar]);

  const resumo = calcularResumoCaixa(Number(saldo?.valor ?? 0), lancamentos ?? []);
  const pendentes = (lancamentos ?? []).filter((item) => item.status === "pendente");
  const pagas = (lancamentos ?? []).filter((item) => item.status === "pago");

  const salvarValorCaixa = async () => {
    if (paraNumero(valorSaldo) < 0 || valorSaldo.trim() === "") {
      toast.error("Informe o valor disponível em caixa.");
      return;
    }
    try {
      await salvarSaldo.mutateAsync({ id: saldo?.id, valor: paraNumero(valorSaldo) });
      toast.success("Valor em caixa atualizado.");
    } catch {
      toast.error("Não foi possível salvar o valor em caixa.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Caixa da Empresa"
        descricao="Controle manual do dinheiro em caixa e das despesas. Independente dos clientes."
        acoes={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              title="Mês anterior"
              onClick={() => setCompetencia((atual) => mudarCompetencia(atual, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCompetencia(competenciaDe())}>
              {rotuloCompetencia(competencia)}
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Próximo mês"
              onClick={() => setCompetencia((atual) => mudarCompetencia(atual, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <Card className="card-gradient border-border/70 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Landmark className="h-4 w-4 text-primary" />
            Valor em caixa
          </CardTitle>
          <CardDescription>
            Informe manualmente o dinheiro disponível. Somente despesas pagas são descontadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-2 sm:w-56">
              <Label htmlFor="valor-caixa">Valor disponível (R$)</Label>
              <Input
                id="valor-caixa"
                inputMode="decimal"
                value={valorSaldo}
                onChange={(evento) => setValorSaldo(evento.target.value)}
                placeholder="Ex.: 10.000,00"
              />
            </div>
            <Button type="button" onClick={salvarValorCaixa} disabled={salvarSaldo.isPending}>
              {salvarSaldo.isPending ? "Salvando..." : "Atualizar valor"}
            </Button>
            <span className="text-sm text-muted-foreground sm:ml-auto">
              {formatarMoeda(Number(saldo?.valor ?? 0), "BRL")}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Resumo rotulo="Valor informado em caixa" valor={formatarMoeda(resumo.valorInformado, "BRL")} />
        <Resumo rotulo="Despesas fixas do mês" valor={formatarMoeda(resumo.totalFixas, "BRL")} />
        <Resumo rotulo="Outras despesas do mês" valor={formatarMoeda(resumo.totalOutras, "BRL")} />
        <Resumo rotulo="Despesas pagas" valor={formatarMoeda(resumo.totalPagas, "BRL")} />
        <Resumo rotulo="Despesas pendentes" valor={formatarMoeda(resumo.totalPendentes, "BRL")} />
        <Resumo
          rotulo="Dinheiro disponível em caixa"
          valor={formatarMoeda(resumo.disponivel, "BRL")}
          destaque
        />
      </div>

      <Card className="card-gradient border-border/70 shadow-card">
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Coins className="h-4 w-4 text-primary" />
              Despesas fixas
            </CardTitle>
            <CardDescription>
              Repetidas todo mês automaticamente, sem duplicar lançamentos.
            </CardDescription>
          </div>
          <Button size="sm" variant="hero" className="w-fit" onClick={() => setFixaAberta(true)}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(fixas ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma despesa fixa cadastrada.</p>
          ) : (
            (fixas ?? []).map((fixa) => (
              <div
                key={fixa.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{fixa.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    Vence no dia {fixa.dia_vencimento} · {formatarMoeda(fixa.valor, "BRL")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Excluir despesa fixa"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setFixaParaExcluir(fixa)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="card-gradient border-border/70 shadow-card">
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="text-base font-semibold">
              Despesas de {rotuloCompetencia(competencia)}
            </CardTitle>
            <CardDescription>Pendentes aparecem separadas das pagas.</CardDescription>
          </div>
          <Button
            size="sm"
            variant="hero"
            className="w-fit"
            onClick={() => {
              setDespesaEdicao(null);
              setEventualAberta(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nova despesa
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <Skeleton className="h-24 rounded-xl" />
          ) : (
            <>
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Pendentes ({pendentes.length})</h3>
                {pendentes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma despesa pendente.</p>
                ) : (
                  <ul className="space-y-2">
                    {pendentes.map((despesa) => (
                      <DespesaItem
                        key={despesa.id}
                        despesa={despesa}
                        aoEditar={(item) => {
                          setDespesaEdicao(item);
                          setEventualAberta(true);
                        }}
                        aoExcluir={setParaExcluir}
                      />
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Pagas ({pagas.length})</h3>
                {pagas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma despesa paga neste mês.</p>
                ) : (
                  <ul className="space-y-2">
                    {pagas.map((despesa) => (
                      <DespesaItem
                        key={despesa.id}
                        despesa={despesa}
                        aoEditar={(item) => {
                          setDespesaEdicao(item);
                          setEventualAberta(true);
                        }}
                        aoExcluir={setParaExcluir}
                      />
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </CardContent>
      </Card>

      <DespesaFixaDialog aberto={fixaAberta} aoMudarAberto={setFixaAberta} />
      <DespesaEventualDialog
        aberto={eventualAberta}
        aoMudarAberto={setEventualAberta}
        despesa={despesaEdicao}
        competencia={competencia}
      />

      <AlertDialog open={Boolean(paraExcluir)} onOpenChange={() => setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir a despesa {paraExcluir?.descricao}?</AlertDialogTitle>
            <AlertDialogDescription>
              {paraExcluir
                ? `${formatarMoeda(paraExcluir.valor, "BRL")} · ${formatarData(
                    paraExcluir.data_vencimento,
                  )}. A exclusão não pode ser desfeita.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!paraExcluir) return;
                try {
                  await excluirLancamento.mutateAsync(paraExcluir.id);
                  toast.success("Despesa excluída.");
                  setParaExcluir(null);
                } catch {
                  toast.error("Não foi possível excluir a despesa.");
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(fixaParaExcluir)} onOpenChange={() => setFixaParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir a despesa fixa {fixaParaExcluir?.descricao}?</AlertDialogTitle>
            <AlertDialogDescription>
              Os lançamentos já gerados nos meses anteriores também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!fixaParaExcluir) return;
                try {
                  await excluirFixa.mutateAsync(fixaParaExcluir.id);
                  toast.success("Despesa fixa excluída.");
                  setFixaParaExcluir(null);
                } catch {
                  toast.error("Não foi possível excluir a despesa fixa.");
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

function Resumo({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <Card
      className={
        destaque
          ? "border-primary/30 bg-primary/5 shadow-card"
          : "card-gradient border-border/70 shadow-card"
      }
    >
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {rotulo}
        </p>
        <p className={destaque ? "mt-1 text-xl font-bold text-primary" : "mt-1 text-xl font-bold"}>
          {valor}
        </p>
      </CardContent>
    </Card>
  );
}

export default Caixa;
