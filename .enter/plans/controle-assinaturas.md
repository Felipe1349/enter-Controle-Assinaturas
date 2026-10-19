# Controle de Assinaturas — Plano de Implementação

## Contexto

O documento anexado (`PROMPT Controle de Assinaturas.docx`) especifica um SaaS brasileiro para **controlar clientes, assinaturas, pagamentos recorrentes e cobranças**: dashboard com cards e gráficos, módulo de clientes com filtros, cadastro, página de detalhes, histórico e registro de pagamentos, status automático de cobrança, alertas, filtros rápidos, métricas (MRR, inadimplência), calendário financeiro e botão de WhatsApp para cobrança.

O projeto atual é o template Vite + React + TypeScript + Tailwind + shadcn/ui (apenas a página inicial de exemplo). Não existe backend conectado nem dados. O sistema precisa de persistência real (clientes, planos, empresas, pagamentos), portanto usaremos o **Enter Cloud** (Postgres + RLS) e dados de demonstração reais no banco.

Decisões já confirmadas com o usuário:
- **Sem login**: o sistema abre direto no dashboard (perfis Admin/Usuário e tela de login **não** serão implementados).
- **Sem multiusuário**: como não há autenticação, não há papéis nem restrição de leitura.
- **Idioma**: interface somente em **Português (Brasil)** (moeda R$, datas dd/MM/aaaa).
- **Dados de demonstração**: sim, empresas CAJU / ALYMENTE 1 / ALYMENTE 2, planos Semanal/Quinzenal/Mensal e clientes/pagamentos de exemplo.

## Escopo funcional (rotas)

| Rota | Tela |
|---|---|
| `/` | Dashboard: 9 cards, 4 gráficos, alertas, filtros rápidos, métricas |
| `/clientes` | Listagem com busca, filtros (empresa, status, plano), ordenação por vencimento, ações Novo/Editar/Excluir, WhatsApp, Receber Pagamento |
| `/clientes/:id` | Detalhes: dados cadastrais, informações financeiras, histórico de pagamentos, observações, linha do tempo |
| `/pagamentos` | Histórico global de pagamentos (ID, cliente, data, valor, forma, observação) |
| `/calendario` | Calendário financeiro mensal (vencimentos, recebimentos, cores por situação) |
| `/configuracoes` | Planos (valores/intervalos editáveis) e Empresas (CRUD) |
| `*` | NotFound (existente, traduzido para pt-BR) |

Todas as rotas ficam sob um layout comum com sidebar + topbar (tema claro/escuro, título e ações rápidas).

## Arquitetura de dados (Enter Cloud)

Criar via `supabase_migration` (uma migração), com RLS habilitado em cada tabela na mesma migração:

- `empresas`: `id uuid pk`, `nome text unique not null`, `ativo bool default true`, `created_at timestamptz default now()`
- `planos`: `id uuid pk`, `nome text unique not null` (Semanal/Quinzenal/Mensal), `valor_padrao numeric(10,2) not null`, `intervalo_dias int not null`, `ordem int`, `ativo bool default true`
- `clientes`: `id uuid pk`, `nome_completo text not null`, `email text`, `whatsapp text`, `empresa_id uuid references empresas(id)`, `plano_id uuid references planos(id)`, `valor numeric(10,2) not null`, `data_cadastro date not null default current_date`, `proximo_vencimento date not null`, `status text not null default 'ativo'` (`ativo` | `inativo`), `observacoes text`, `created_at`, `updated_at`
- `pagamentos`: `id uuid pk`, `cliente_id uuid references clientes(id) on delete cascade`, `valor_pago numeric(10,2) not null`, `data_pagamento date not null`, `forma_pagamento text not null` (`pix` | `cartao` | `dinheiro` | `transferencia`), `observacao text`, `vencimento_anterior date`, `vencimento_novo date`, `created_at`
- `configuracoes`: `id uuid pk`, `chave text unique`, `valor text` (parâmetros gerais, ex.: alerta de "sem pagamento há X dias")

Índices: `clientes(empresa_id)`, `clientes(plano_id)`, `clientes(proximo_vencimento)`, `clientes(status)`, `pagamentos(cliente_id)`, `pagamentos(data_pagamento)`.

