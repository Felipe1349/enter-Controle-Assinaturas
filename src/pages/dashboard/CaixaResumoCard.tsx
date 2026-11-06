import { ArrowRight, Landmark } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useResumoCaixa } from "@/hooks/use-caixa";
import { competenciaDe, rotuloCompetencia } from "@/lib/caixa";
import { formatarMoeda } from "@/lib/format";

export function CaixaResumoCard() {
  const competencia = competenciaDe();
  const resumo = useResumoCaixa(competencia);

  const linhas = [
    { rotulo: "Valor informado em caixa", valor: resumo.valorInformado, destaque: false },
    { rotulo: "Despesas fixas do mês", valor: resumo.totalFixas, destaque: false },
    { rotulo: "Outras despesas do mês", valor: resumo.totalOutras, destaque: false },
    { rotulo: "Despesas pagas", valor: resumo.totalPagas, destaque: false },
    { rotulo: "Despesas pendentes", valor: resumo.totalPendentes, destaque: false },
    { rotulo: "Dinheiro disponível em caixa", valor: resumo.disponivel, destaque: true },
  ];

  return (
    <Card className="card-gradient border-border/70 shadow-card">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Landmark className="h-4 w-4 text-primary" />
            Controle de Caixa
          </CardTitle>
          <CardDescription>
            {rotuloCompetencia(competencia)} · valores em reais, independente dos clientes.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm" className="w-fit shrink-0">
          <Link to="/caixa">
            Abrir Caixa da Empresa
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {linhas.map((linha) => (
            <div
              key={linha.rotulo}
              className={
                linha.destaque
                  ? "rounded-lg border border-primary/30 bg-primary/5 p-3"
                  : "rounded-lg border border-border/60 bg-background/60 p-3"
              }
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {linha.rotulo}
              </p>
              <p
                className={
                  linha.destaque
                    ? "mt-1 text-lg font-bold text-primary"
                    : "mt-1 text-lg font-bold"
                }
              >
                {formatarMoeda(linha.valor, "BRL")}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
