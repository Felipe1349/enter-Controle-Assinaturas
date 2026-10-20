import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { Plus, Wallet } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useClientes } from "@/hooks/use-clientes";
import {
  useAtualizarPlano,
  useExcluirPlano,
  usePlanos,
  useReordenarPlanos,
} from "@/hooks/use-planos";
import type { Plano } from "@/types/assinaturas";

import { AdicionarPlanoDialog } from "./AdicionarPlanoDialog";
import { PlanoItem } from "./PlanoItem";

export function PlanosCard() {
  const { data: planos, isLoading } = usePlanos();
  const { data: clientes } = useClientes();
  const atualizar = useAtualizarPlano();
  const excluir = useExcluirPlano();
  const reordenar = useReordenarPlanos();
  const [valores, setValores] = useState<Record<string, { valor: string; intervalo: string }>>({});
  const [novoAberto, setNovoAberto] = useState(false);
  const [planoParaExcluir, setPlanoParaExcluir] = useState<Plano | null>(null);
  const [ordemLocal, setOrdemLocal] = useState<string[]>([]);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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
    setOrdemLocal(planos.map((plano) => plano.id));
  }, [planos]);

  // Mantém a ordem local (otimista) e garante que planos novos apareçam no fim.
  const planosOrdenados = useMemo(() => {
    const porId = new Map((planos ?? []).map((plano) => [plano.id, plano]));
    const ordenados = ordemLocal
      .map((id) => porId.get(id))
      .filter((plano): plano is Plano => Boolean(plano));
    const restantes = (planos ?? []).filter((plano) => !ordemLocal.includes(plano.id));
    return [...ordenados, ...restantes];
  }, [planos, ordemLocal]);

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

  const aoTerminarArrasto = async (evento: DragEndEvent) => {
    const { active, over } = evento;
    if (!over || active.id === over.id) return;

    const ids = planosOrdenados.map((plano) => plano.id);
    const origem = ids.indexOf(String(active.id));
    const destino = ids.indexOf(String(over.id));
    if (origem < 0 || destino < 0) return;

    const novaOrdem = arrayMove(ids, origem, destino);
    setOrdemLocal(novaOrdem);

    try {
      await reordenar.mutateAsync(novaOrdem);
      toast.success("Ordem dos planos salva.");
    } catch {
      toast.error("Não foi possível salvar a nova ordem.");
      setOrdemLocal((planos ?? []).map((plano) => plano.id));
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
            exclua planos que não usa mais. Arraste pelo ícone à esquerda para reordenar.
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
        ) : planosOrdenados.length === 0 ? (
          <p className="rounded-lg bg-muted/60 px-3 py-3 text-sm text-muted-foreground">
            Nenhum plano cadastrado. Adicione um plano para poder cadastrar clientes.
          </p>
        ) : (
          <DndContext
            sensors={sensores}
            collisionDetection={closestCenter}
            onDragEnd={aoTerminarArrasto}
          >
            <SortableContext
              items={planosOrdenados.map((plano) => plano.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {planosOrdenados.map((plano) => (
                  <PlanoItem
                    key={plano.id}
                    plano={plano}
                    vinculados={clientesDoPlano(plano.id)}
                    valores={valores[plano.id]}
                    salvando={atualizar.isPending}
                    aoMudarValor={(campo, valorDigitado) =>
                      setValores((atual) => ({
                        ...atual,
                        [plano.id]: { ...atual[plano.id], [campo]: valorDigitado },
                      }))
                    }
                    aoSalvar={() => salvar(plano)}
                    aoExcluir={() => setPlanoParaExcluir(plano)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