**RLS / segurança (trade-off explícito):** como o app não tem login, as políticas precisam liberar o papel `anon` para ler e escrever em todas as tabelas (o app é de uso interno e não há usuário autenticado). Documentar esse ponto no plano de comunicação ao usuário: qualquer pessoa com a URL do app consegue ler/gravar os dados. Se depois quiserem restringir, adicionamos login (Enter Cloud Auth) e trocamos as políticas por regras por usuário.

Após a migração, validar com `supabase_get_table_schema` que RLS está habilitado e as políticas listadas em cada tabela.

Acesso no frontend pelo cliente gerado pelo framework em `src/integrations/supabase/client.ts` (arquivo gerado — nunca editar manualmente).

## Design system (azul, branco e verde; claro + escuro)

Reescrever `src/index.css` (tokens HSL) e estender `tailwind.config.ts`:

- Marca: `--primary` azul (ex.: `217 91% 50%` claro / `217 91% 62%` escuro), `--accent` verde (`152 69% 40%`), fundos brancos/azulados no claro e navy profundo no escuro.
- Tokens de situação (usados por badges, calendário e gráficos), com variantes para claro/escuro: `--status-vencido` (vermelho), `--status-hoje` (laranja), `--status-atencao` (amarelo), `--status-em-dia` (verde).
- Extras: `--gradient-primary`, `--gradient-subtle`, `--shadow-card`, `--shadow-elegant`, `--transition-smooth`, raio `0.75rem`.
- `tailwind.config.ts`: `colors.status.*`, `colors.success/warning/info`, `boxShadow.card/elegant`, `fontFamily.sans` com Inter, keyframes/animations (`fade-in-up`, `pulse-soft`), `container` já existente.
- `index.html`: `lang="pt-BR"`, título "Controle de Assinaturas", fonte Inter (Google Fonts), descrição.
- Reutilizar componentes shadcn existentes (`card`, `table`, `button`, `badge`, `dialog`, `alert-dialog`, `select`, `tabs`, `input`, `label`, `textarea`, `popover`, `calendar`, `chart`, `sidebar`, `sheet`, `sonner`, `skeleton`, `tooltip`) e criar variantes novas via `cva` (ex.: `button` `whatsapp`/`hero`, `badge` para os status de cobrança). Sem cores literais nos componentes — sempre tokens semânticos.
- Ícones: `lucide-react` (nunca emoji na UI). Nos lugares onde o documento pede indicadores coloridos (🔴🟠🟡🟢), usar badge/dot com os tokens de status.

## Estrutura de arquivos (novos/alterados)

```
src/
  lib/
    format.ts                  # formatBRL, formatData (dd/MM/aaaa), parse/format de input date
    assinaturas.ts             # regras de negócio puras (dias, status, validade, vencimento, métricas)
    whatsapp.ts                # normaliza telefone (55), monta link + mensagem padrão
  types/assinaturas.ts         # Empresa, Plano, Cliente, Pagamento, enums de status/forma
  hooks/                       # react-query: use-empresas, use-planos, use-clientes, use-cliente,
                               #   use-pagamentos, use-dashboard-metricas, use-calendario
  components/
    theme-provider.tsx         # next-themes (dark class)
    theme-toggle.tsx
    layout/AppLayout.tsx       # sidebar (ui/sidebar) + topbar + outlet mobile (sheet via use-mobile)
    charts/                    # 4 gráficos reutilizáveis (recharts + ui/chart)
    status-badge.tsx           # badge de status de cobrança
    whatsapp-button.tsx
  pages/
    dashboard/ (index.tsx, cards, alertas, filtros rápidos, métricas)
    clientes/ (index.tsx, tabela, filtros, ClienteFormDialog, ReceberPagamentoDialog, ExcluirClienteDialog)
    cliente-detalhes/ (index.tsx, dados cadastrais, financeiro, histórico, linha do tempo)
    pagamentos/ (index.tsx)
    calendario/ (index.tsx, grade do mês, diálogo do dia)
    configuracoes/ (index.tsx, PlanosCard, EmpresasCard)
src/router.tsx                 # rotas novas (com `name` semântico) sob AppLayout
src/App.tsx                    # ThemeProvider
CodeGuideline.md               # atualizar estrutura (exigência do próprio guia do projeto)
```

