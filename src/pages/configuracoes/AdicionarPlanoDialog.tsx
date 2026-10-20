import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCriarPlano } from "@/hooks/use-planos";

interface AdicionarPlanoDialogProps {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
}

export function AdicionarPlanoDialog({ aberto, aoMudarAberto }: AdicionarPlanoDialogProps) {
  const criar = useCriarPlano();
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [intervalo, setIntervalo] = useState("");

  useEffect(() => {
    if (!aberto) return;
    setNome("");
    setValor("");
    setIntervalo("");
  }, [aberto]);

  const enviar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    const nomeLimpo = nome.trim();
    const valorNumero = Number(valor.replace(",", "."));
    const intervaloNumero = Number(intervalo);

    if (nomeLimpo.length < 2) {
      toast.error("Informe o nome do plano.");
      return;
    }
    if (!Number.isFinite(valorNumero) || valorNumero < 0) {
      toast.error("Informe um valor padrão válido.");
      return;
    }
    if (!Number.isInteger(intervaloNumero) || intervaloNumero <= 0) {
      toast.error("O intervalo deve ser um número de dias maior que zero.");
      return;
    }

    try {
      await criar.mutateAsync({
        nome: nomeLimpo,
        valor_padrao: valorNumero,
        intervalo_dias: intervaloNumero,
      });
      toast.success(`Plano ${nomeLimpo} adicionado.`, {
        description: "Já está disponível no cadastro de clientes.",
      });
      aoMudarAberto(false);
    } catch (erro) {
      const codigo = (erro as { code?: string } | null)?.code;
      toast.error(
        codigo === "23505"
          ? "Já existe um plano com esse nome."
          : "Não foi possível adicionar o plano.",
      );
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar plano</DialogTitle>
          <DialogDescription>
            Use para condições personalizadas, como Diário (1 dia), Trimestral (90 dias) ou Anual
            (365 dias).
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={enviar}>
          <div className="space-y-2">
            <Label htmlFor="plano-nome">Nome do plano</Label>
            <Input
              id="plano-nome"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              placeholder="Ex.: Diário"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plano-valor">Valor padrão (£)</Label>
              <Input
                id="plano-valor"
                inputMode="decimal"
                value={valor}
                onChange={(evento) => setValor(evento.target.value)}
                placeholder="Ex.: 10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plano-intervalo">Intervalo (dias)</Label>
              <Input
                id="plano-intervalo"
                inputMode="numeric"
                value={intervalo}
                onChange={(evento) => setIntervalo(evento.target.value)}
                placeholder="Ex.: 1"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => aoMudarAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="hero" disabled={criar.isPending}>
              {criar.isPending ? "Adicionando..." : "Adicionar plano"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
