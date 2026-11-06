import { AlertTriangle, CalendarDays, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/use-dashboard";

import { AlertasPanel } from "./AlertasPanel";
import { CaixaResumoCard } from "./CaixaResumoCard";
import { CardsOverview } from "./CardsOverview";
import { FiltrosRapidos } from "./FiltrosRapidos";
import { GraficosPanel } from "./GraficosPanel";
import { MetricasPanel } from "./MetricasPanel";

const Dashboard = () => {
  const {
    metricas,
    alertas,
    receitaMensal,
    receitaSemanal,
    porStatus,
    porEmpresa,
    porResponsavel,
    porSituacao,
    carregando,
    erro,
  } = useDashboard();

  return (
    <div className="space-y-8">
      <PageHeader
        titulo="Dashboard"
        descricao="Visão consolidada da carteira de clientes, cobranças e recebimentos."
        acoes={
          <>
            <Button asChild variant="hero" size="sm">
              <Link to="/clientes?novo=1">
                <UserPlus className="h-4 w-4" />
                Novo cliente
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/calendario">
                <CalendarDays className="h-4 w-4" />
                Calendário financeiro
              </Link>
            </Button>
          </>
        }
      />

      {erro ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-6 text-sm">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Não foi possível carregar os dados do dashboard. Verifique a conexão e tente novamente.
          </CardContent>
        </Card>
      ) : null}

      {carregando ? (
        <DashboardSkeleton />
      ) : (
        <>
          <CardsOverview metricas={metricas} />
          <FiltrosRapidos />
          <AlertasPanel alertas={alertas} />
          <GraficosPanel
            porStatus={porStatus}
            porEmpresa={porEmpresa}
            porResponsavel={porResponsavel}
            receitaMensal={receitaMensal}
            receitaSemanal={receitaSemanal}
            porSituacao={porSituacao}
          />
          <CaixaResumoCard />
          <MetricasPanel metricas={metricas} />
        </>
      )}
    </div>
  );
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, indice) => (
          <Skeleton key={indice} className="h-[104px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[220px] rounded-xl" />
      <Skeleton className="h-[280px] rounded-xl" />
    </div>
  );
}

export default Dashboard;
