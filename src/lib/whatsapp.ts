export const MENSAGEM_COBRANCA_PADRAO =
  "Olá {{nome}}, tudo bem? Verificamos que sua mensalidade está próxima do vencimento. Caso já tenha realizado o pagamento, desconsidere esta mensagem.";

/**
 * Mantém apenas os dígitos do número. Não adiciona DDI brasileiro (+55):
 * os clientes são do Reino Unido. Quando o número é digitado no formato
 * nacional (ex.: 07511 234567), o zero inicial é trocado por 44.
 */
export function normalizarWhatsApp(telefone: string | null | undefined): string {
  const digitos = (telefone ?? "").replace(/\D/g, "");
  if (!digitos) return "";
  if (/^0\d{9,10}$/.test(digitos)) return `44${digitos.slice(1)}`;
  return digitos;
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
