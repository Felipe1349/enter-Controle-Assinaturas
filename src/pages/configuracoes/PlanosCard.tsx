import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

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
import { useClientes } from "@/hooks/use-clientes";
import { useAtualizarPlano, useExcluirPlano, usePlanos } from "@/hooks/use-planos";
import type { Plano } from "@/types/assinaturas";

import { AdicionarPlanoDialog } from "./AdicionarPlanoDialog";

export function PlanosCard() {
  const { data: planos, isLoading } = usePlanos();
  const { data: clientes } = useClientes();
  const atualizar = useAtualizarPlano();
  const excluir = useExcluirPlano();
  const [valores, setValores] = useState<Record<string, { valor: string; intervalo: string }>>({});
  const [novoAberto, setNovoAberto] = useState(false);
  const [planoParaExcluir, setPlanoParaExcluir] = useState<Plano | null>(null);

  useEffect(() => {
    if (!planos) return;
    setValores(
      Object.fromEntries(
        planos.map((plano) => [
          plano.id,
          { valor: String(plano.valor_padrao), intervalo: String(plano.intervalo_dias) },
        ]),
      ),
    );
  }, [planos]);

  const clientesDoPlano = (planoId: string) =>
    (clientes ?? []).filter((cliente) => cliente.plano_id === planoId).length;

  const salvar = async (plano: Plano) => {
    const edicao = valores[plano.id];
    const valor = Number((edicao?.valor ?? "").replace(",", "."));
    const intervalo = Number(edicao?.intervalo);

    if (!Number.isFinite(valor) || valor < 0) {
      toast.error("Informe um valor padrão válido.");
      return;
    }
    if (!Number.isInteger(intervalo) || intervalo <= 0) {
      toast.error("O intervalo deve ser um número de dias maior que zero.");
      return;
    }

    try {
      await atualizar.mutateAsync({
        id: plano.id,
        valor_padrao: valor,
        intervalo_dias: intervalo,
      });
      toast.success(`Plano ${plano.nome} atualizado.`, {
        description: "Novos cadastros usarão estes valores; clientes já cadastrados não mudam.",
      });
    } catch {
      toast.error("Não foi possível atualizar o plano.");
    }
  };

  const confirmarExclusao = async () => {
    if (!planoParaExcluir) return;
    try {
      await excluir.mutateAsync(planoParaExcluir.id);
      toast.success(`Plano ${planoParaExcluir.nome} excluído.`);
      setPlanoParaExcluir(null);
    } catch {
      toast.error("Não foi possível excluir o plano. Tente novamente.");
    }
  };

  return (
    <Card className="card-gradient border-border/70 shadow-card">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Wallet className="h-4 w-4 text-primary" />
            Planos e valores padrão
          </CardTitle>
          <CardDescription>
            Ajuste valor e periodicidade, adicione novas condições (diário, trimestral, anual) ou
            exclua planos que não usa mais.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="hero"
          size="sm"
          className="w-fit shrink-0"
          onClick={() => setNovoAberto(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar plano
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-32 rounded-xl" />
        ) : (planos ?? []).length === 0 ? (
          <p className="rounded-lg bg-muted/60 px-3 py-3 text-sm text-muted-foreground">
            Nenhum plano cadastrado. Adicione um plano para poder cadastrar clientes.
          </p>
        ) : (
          (planos ?? []).map((plano) => {
            const vinculados = clientesDoPlano(plano.id);
            return (
              <div
                key={plano.id}
                className="grid grid-cols-1 items-end gap-3 rounded-lg border border-border/60 bg-background/60 p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto]"
              >
                <div>
                  <p className="text-sm font-semibold">{plano.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    Vencimento a cada {plano.intervalo_dias} dias · {vinculados}{" "}
                    {vinculados === 1 ? "cliente" : "clientes"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`valor-${plano.id}`}>Valor padrão (£)</Label>
                  <Input
                    id={`valor-${plano.id}`}
                    inputMode="decimal"
                    value={valores[plano.id]?.valor ?? ""}
                    onChange={(evento) =>
                      setValores((atual) => ({
                        ...atual,
                        [plano.id]: { ...atual[plano.id], valor: evento.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`intervalo-${plano.id}`}>Intervalo (dias)</Label>
                  <Input
                    id={`intervalo-${plano.id}`}
                    inputMode="numeric"
                    value={valores[plano.id]?.intervalo ?? ""}
                    onChange={(evento) =>
                      setValores((atual) => ({
                        ...atual,
                        [plano.id]: { ...atual[plano.id], intervalo: evento.target.value },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => salvar(plano)}
                    disabled={atualizar.isPending}
                  >
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Excluir plano"
                    aria-label={`Excluir plano ${plano.nome}`}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setPlanoParaExcluir(plano)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      <AdicionarPlanoDialog aberto={novoAberto} aoMudarAberto={setNovoAberto} />

      <AlertDialog
        open={Boolean(planoParaExcluir)}
        onOpenChange={(aberto) => {
          if (!aberto) setPlanoParaExcluir(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir o plano {planoParaExcluir?.nome}?</AlertDialogTitle>
            <AlertDialogDescription>
              {planoParaExcluir && clientesDoPlano(planoParaExcluir.id) > 0
                ? `${clientesDoPlano(planoParaExcluir.id)} cliente(s) usam este plano. Eles continuam cadastrados, com o mesmo valor e vencimento, mas ficam sem plano vinculado — até você definir outro plano, o recálculo de vencimento usa 30 dias.`
                : "Nenhum cliente usa este plano. A exclusão não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {excluir.isPending ? "Excluindo..." : "Excluir plano"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
