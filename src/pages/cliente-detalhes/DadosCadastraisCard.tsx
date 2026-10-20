import { Building2, CalendarDays, MessageCircle, Phone, User, UserCheck } from "lucide-react";

import { StatusClienteBadge } from "@/components/status-badge";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarData, formatarTelefone } from "@/lib/format";
import type { ClienteComRelacoes } from "@/types/assinaturas";

interface DadosCadastraisCardProps {
  cliente: ClienteComRelacoes;
}

export function DadosCadastraisCard({ cliente }: DadosCadastraisCardProps) {
  return (
    <Card className="card-gradient border-border/70 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <User className="h-4 w-4 text-primary" />
          Dados cadastrais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo rotulo="Nome completo" valor={cliente.nome_completo} />
          <Campo
            rotulo="Responsável"
            valor={cliente.responsavel ?? "—"}
            icone={<UserCheck className="h-3.5 w-3.5" />}
          />
          <div className="space-y-1">
            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              WhatsApp
            </dt>
            <dd className="flex items-center gap-2">
              <span className="text-sm font-medium">{formatarTelefone(cliente.whatsapp)}</span>
              <WhatsAppButton nome={cliente.nome_completo} whatsapp={cliente.whatsapp} />
            </dd>
          </div>
          <Campo
            rotulo="Empresa"
            valor={cliente.empresas?.nome ?? "—"}
            icone={<Building2 className="h-3.5 w-3.5" />}
          />
          <Campo
            rotulo="Data de cadastro"
            valor={formatarData(cliente.data_cadastro)}
            icone={<CalendarDays className="h-3.5 w-3.5" />}
          />
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </dt>
            <dd>
              <StatusClienteBadge status={cliente.status} />
            </dd>
          </div>
        </dl>

        <div className="rounded-lg border border-border/60 bg-background/60 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            Observações
          </p>
          <p className="mt-1 text-sm">
            {cliente.observacoes?.trim() ? cliente.observacoes : "Sem observações registradas."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Campo({
  rotulo,
  valor,
  icone,
}: {
  rotulo: string;
  valor: string;
  icone?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icone}
        {rotulo}
      </dt>
      <dd className="text-sm font-medium">{valor}</dd>
    </div>
  );
}
