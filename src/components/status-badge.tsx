import { AlertTriangle, BellRing, CheckCircle2, Clock, PauseCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { STATUS_COBRANCA_LABEL, statusCobranca } from "@/lib/assinaturas";
import { cn } from "@/lib/utils";
import type { StatusCliente } from "@/types/assinaturas";

const ESTILOS_COBRANCA = {
  urgente: "border-status-vencido/30 bg-status-vencido/10 text-status-vencido",
  hoje: "border-status-hoje/30 bg-status-hoje/10 text-status-hoje",
  atencao: "border-status-atencao/35 bg-status-atencao/12 text-status-atencao",
  em_dia: "border-status-em-dia/30 bg-status-em-dia/10 text-status-em-dia",
} as const;

const ICONES_COBRANCA = {
  urgente: AlertTriangle,
  hoje: BellRing,
  atencao: Clock,
  em_dia: CheckCircle2,
} as const;

const ESTILOS_CLIENTE: Record<StatusCliente, string> = {
  ativo: "border-status-em-dia/30 bg-status-em-dia/10 text-status-em-dia",
  inativo: "border-border bg-muted text-muted-foreground",
};

interface StatusCobrancaBadgeProps {
  dias: number;
  className?: string;
}

/** Indicador automático de cobrança calculado a partir dos dias até o vencimento. */
export function StatusCobrancaBadge({ dias, className }: StatusCobrancaBadgeProps) {
  const status = statusCobranca(dias);
  const Icone = ICONES_COBRANCA[status];

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 whitespace-nowrap font-semibold", ESTILOS_COBRANCA[status], className)}
    >
      <Icone className="h-3 w-3" />
      {STATUS_COBRANCA_LABEL[status]}
    </Badge>
  );
}

interface StatusClienteBadgeProps {
  status: StatusCliente;
  className?: string;
}

export function StatusClienteBadge({ status, className }: StatusClienteBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 whitespace-nowrap font-semibold", ESTILOS_CLIENTE[status], className)}
    >
      {status === "ativo" ? <CheckCircle2 className="h-3 w-3" /> : <PauseCircle className="h-3 w-3" />}
      {status === "ativo" ? "Ativo" : "Inativo"}
    </Badge>
  );
}
