export const MENSAGEM_COBRANCA_PADRAO =
  "Olá {{nome}}, tudo bem? Verificamos que sua mensalidade está próxima do vencimento. Caso já tenha realizado o pagamento, desconsidere esta mensagem.";

/** Remove tudo que não é dígito e garante o código do país (55). */
export function normalizarWhatsApp(telefone: string | null | undefined): string {
  const digitos = (telefone ?? "").replace(/\D/g, "");
  if (!digitos) return "";
  if (digitos.startsWith("55")) return digitos;
  return `55${digitos}`;
}

export function montarMensagem(template: string, nome: string): string {
  return (template || MENSAGEM_COBRANCA_PADRAO).replace(/\{\{\s*nome\s*\}\}/gi, nome);
}

/** Link de conversa do WhatsApp com a mensagem de cobrança já preenchida. */
export function montarLinkWhatsApp(
  telefone: string | null | undefined,
  nome: string,
  template: string = MENSAGEM_COBRANCA_PADRAO,
): string | null {
  const numero = normalizarWhatsApp(telefone);
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(montarMensagem(template, nome))}`;
}
