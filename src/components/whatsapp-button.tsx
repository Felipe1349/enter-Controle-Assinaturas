import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMensagemCobranca } from "@/hooks/use-configuracoes";
import { montarLinkWhatsApp } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  nome: string;
  whatsapp: string | null;
  className?: string;
  mostrarTexto?: boolean;
  size?: "sm" | "default" | "icon";
}

/** Abre a conversa do WhatsApp com a mensagem de cobrança já preenchida. */
export function WhatsAppButton({
  nome,
  whatsapp,
  className,
  mostrarTexto = false,
  size = "sm",
}: WhatsAppButtonProps) {
  const mensagem = useMensagemCobranca();
  const link = montarLinkWhatsApp(whatsapp, nome, mensagem);

  if (!link) {
    return (
      <Button
        type="button"
        variant="ghost"
        size={mostrarTexto ? "sm" : "icon"}
        disabled
        title="Cliente sem WhatsApp cadastrado"
        className={cn("text-muted-foreground", className)}
      >
        <MessageCircle className="h-4 w-4" />
        {mostrarTexto ? <span>Sem WhatsApp</span> : null}
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant="whatsapp"
      size={mostrarTexto ? "sm" : "icon"}
      className={cn(className)}
    >
      <a href={link} target="_blank" rel="noopener noreferrer" title={`Cobrar ${nome} pelo WhatsApp`}>
        <MessageCircle className="h-4 w-4" />
        {mostrarTexto ? <span>WhatsApp</span> : null}
      </a>
    </Button>
  );
}