`src/pages/Index.tsx` deixa de ser usado pelo router e é removido. `NotFound.tsx` passa a usar textos em pt-BR. Os arquivos de i18n do template (`i18n.config.json`, `src/i18n/*`, `public/locales/*`, `language-switcher.tsx`) permanecem intactos e não são usados (app monolíngue pt-BR, sem seletor de idioma).

## Regras de negócio centralizadas (`src/lib/assinaturas.ts`)

Funções puras, usadas por dashboard, listagem, detalhes e calendário:

- `diasAteVencimento(iso)` → inteiro (negativo = vencido), comparando datas em meia-noite local.
- `statusCobranca(dias)` → `urgente` (vencido) | `hoje` (0) | `atencao` (1–2) | `em_dia` (≥3), com rótulos "Cobrar Urgente", "Cobrar Hoje", "Atenção", "Em Dia".
- `validadeLabel(dias)` → `VENCIDO HÁ X DIAS` | `VENCE HOJE` | `RESTAM X DIAS`.
- `situacaoFinanceira(dias)` → buckets do gráfico de pizza: `Em Dia` (>7), `Próximos 7 dias` (1–7), `Vence Hoje` (0), `Vencidos` (<0).
- `calcularNovoVencimento(proximoVencimentoAtual, dataPagamento, intervaloDias)` → **se pagamento em atraso (`dataPagamento > vencimento atual`): `dataPagamento + intervalo`; se pago dentro do prazo/antecipado: `vencimentoAtual + intervalo`** (mantém a periodicidade do plano).
- Métricas: `Total de Clientes`, `Ativos/Inativos`, `Novos` (cadastro ≤30 dias), `Recorrentes` (≥2 pagamentos), `Vencidos`, `Valor Total da Carteira` (soma dos valores de clientes ativos), `Valor em Dia` (vencimento ≥ hoje), `Valor Vencido` (< hoje), `MRR` (soma de `valor × 30 / intervalo_dias` dos ativos), `Total Recebido no Mês`, `Total em Aberto` (valores ativos com vencimento até o fim do mês corrente), `Ticket Médio` (média dos pagamentos do mês corrente), `Taxa de Inadimplência` (vencidos ativos / ativos).
- Alertas: vencidos, vencem hoje, vencem nos próximos 3 dias, sem pagamento há mais de 60 dias.
- Filtros rápidos: Todos, Em Dia, Vence Hoje, Próximos 3 dias, Vencidos, Ativos, Inativos → `?filtro=` na listagem.
- Gráficos: clientes por status; clientes por empresa; receita mensal (12 meses, pagamentos agrupados por mês); situação financeira (pizza).

Todas as agregações do dashboard são calculadas em uma única leitura (clientes + pagamentos + planos reaproveitados do cache react-query), sem N+1 de requisições.

## Dados de demonstração (seed)

Após a migração, inserir via `supabase_insert` (ou SQL de seed executado junto) com datas **relativas à data de execução** (current_date ± N dias):

- Empresas: CAJU, ALYMENTE 1, ALYMENTE 2.
- Planos: Semanal R$40/7 dias, Quinzenal R$75/15 dias, Mensal R$100/30 dias.
- ~24 clientes distribuídos entre as 3 empresas e 3 planos, cobrindo todos os casos: vencidos, vence hoje, próximos 1–2 dias, próximos 3–7 dias, em dia, inativos e pelo menos 2 sem pagamento há mais de 60 dias; nomes/emails/whatsapps brasileiros plausíveis.
- ~80–120 pagamentos nos últimos 12 meses, com formas de pagamento variadas (PIX, cartão, dinheiro, transferência), preenchendo `vencimento_anterior`/`vencimento_novo`, para abastecer o histórico, a receita mensal e o calendário.

## Fluxos de escrita (todas com feedback via `sonner`)

