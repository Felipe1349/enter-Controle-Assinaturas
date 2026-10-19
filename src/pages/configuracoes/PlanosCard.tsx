import { useEffect, useState } from "react";
import { Save, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAtualizarPlano, usePlanos } from "@/hooks/use-planos";
import type { Plano } from "@/types/assinaturas";

export function PlanosCard() {
  const { data: planos, isLoading } = usePlanos();
  const atualizar = useAtualizarPlano();
  const [valores, setValores] = useState<Record<string, { valor: string; intervalo: string }>>({});

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

  return (
    <Card className="card-gradient border-border/70 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Wallet className="h-4 w-4 text-primary" />
          Planos e valores padrão
        </CardTitle>
        <CardDescription>
          Ajuste o valor padrão e a periodicidade em dias de cada plano. Alterações valem para novos
          cadastros.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-32 rounded-xl" />
        ) : (
          (planos ?? []).map((plano) => (
            <div
              key={plano.id}
              className="grid grid-cols-1 items-end gap-3 rounded-lg border border-border/60 bg-background/60 p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto]"
            >
              <div>
                <p className="text-sm font-semibold">{plano.nome}</p>
                <p className="text-xs text-muted-foreground">
                  Vencimento a cada {plano.intervalo_dias} dias
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
              <Button
                type="button"
                variant="outline"
                onClick={() => salvar(plano)}
                disabled={atualizar.isPending}
              >
                <Save className="h-4 w-4" />
                Salvar
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
