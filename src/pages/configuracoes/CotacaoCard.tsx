import { Coins, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CHAVE_COTACAO_GBP_BRL,
  useAtualizarConfiguracao,
  useCotacaoGbpBrl,
} from "@/hooks/use-configuracoes";
import { formatarMoeda } from "@/lib/format";
import { converterValor } from "@/lib/moeda";

export function CotacaoCard() {
  const cotacao = useCotacaoGbpBrl();
  const atualizar = useAtualizarConfiguracao();
  const [valor, setValor] = useState(String(cotacao));

  useEffect(() => setValor(String(cotacao)), [cotacao]);

  const cotacaoDigitada = Number(valor.replace(",", "."));

  const salvar = async () => {
    if (!Number.isFinite(cotacaoDigitada) || cotacaoDigitada <= 0) {
      toast.error("Informe a cotação como um número maior que zero.");
      return;
    }
    try {
      await atualizar.mutateAsync({
        chave: CHAVE_COTACAO_GBP_BRL,
        valor: String(cotacaoDigitada),
      });
      toast.success("Cotação atualizada.", {
        description: "Usada apenas na exibição dos gráficos de receita em R$.",
      });
    } catch {
      toast.error("Não foi possível salvar a cotação.");
    }
  };

  return (
    <Card className="card-gradient border-border/70 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Coins className="h-4 w-4 text-primary" />
          Cotação para exibição em reais
        </CardTitle>
        <CardDescription>
          Valor de 1 libra em reais, usado apenas para visualizar os gráficos de receita em BRL. Os
          valores salvos em clientes e pagamentos continuam em libras.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[220px_1fr] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="cotacao">Valor de 1 £ em R$</Label>
            <Input
              id="cotacao"
              inputMode="decimal"
              value={valor}
              onChange={(evento) => setValor(evento.target.value)}
            />
          </div>
          <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Exemplo
            </p>
            <p className="mt-1">
              {formatarMoeda(100, "GBP")} ≈{" "}
              <span className="font-semibold">
                {formatarMoeda(
                  converterValor(100, "BRL", cotacaoDigitada > 0 ? cotacaoDigitada : cotacao),
                  "BRL",
                )}
              </span>
            </p>
          </div>
        </div>

        <Button type="button" onClick={salvar} disabled={atualizar.isPending}>
          <Save className="h-4 w-4" />
          {atualizar.isPending ? "Salvando..." : "Salvar cotação"}
        </Button>
      </CardContent>
    </Card>
  );
}