1. **Novo/Editar cliente** (dialog + `react-hook-form` + `zod`): nome, e-mail, WhatsApp, empresa, plano (pré-preenche valor pelo `valor_padrao` do plano, permitindo alterar), data de cadastro, status, valor, próximo vencimento (calculado a partir da data de cadastro + intervalo do plano, editável) e observações.
2. **Excluir cliente**: `AlertDialog` de confirmação; `pagamentos` caem por `ON DELETE CASCADE`.
3. **Receber pagamento** (dialog, disponível na listagem, nos detalhes e no calendário): valor recebido (pré-preenchido com o valor do cliente), data do pagamento, forma de pagamento, observações. Ao salvar, em transação: insere em `pagamentos` com `vencimento_anterior`/`vencimento_novo`, atualiza `clientes.proximo_vencimento` e `updated_at`, e invalida as queries de dashboard/listagem/detalhes.
4. **Configurações**: editar `valor_padrao` e `intervalo_dias` dos planos (exigência do doc) e CRUD de empresas.
5. **WhatsApp**: botão em cada cliente (lista, detalhes e alertas) abrindo `https://wa.me/55<numero>?text=<mensagem padrão do doc com o nome preenchido>` em nova aba.

## Mobile / responsividade

- Sidebar fixa no desktop e `Sheet` (drawer) no mobile (hook `use-mobile` já existente).
- Cards em grid 1/2/4 colunas; tabelas de clientes/pagamentos com versão em cards no mobile ou rolagem horizontal com colunas essenciais; diálogos full-height no mobile.
- Calendário responsivo (grade 7 colunas com células compactas e lista do dia abaixo no mobile).

## Verificação

- `pnpm lint` e `pnpm exec tsc --noEmit` (`pnpm check`) e `pnpm run build` sem erros.
- `supabase_get_table_schema` em cada tabela confirmando RLS habilitado + políticas.
- `supabase_read_query` conferindo contagens do seed (clientes por situação, pagamentos por mês).
- Preview: navegar pelas 6 rotas, criar/editar/excluir cliente, registrar pagamento e confirmar que o próximo vencimento mudou conforme o plano, ver os 4 gráficos, os alertas, o calendário e o botão de WhatsApp.
- `website_screenshot` em `mobile_390` e `desktop_1280` para as rotas `/`, `/clientes`, `/clientes/:id`, `/calendario`, nos temas claro e escuro.
- `get_console_logs` / `read_network_requests` sem erros 4xx/5xx após os fluxos acima.

## Implementation checklist

- [ ] `supabase_enable` executado com sucesso e cliente gerado em `src/integrations/supabase/client.ts`
- [ ] Migração criando `empresas`, `planos`, `clientes`, `pagamentos`, `configuracoes` com FKs, índices, `updated_at` e `ON DELETE CASCADE` em `pagamentos.cliente_id`
- [ ] RLS habilitado + políticas para `anon` nas 5 tabelas, confirmadas via `supabase_get_table_schema`
- [ ] `src/types/assinaturas.ts` com os tipos das 4 entidades e enums de status/forma de pagamento
- [ ] `src/lib/format.ts` (BRL, dd/MM/aaaa, input date) e `src/lib/whatsapp.ts` (normalização de telefone + mensagem padrão do doc)
- [ ] `src/lib/assinaturas.ts` com `diasAteVencimento`, `statusCobranca`, `validadeLabel`, `situacaoFinanceira`, `calcularNovoVencimento` e as métricas do dashboard
- [ ] Tokens azul/branco/verde + status + gradientes/sombras/animais em `src/index.css`, e extensão de `tailwind.config.ts` (cores de status, sombras, Inter, keyframes)
- [ ] `index.html` com `lang="pt-BR"`, título, descrição e fonte Inter
- [ ] `ThemeProvider`/`ThemeToggle` com `next-themes` e modo escuro funcionando em todas as rotas
- [ ] `AppLayout` com sidebar (desktop) e drawer (mobile), nav para Dashboard/Clientes/Pagamentos/Calendário/Configurações e topbar
- [ ] Dashboard com os 9 cards, os 4 gráficos (status, empresa, receita mensal 12 meses, situação financeira), painel de alertas, filtros rápidos e bloco de métricas
- [ ] `/clientes` com colunas do doc, busca, filtros de empresa/status/plano, ordenação por vencimento e filtros rápidos via `?filtro=`
- [ ] Formulário de cliente (novo/editar) validado com zod, pré-preenchendo valor pelo plano e calculando o primeiro vencimento
- [ ] Exclusão de cliente com `AlertDialog` e remoção dos pagamentos por cascade
- [ ] Dialog "Receber pagamento" gravando histórico + recalculando `proximo_vencimento` conforme o plano
- [ ] `/clientes/:id` com dados cadastrais, financeiro, histórico de pagamentos, observações e linha do tempo
- [ ] `/pagamentos` com histórico global (ID, cliente, data, valor, forma, observação) e filtros
- [ ] `/calendario` com vencimentos/recebimentos do dia, cores por situação (vencido/hoje/próximo/pago) e diálogo do dia
- [ ] `/configuracoes` com edição de `valor_padrao`/`intervalo_dias` dos planos e CRUD de empresas
- [ ] Botão de WhatsApp na listagem, nos detalhes e nos alertas, com a mensagem padrão
- [ ] Seed aplicado: 3 empresas, 3 planos, ~24 clientes cobrindo todos os estados, ~80–120 pagamentos em 12 meses
- [ ] `src/router.tsx` com as rotas novas sob `AppLayout` e `name` semântico; `src/pages/Index.tsx` removido; `NotFound` em pt-BR
- [ ] `CodeGuideline.md` atualizado com a nova estrutura de pastas
- [ ] Responsividade revisada nas 6 rotas (sidebar/drawer, grids, tabelas, calendário)

