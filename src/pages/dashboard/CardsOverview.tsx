import {
  AlertTriangle,
  Repeat,
  TrendingDown,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  Wallet,
  BadgeCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { formatarMoeda } from "@/lib/format";
import type { MetricasDashboard } from "@/lib/assinaturas";

interface CardsOverviewProps {
  metricas: MetricasDashboard;
}

interface CardConfig {
  titulo: string;
  valor: string;
  descricao: string;
  icone: LucideIcon;
  tom: "primary" | "success" | "warning" | "danger" | "neutral";
  link?: string;
}

export function CardsOverview({ metricas }: CardsOverviewProps) {
  const cards: CardConfig[] = [
    {
      titulo: "Total de Clientes",
      valor: String(metricas.totalClientes),
      descricao: "Base completa cadastrada",
      icone: Users,
      tom: "primary",
    },
    {
      titulo: "Clientes Ativos",
      valor: String(metricas.ativos),
      descricao: "Assinaturas em andamento",
      icone: UserCheck,
      tom: "success",
      link: "/clientes?filtro=ativos",
    },
    {
      titulo: "Clientes Inativos",
      valor: String(metricas.inativos),
      descricao: "Assinaturas canceladas",
      icone: UserX,
      tom: "neutral",
      link: "/clientes?filtro=inativos",
    },
    {
      titulo: "Clientes Novos",
      valor: String(metricas.novos),
      descricao: "Cadastrados nos últimos 30 dias",
      icone: UserPlus,
      tom: "primary",
    },
    {
      titulo: "Clientes Recorrentes",
      valor: String(metricas.recorrentes),
      descricao: "Com 2 ou mais pagamentos",
      icone: Repeat,
      tom: "primary",
    },
    {
      titulo: "Clientes Vencidos",
      valor: String(metricas.vencidos),
      descricao: "Ativos com vencimento em atraso",
      icone: AlertTriangle,
      tom: "danger",
      link: "/clientes?filtro=vencidos",
    },
    {
      titulo: "Valor Total da Carteira",
      valor: formatarMoeda(metricas.valorCarteira),
      descricao: "Somatório das assinaturas ativas",
      icone: Wallet,
      tom: "primary",
    },
    {
      titulo: "Valor em Dia",
      valor: formatarMoeda(metricas.valorEmDia),
      descricao: "Assinaturas dentro do prazo",
      icone: BadgeCheck,
      tom: "success",
    },
    {
      titulo: "Valor Vencido",
      valor: formatarMoeda(metricas.valorVencido),
      descricao: "Assinaturas em atraso",
      icone: TrendingDown,
      tom: "danger",
      link: "/clientes?filtro=vencidos",
    },
  ];

  return (
    <section className="animate-fade-in-up">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.titulo} className="relative">
            <MetricCard
              titulo={card.titulo}
              valor={card.valor}
              descricao={card.descricao}
              icone={card.icone}
              tom={card.tom}
            />
            {card.link ? (
              <Button
                asChild
                variant="link"
                size="sm"
                className="absolute bottom-2 right-3 h-auto p-0 text-xs"
              >
                <Link to={card.link}>Ver clientes</Link>
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
