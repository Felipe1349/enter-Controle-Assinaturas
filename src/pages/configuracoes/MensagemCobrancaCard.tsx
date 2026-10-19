import { MessageCircle, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CHAVE_MENSAGEM_COBRANCA,
  useAtualizarConfiguracao,
  useMensagemCobranca,
} from "@/hooks/use-configuracoes";
import { montarMensagem } from "@/lib/whatsapp";

export function MensagemCobrancaCard() {
  const mensagem = useMensagemCobranca();
  const atualizar = useAtualizarConfiguracao();
  const [texto, setTexto] = useState(mensagem);

  useEffect(() => setTexto(mensagem), [mensagem]);

  const salvar = async () => {
    if (texto.trim().length < 10) {
      toast.error("A mensagem precisa ter pelo menos 10 caracteres.");
      return;
    }
    try {
      await atualizar.mutateAsync({ chave: CHAVE_MENSAGEM_COBRANCA, valor: texto.trim() });
      toast.success("Mensagem de cobrança atualizada.");
    } catch {
      toast.error("Não foi possível salvar a mensagem.");
    }
  };

  return (
    <Card className="card-gradient border-border/70 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MessageCircle className="h-4 w-4 text-primary" />
          Mensagem padrão de cobrança
        </CardTitle>
        <CardDescription>
          Usada nos botões de WhatsApp. Use <code className="font-mono">{"{{nome}}"}</code> para
          inserir o nome do cliente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mensagem-cobranca">Mensagem</Label>
          <Textarea
            id="mensagem-cobranca"
            rows={4}
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
          />
        </div>

        <div className="rounded-lg border border-border/60 bg-background/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pré-visualização
          </p>
          <p className="mt-1 text-sm">{montarMensagem(texto, "Ana Beatriz de Souza")}</p>
        </div>

        <Button type="button" onClick={salvar} disabled={atualizar.isPending}>
          <Save className="h-4 w-4" />
          {atualizar.isPending ? "Salvando..." : "Salvar mensagem"}
        </Button>
      </CardContent>
    </Card>
  );
}