## Verification checklist

- [ ] `pnpm check` (lint + `tsc --noEmit`) passa sem erros
- [ ] `pnpm run build` conclui sem erros
- [ ] Seed conferido por `supabase_read_query`: existe ao menos 1 cliente vencido, 1 vence hoje, 1 nos próximos 1–2 dias, 1 nos próximos 3–7 dias, 1 em dia, 1 inativo e 1 sem pagamento há mais de 60 dias
- [ ] Caso positivo: registrar pagamento de um cliente em atraso gera histórico e novo vencimento = data do pagamento + intervalo do plano
- [ ] Caso positivo: registrar pagamento de um cliente em dia/antecipado gera novo vencimento = vencimento anterior + intervalo do plano
- [ ] Caso negativo/default: cliente novo sem pagamentos aparece com "Nunca pagou"/histórico vazio sem erro; filtro sem resultados mostra estado vazio, não quebra
- [ ] Caso limite: cliente com `proximo_vencimento = hoje` aparece como "Cobrar Hoje"/"VENCE HOJE" e entra no bucket "Vence Hoje" da pizza e do alerta
- [ ] Caso limite: exclusão de cliente remove os pagamentos vinculados e as somas do dashboard deixam de incluí-lo
- [ ] Caso limite: editar `valor_padrao` de um plano em `/configuracoes` altera o valor pré-preenchido em um novo cadastro e não altera clientes já existentes
- [ ] Filtros rápidos (`Em Dia`, `Vence Hoje`, `Próximos 3 dias`, `Vencidos`, `Ativos`, `Inativos`) retornam as contagens coerentes com os cards do dashboard
- [ ] `website_screenshot` de `/`, `/clientes`, `/clientes/:id` e `/calendario` em `mobile_390` e `desktop_1280` (assumindo esses dois alvos, já que não houve indicação de dispositivo)
- [ ] `get_console_logs` e `read_network_requests` sem erros após os fluxos de CRUD e pagamento

## Limitações conhecidas

- Sem login, as tabelas ficam acessíveis pelo cliente público do app (RLS permissivo para `anon`) — qualquer pessoa com a URL pode ler/gravar. Restringir exige adicionar autenticação depois.
- Datas do seed são calculadas no momento da execução; para atualizar a demonstração depois, é preciso reajustar os dados (posso adicionar um botão de "atualizar dados de demonstração" em Configurações se você quiser).
- Sem gateway de pagamento/recebimento online: os pagamentos são registrados manualmente e a cobrança é feita pelo WhatsApp, como descrito no documento.
- Sem envio automático de mensagens (o botão abre a conversa no WhatsApp, o envio é manual).
