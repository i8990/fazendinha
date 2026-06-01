const { jsPDF } = require('jspdf');

// Conteúdo do resumo
const content = `
═══════════════════════════════════════════════════════════
         RESUMO DAS PÁGINAS DO FAZENDINHA APP
═══════════════════════════════════════════════════════════

📂 ARQUIVOS ENCONTRADOS (10 arquivos)
─────────────────────────────────────
| # | Arquivo              | Componente Principal Exportado |
├───┼──────────────────────┼─────────────────────────────────
| 1 | Dashboard.jsx        | Função Dashboard                |
| 2 | Financeiro.jsx       | Função Financeiro               |
| 3 | FinanceiroPessoal.jsx| Função FinanceiroPessoal        |
| 4 | Historico.jsx        | ManejoDetailPage, MovDetailPage, HistoricoManejo |
| 5 | Animais.jsx          | AnimalDetailPage, Animais       |
| 6 | Pastos.jsx           | PastoDetailPage, Pastos         |
| 7 | Login.jsx            | Componente Login (default)      |
| 8 | Ajuda.jsx            | Função Ajuda                    |
| 9 | Settings.jsx         | Função Settings                 |
|10 | GlobalModals.jsx     | Função GlobalModals             |

═══════════════════════════════════════════════════════════

📋 PÁGINA 1: DASHBOARD (pages/Dashboard.jsx)
────────────────────────────────────────────
Componente Principal:
  export function Dashboard({ pastos, animais, sal, fin, cfg, setPage, setAction })

Estados Locais: Nenhum (componente "dumb")

Funcionalidades Principais:
  ✓ KPIs em tempo real (animais ativos, adultos, bezerros)
  ✓ Cálculo financeiro mensal
  ✓ Sistema de alertas críticos
  ✓ Ações rápidas (nascimento, sal mineral, despesa, gasolina)

Funcionalidades Especiais:
  • Header sticky com data e contadores
  • Card de bezerros recentes com idade calculada
  • Grid de ações rápidas com sprites
  • Widget do clima (ClimaWidget)
  • Card financeiro mensal

═══════════════════════════════════════════════════════════

📋 PÁGINA 2: FINANCEIRO (pages/Financeiro.jsx)
─────────────────────────────────────────────
Componente Principal:
  export function Financeiro({ fin, setFin, finP, setFinP })

Estados Locais:
  • aba - Aba atual ('tudo', 'rec' ou 'desp')
  • modal - Controle do modal de nova transação
  • detail - Transação selecionada para visualização
  • editFinM - Modal de edição de lançamento
  • mesIdx, ano - Navegação temporal
  • abaGeral - Aba Fazenda vs Pessoal

Funcionalidades Principais:
  ✓ Cálculos financeiros (receitas, despesas, saldo)
  ✓ Adicionar transação com ID único
  ✓ Navegação entre meses/anos

Funcionalidades Especiais:
  • Gráfico de barras (Recharts) - 6 meses comparativos
  • Navegação temporal com botões ‹ ›
  • Card de saldo colorido (verde/vermelho)
  • Modal de nova transação com seleção rápida
  • Tela de detalhe em página separada
  • Edição de lançamentos com modal reutilizável

═══════════════════════════════════════════════════════════

📋 PÁGINA 3: FINANCEIRO PESSOAL (pages/FinanceiroPessoal.jsx)
───────────────────────────────────────────────────────────
Componente Principal:
  export function FinanceiroPessoal({ finP, setFinP })

Diferenciais em relação ao Financeiro principal:
  • Breakdown por categoria com barra de progresso
  • Ícones temáticos para cada categoria
  • Cores azuis em vez de verdes

Funcionalidades Especiais:
  • Lista expansível mostrando % de cada categoria
  • Ícones: 💼 Salário, 🍽️ Alimentação, ❤️ Saúde, etc.
  • Barra de progresso visual com transição CSS

═══════════════════════════════════════════════════════════

📋 PÁGINA 4: HISTÓRICO (pages/Historico.jsx)
───────────────────────────────────────────
Componentes Principais:
  • ManejoDetailPage - Detalhe de manejo
  • MovDetailPage - Detalhe de movimentação
  • HistoricoManejo - Timeline unificada

Estados Locais (HistoricoManejo):
  • filtro - Filtro da timeline ('todos', 'manejo', 'mov', 'nascimento', 'fin')
  • curral - Modal da ferramenta de curral
  • detailManejo, detailMov, detailFin - Telas de detalhe fullscreen

Funcionalidades Principais:
  ✓ Timeline unificada - agrega eventos de múltiplas fontes
  ✓ CalendarView - calendário mensal com marcadores coloridos
  ✓ KPIs do mês atual
  ✓ Filtros rápidos por categoria

Funcionalidades Especiais:
  • Timeline cronológica de todos os eventos
  • Calendário mensal com marcadores por tipo
  • Ferramenta de Curral (modal com checklist por brinco)

═══════════════════════════════════════════════════════════

📋 PÁGINA 5: ANIMAIS (pages/Animais.jsx)
───────────────────────────────────────
Componentes Principais:
  • AnimalDetailPage - Detalhe de animal individual
  • Animais - Lista e gerenciamento do rebanho

Estados Locais (AnimalDetailPage):
  • moveM, dest, obsM - Modal de mover animal para outro pasto
  • editM, ef - Modal de edição do animal
  • vendaM, venda - Modal de venda com geração automática

Funcionalidades Principais:
  ✓ Tabs internas: Rebanho, Bezerros, Pastos, Manejo, Vendidos
  ✓ Busca em tempo real por identificador ou lote
  ✓ Ordenação inteligente (separa números de alfanuméricos)
  ✓ Cálculo de idade com calcIdade()
  ✓ Linhagem - mostra mãe e filhos do animal

Funcionalidades Especiais:
  • Venda de gado gera receita distribuída em 12 meses
  • Mover animal entre pastos com registro automático
  • Sprite integration para diferentes categorias
  • Integração com calcIdade() para bezerros

═══════════════════════════════════════════════════════════

📋 PÁGINA 6: PASTOS (pages/Pastos.jsx)
─────────────────────────────────────
Componentes Principais:
  • PastoDetailPage - Detalhe de pasto individual
  • Pastos - Lista e gerenciamento dos pastos

Estados Locais (PastoDetailPage):
  • editM - Modal de edição do pasto
  • ef - Estado da edição (nome, tamanho, capacidade)

Funcionalidades Principais:
  ✓ Cálculo automático de sal mineral
  ✓ Status visual baseado na duração do sal
  ✓ Ocupação do pasto em porcentagem
  ✓ Histórico completo (sal, animais, movimentações, manejos)

Funcionalidades Especiais:
  • MapaMedicao - medição de área via satélite ESRI
  • Barra de progresso com cores de alerta para sal mineral
  • Botão de medição por satélite que aplica área automaticamente

═══════════════════════════════════════════════════════════

📋 PÁGINA 7: LOGIN (pages/Login.jsx)
───────────────────────────────────
Componente Principal:
  export default function Login({ onLogin })

Estados Locais:
  • modo - 'entrar' ou 'cadastrar'
  • email, senha - Campos de formulário
  • loading - Estado de carregamento
  • erro, sucesso - Mensagens de feedback

Funcionalidades Principais:
  ✓ Autenticação com Supabase (signIn)
  ✓ Cadastro com validação mínima (senha ≥ 6 caracteres)

Funcionalidades Especiais:
  • Design responsivo (100% da altura viewport dvh)
  • Feedback visual com cores distintas para erro/sucesso
  • Loading state - botão desabilitado durante processamento
  • Header estilizado com gradiente e logo

═══════════════════════════════════════════════════════════

📋 PÁGINA 8: AJUDA (pages/Ajuda.jsx)
───────────────────────────────────
Componente Principal:
  export function Ajuda({ onClose })

Estados Locais:
  • viewer - Modal aberto ('usuario' ou 'dev')

Funcionalidades Principais:
  ✓ Renderiza manuais em iframes fullscreen

Funcionalidades Especiais:
  • ManualViewer - wrapper que exibe iframes fullscreen
  • Dois manuais: Usuário e Desenvolvedor com temas diferentes
  • Design imersivo - ocupa tela inteira para leitura confortável

═══════════════════════════════════════════════════════════

📋 PÁGINA 9: SETTINGS (pages/Settings.jsx)
─────────────────────────────────────────
Componente Principal:
  export function Settings({ syncing, onSync, dark, setDark, onReset, onClose, movs, manejos, animais, fin, pastos, sal })

Estados Locais:
  • confirmReset, importing, importOk - Controles de backup/reset
  • aba - Aba 'geral' ou 'historico'
  • ajudaOpen - Modal de ajuda aberto

Funcionalidades Principais:
  ✓ Importação de backup JSON (dbImport)
  ✓ Exportação de backup (dbExport)
  ✓ Sincronização com servidor Supabase
  ✓ Modo escuro (toggle dark/light)

Funcionalidades Especiais:
  • Backup/Restore - importa e exporta JSON completo do banco de dados
  • Reset completo - apaga todos os dados com confirmação dupla
  • Calendário de eventos - visualização mensal de manejos, nascimentos e movimentações
  • Importa Ajuda - abre modal fullscreen para manuais

═══════════════════════════════════════════════════════════

📋 PÁGINA 10: GLOBAL MODALS (pages/GlobalModals.jsx)
───────────────────────────────────────────────────
Componente Principal:
  export function GlobalModals({ action, onClose, pastos, animais, setAnimais, setSal, setMovs, fin, setFin, setManejos })

Estados Locais:
  • fS, fN, pBusca, pAnimal, pDest, pObs - Modais de sal, nascimento e movimentação
  • fD - Modal de despesa rápida
  • gDistancia, gConsumo, gPreco, gValorEdit - Modal de gasolina com cálculo automático

Funcionalidades Principais:
  ✓ 5 modais rápidos acessíveis via setAction() do Dashboard
  ✓ Busca em tempo real para filtrar animais

Funcionalidades Especiais:
  • Cálculo automático de custo de combustível (ida e volta)
  • Persistência local - configurações de veículo salvas no localStorage

═══════════════════════════════════════════════════════════

📊 TABELA RESUMIDA DE PROPRIEDADES
───────────────────────────────────
| Página              | Props Recebidas                          | Props Passadas                    |
|---------------------|------------------------------------------|-----------------------------------|
| Dashboard           | pastos, animais, sal, fin, cfg, setPage  | N/A                              |
| Financeiro          | fin, setFin, finP, setFinP               | → FinanceiroPessoal.jsx           |
| FinanceiroPessoal   | finP, setFinP                            | N/A                              |
| Historico           | movs, manejos, animais, fin, pastos      | → CurralTool.jsx                  |
| Animais             | animais, pastos, movs, sal, manejos, fin | → Pastos.jsx, → HistoricoManejo   |
| Pastos              | pastos, animais, sal, manejos, movs      | N/A                              |
| Login               | onLogin                                  | N/A                              |
| Ajuda               | onClose                                  | N/A                              |
| Settings            | syncing, dark, onReset, movs, fin        | → Ajuda.jsx                       |
| GlobalModals        | action, pastos, animais, fin             | N/A                              |

═══════════════════════════════════════════════════════════

🎯 FUNCIONALIDADES ESPECIAIS POR PÁGINA
───────────────────────────────────────

GRÁFICOS E VISUALIZAÇÕES:
| Página       | Tipo de Gráfico                    | Biblioteca  |
|--------------|------------------------------------|-------------|
| Financeiro   | BarChart (Entradas vs Saídas)      | Recharts    |
| FinanceiroPessoal | BarChart + Breakdown        | Recharts    |

FORMULÁRIOS COMPLEXOS:
| Página       | Formulário                    | Campos Principais                              |
|--------------|-------------------------------|------------------------------------------------|
| Animais      | Cadastro de animal            | Identificador, raça, lote, sexo, peso, mãe     |
| Pastos       | Cadastro de pasto             | Nome, tamanho, capacidade, status, taxa de sal  |
| GlobalModals | Despesa rápida                | Descrição, valor, categoria (dropdown), data   |

FERRAMENTAS EXTERNAS:
| Página    | Ferramenta        | Função                              |
|-----------|-------------------|-------------------------------------|
| Historico | CurralTool        | Checklist por brinco para manejos   |
| Pastos    | MapaMedicao       | Medição de área via satélite ESRI   |
| Dashboard | ClimaWidget       | Widget do clima atual               |

═══════════════════════════════════════════════════════════

🔄 FLUXO DE NAVEGAÇÃO ENTRE PÁGINAS
───────────────────────────────────

App.jsx (Root)
    │
    ├──→ Login.jsx        (página inicial, autenticação)
    │
    └──→ Dashboard.jsx    (tela principal)
           │
           ├──→ Financeiro.jsx  (via setPage('financeiro'))
           │       │
           │       └──→ FinanceiroPessoal.jsx (aba interna)
           │
           ├──→ Animais.jsx     (via setAction('nascimento') → GlobalModals)
           │       │
           │       ├──→ AnimalDetailPage.jsx  (detalhe de animal)
           │       ├──→ Pastos.jsx    (aba interna)
           │       └──→ HistoricoManejo (aba interna)
           │
           ├──→ Settings.jsx   (via setAction('settings'))
           │       │
           │       └──→ Ajuda.jsx     (modal fullscreen)
           │
           └──→ GlobalModals.jsx  (modais rápidos via setAction())
                   ├──→ 'sal'        → Modal de sal mineral
                   ├──→ 'nascimento' → Modal de nascimento
                   ├──→ 'pasto'      → Modal de movimentação
                   ├──→ 'gasolina'   → Modal de combustível
                   └──→ 'despesa'    → Modal de despesa rápida

═══════════════════════════════════════════════════════════

📝 CONCLUSÃO
────────────
O projeto FAZENDINHA APP possui uma arquitetura bem estruturada com:

✓ 10 páginas principais cobrindo todas as funcionalidades do app
✓ Componentes reutilizáveis (DetailPage, Modal, Card, etc.)
✓ Integração externa com Supabase para autenticação e sincronização
✓ Gráficos modernos usando Recharts para visualização financeira
✓ Ferramentas especializadas (CurralTool, MapaMedicao)
✓ Design responsivo otimizado para mobile-first

═══════════════════════════════════════════════════════════
`; // Adicionei quebra de linha no final

// Configuração do PDF
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: [148, 210] // A5 landscape para mais espaço
});

// Função para adicionar texto com quebra de linha automática
function addTextWithWrap(doc, text, x, y, maxWidth = 130) {
  const splitText = doc.splitTextToSize(text, maxWidth);
  let currentY = y;
  
  for (let i = 0; i < splitText.length; i++) {
    if (currentY > 297) { // A5 landscape height
      doc.addPage();
      currentY = 10;
    }
    doc.setFontSize(11);
    doc.text(splitText[i], x, currentY);
    currentY += 5; // Espaçamento entre linhas
  }
}

// Adicionar cabeçalho e título
const headerColor = [41, 128, 185];
doc.setFillColor(...headerColor);
doc.rect(0, 0, 210, 15, 'F'); // Cabeçalho azul

doc.setTextColor(255, 255, 255);
doc.setFontSize(16);
doc.text('RESUMO DAS PÁGINAS DO FAZENDINHA APP', 10, 8, null, null, 'center');

doc.setTextColor(...headerColor);
doc.setFontSize(10);
doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 175, 12, null, null, 'right');

// Adicionar conteúdo principal
const sectionColors = {
  title: [33, 33, 33],
  header: [41, 128, 185],
  separator: [200, 200, 200]
};

let currentY = 20;
const maxContentHeight = 270; // Espaço para conteúdo

// Função para adicionar seção
function addSection(title, content) {
  if (currentY + 15 > maxContentHeight) {
    doc.addPage();
    currentY = 10;
  }
  
  // Título da seção
  doc.setFillColor(...sectionColors.header);
  doc.rect(10, currentY, 200, 3, 'F');
  
  doc.setTextColor(...sectionColors.title);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, currentY + 4);
  
  // Conteúdo
  doc.setTextColor(...sectionColors.separator);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  addTextWithWrap(doc, content, 15, currentY + 8);
  
  currentY += 20;
}

// Processar o conteúdo e adicionar seções
const sections = [
  {
    title: 'ARQUIVOS ENCONTRADOS (10 arquivos)',
    content: `
| # | Arquivo              | Componente Principal Exportado |
├───┼──────────────────────┼─────────────────────────────────
| 1 | Dashboard.jsx        | Função Dashboard                |
| 2 | Financeiro.jsx       | Função Financeiro               |
| 3 | FinanceiroPessoal.jsx| Função FinanceiroPessoal        |
| 4 | Historico.jsx        | ManejoDetailPage, MovDetailPage, HistoricoManejo |
| 5 | Animais.jsx          | AnimalDetailPage, Animais       |
| 6 | Pastos.jsx           | PastoDetailPage, Pastos         |
| 7 | Login.jsx            | Componente Login (default)      |
| 8 | Ajuda.jsx            | Função Ajuda                    |
| 9 | Settings.jsx         | Função Settings                 |
|10 | GlobalModals.jsx     | Função GlobalModals             |`
  },
  {
    title: 'PÁGINA 1: DASHBOARD',
    content: `
Componente Principal:
  export function Dashboard({ pastos, animais, sal, fin, cfg, setPage, setAction })

Estados Locais: Nenhum (componente "dumb")

Funcionalidades Principais:
  ✓ KPIs em tempo real (animais ativos, adultos, bezerros)
  ✓ Cálculo financeiro mensal
  ✓ Sistema de alertas críticos
  ✓ Ações rápidas (nascimento, sal mineral, despesa, gasolina)

Funcionalidades Especiais:
  • Header sticky com data e contadores
  • Card de bezerros recentes com idade calculada
  • Grid de ações rápidas com sprites
  • Widget do clima (ClimaWidget)
  • Card financeiro mensal`
  },
  {
    title: 'PÁGINA 2: FINANCEIRO',
    content: `
Componente Principal:
  export function Financeiro({ fin, setFin, finP, setFinP })

Estados Locais:
  • aba - Aba atual ('tudo', 'rec' ou 'desp')
  • modal - Controle do modal de nova transação
  • detail - Transação selecionada para visualização
  • editFinM - Modal de edição de lançamento
  • mesIdx, ano - Navegação temporal
  • abaGeral - Aba Fazenda vs Pessoal

Funcionalidades Principais:
  ✓ Cálculos financeiros (receitas, despesas, saldo)
  ✓ Adicionar transação com ID único
  ✓ Navegação entre meses/anos

Funcionalidades Especiais:
  • Gráfico de barras (Recharts) - 6 meses comparativos
  • Navegação temporal com botões ‹ ›
  • Card de saldo colorido (verde/vermelho)
  • Modal de nova transação com seleção rápida
  • Tela de detalhe em página separada
  • Edição de lançamentos com modal reutilizável`
  },
  {
    title: 'PÁGINA 3: FINANCEIRO PESSOAL',
    content: `
Componente Principal:
  export function FinanceiroPessoal({ finP, setFinP })

Diferenciais em relação ao Financeiro principal:
  • Breakdown por categoria com barra de progresso
  • Ícones temáticos para cada categoria
  • Cores azuis em vez de verdes

Funcionalidades Especiais:
  • Lista expansível mostrando % de cada categoria
  • Ícones: 💼 Salário, 🍽️ Alimentação, ❤️ Saúde, etc.
  • Barra de progresso visual com transição CSS`
  },
  {
    title: 'PÁGINA 4: HISTÓRICO',
    content: `
Componentes Principais:
  • ManejoDetailPage - Detalhe de manejo
  • MovDetailPage - Detalhe de movimentação
  • HistoricoManejo - Timeline unificada

Estados Locais (HistoricoManejo):
  • filtro - Filtro da timeline ('todos', 'manejo', 'mov', 'nascimento', 'fin')
  • curral - Modal da ferramenta de curral
  • detailManejo, detailMov, detailFin - Telas de detalhe fullscreen

Funcionalidades Principais:
  ✓ Timeline unificada - agrega eventos de múltiplas fontes
  ✓ CalendarView - calendário mensal com marcadores coloridos
  ✓ KPIs do mês atual
  ✓ Filtros rápidos por categoria

Funcionalidades Especiais:
  • Timeline cronológica de todos os eventos
  • Calendário mensal com marcadores por tipo
  • Ferramenta de Curral (modal com checklist por brinco)`
  },
  {
    title: 'PÁGINA 5: ANIMAIS',
    content: `
Componentes Principais:
  • AnimalDetailPage - Detalhe de animal individual
  • Animais - Lista e gerenciamento do rebanho

Estados Locais (AnimalDetailPage):
  • moveM, dest, obsM - Modal de mover animal para outro pasto
  • editM, ef - Modal de edição do animal
  • vendaM, venda - Modal de venda com geração automática

Funcionalidades Principais:
  ✓ Tabs internas: Rebanho, Bezerros, Pastos, Manejo, Vendidos
  ✓ Busca em tempo real por identificador ou lote
  ✓ Ordenação inteligente (separa números de alfanuméricos)
  ✓ Cálculo de idade com calcIdade()
  ✓ Linhagem - mostra mãe e filhos do animal

Funcionalidades Especiais:
  • Venda de gado gera receita distribuída em 12 meses
  • Mover animal entre pastos com registro automático
  • Sprite integration para diferentes categorias
  • Integração com calcIdade() para bezerros`
  },
  {
    title: 'PÁGINA 6: PASTOS',
    content: `
Componentes Principais:
  • PastoDetailPage - Detalhe de pasto individual
  • Pastos - Lista e gerenciamento dos pastos

Estados Locais (PastoDetailPage):
  • editM - Modal de edição do pasto
  • ef - Estado da edição (nome, tamanho, capacidade)

Funcionalidades Principais:
  ✓ Cálculo automático de sal mineral
  ✓ Status visual baseado na duração do sal
  ✓ Ocupação do pasto em porcentagem
  ✓ Histórico completo (sal, animais, movimentações, manejos)

Funcionalidades Especiais:
  • MapaMedicao - medição de área via satélite ESRI
  • Barra de progresso com cores de alerta para sal mineral
  • Botão de medição por satélite que aplica área automaticamente`
  },
  {
    title: 'PÁGINA 7: LOGIN',
    content: `
Componente Principal:
  export default function Login({ onLogin })

Estados Locais:
  • modo - 'entrar' ou 'cadastrar'
  • email, senha - Campos de formulário
  • loading - Estado de carregamento
  • erro, sucesso - Mensagens de feedback

Funcionalidades Principais:
  ✓ Autenticação com Supabase (signIn)
  ✓ Cadastro com validação mínima (senha ≥ 6 caracteres)

Funcionalidades Especiais:
  • Design responsivo (100% da altura viewport dvh)
  • Feedback visual com cores distintas para erro/sucesso
  • Loading state - botão desabilitado durante processamento
  • Header estilizado com gradiente e logo`
  },
  {
    title: 'PÁGINA 8: AJUDA',
    content: `
Componente Principal:
  export function Ajuda({ onClose })

Estados Locais:
  • viewer - Modal aberto ('usuario' ou 'dev')

Funcionalidades Principais:
  ✓ Renderiza manuais em iframes fullscreen

Funcionalidades Especiais:
  • ManualViewer - wrapper que exibe iframes fullscreen
  • Dois manuais: Usuário e Desenvolvedor com temas diferentes
  • Design imersivo - ocupa tela inteira para leitura confortável`
  },
  {
    title: 'PÁGINA 9: SETTINGS',
    content: `
Componente Principal:
  export function Settings({ syncing, onSync, dark, setDark, onReset, onClose, movs, manejos, animais, fin, pastos, sal })

Estados Locais:
  • confirmReset, importing, importOk - Controles de backup/reset
  • aba - Aba 'geral' ou 'historico'
  • ajudaOpen - Modal de ajuda aberto

Funcionalidades Principais:
  ✓ Importação de backup JSON (dbImport)
  ✓ Exportação de backup (dbExport)
  ✓ Sincronização com servidor Supabase
  ✓ Modo escuro (toggle dark/light)

Funcionalidades Especiais:
  • Backup/Restore - importa e exporta JSON completo do banco de dados
  • Reset completo - apaga todos os dados com confirmação dupla
  • Calendário de eventos - visualização mensal de manejos, nascimentos e movimentações
  • Importa Ajuda - abre modal fullscreen para manuais`
  },
  {
    title: 'PÁGINA 10: GLOBAL MODALS',
    content: `
Componente Principal:
  export function GlobalModals({ action, onClose, pastos, animais, setAnimais, setSal, setMovs, fin, setFin, setManejos })

Estados Locais:
  • fS, fN, pBusca, pAnimal, pDest, pObs - Modais de sal, nascimento e movimentação
  • fD - Modal de despesa rápida
  • gDistancia, gConsumo, gPreco, gValorEdit - Modal de gasolina com cálculo automático

Funcionalidades Principais:
  ✓ 5 modais rápidos acessíveis via setAction() do Dashboard
  ✓ Busca em tempo real para filtrar animais

Funcionalidades Especiais:
  • Cálculo automático de custo de combustível (ida e volta)
  • Persistência local - configurações de veículo salvas no localStorage`
  },
  {
    title: 'TABELA RESUMIDA DE PROPRIEDADES',
    content: `
| Página              | Props Recebidas                          | Props Passadas                    |
|---------------------|------------------------------------------|-----------------------------------|
| Dashboard           | pastos, animais, sal, fin, cfg, setPage  | N/A                              |
| Financeiro          | fin, setFin, finP, setFinP               | → FinanceiroPessoal.jsx           |
| FinanceiroPessoal   | finP, setFinP                            | N/A                              |
| Historico           | movs, manejos, animais, fin, pastos      | → CurralTool.jsx                  |
| Animais             | animais, pastos, movs, sal, manejos, fin | → Pastos.jsx, → HistoricoManejo   |
| Pastos              | pastos, animais, sal, manejos, movs      | N/A                              |
| Login               | onLogin                                  | N/A                              |
| Ajuda               | onClose                                  | N/A                              |
| Settings            | syncing, dark, onReset, movs, fin        | → Ajuda.jsx                       |
| GlobalModals        | action, pastos, animais, fin             | N/A                              |`
  },
  {
    title: 'FUNCIONALIDADES ESPECIAIS POR PÁGINA',
    content: `
GRÁFICOS E VISUALIZAÇÕES:
| Página       | Tipo de Gráfico                    | Biblioteca  |
|--------------|------------------------------------|-------------|
| Financeiro   | BarChart (Entradas vs Saídas)      | Recharts    |
| FinanceiroPessoal | BarChart + Breakdown        | Recharts    |

FORMULÁRIOS COMPLEXOS:
| Página       | Formulário                    | Campos Principais                              |
|--------------|-------------------------------|------------------------------------------------|
| Animais      | Cadastro de animal            | Identificador, raça, lote, sexo, peso, mãe     |
| Pastos       | Cadastro de pasto             | Nome, tamanho, capacidade, status, taxa de sal  |
| GlobalModals | Despesa rápida                | Descrição, valor, categoria (dropdown), data   |

FERRAMENTAS EXTERNAS:
| Página    | Ferramenta        | Função                              |
|-----------|-------------------|-------------------------------------|
| Historico | CurralTool        | Checklist por brinco para manejos   |
| Pastos    | MapaMedicao       | Medição de área via satélite ESRI   |
| Dashboard | ClimaWidget       | Widget do clima atual               |`
  },
  {
    title: 'FLUXO DE NAVEGAÇÃO ENTRE PÁGINAS',
    content: `
App.jsx (Root)
    │
    ├──→ Login.jsx        (página inicial, autenticação)
    │
    └──→ Dashboard.jsx    (tela principal)
           │
           ├──→ Financeiro.jsx  (via setPage('financeiro'))
           │       │
           │       └──→ FinanceiroPessoal.jsx (aba interna)
           │
           ├──→ Animais.jsx     (via setAction('nascimento') → GlobalModals)
           │       │
           │       ├──→ AnimalDetailPage.jsx  (detalhe de animal)
           │       ├──→ Pastos.jsx    (aba interna)
           │       └──→ HistoricoManejo (aba interna)
           │
           ├──→ Settings.jsx   (via setAction('settings'))
           │       │
           │       └──→ Ajuda.jsx     (modal fullscreen)
           │
           └──→ GlobalModals.jsx  (modais rápidos via setAction())
                   ├──→ 'sal'        → Modal de sal mineral
                   ├──→ 'nascimento' → Modal de nascimento
                   ├──→ 'pasto'      → Modal de movimentação
                   ├──→ 'gasolina'   → Modal de combustível
                   └──→ 'despesa'    → Modal de despesa rápida`
  },
  {
    title: 'CONCLUSÃO',
    content: `
O projeto FAZENDINHA APP possui uma arquitetura bem estruturada com:

✓ 10 páginas principais cobrindo todas as funcionalidades do app
✓ Componentes reutilizáveis (DetailPage, Modal, Card, etc.)
✓ Integração externa com Supabase para autenticação e sincronização
✓ Gráficos modernos usando Recharts para visualização financeira
✓ Ferramentas especializadas (CurralTool, MapaMedicao)
✓ Design responsivo otimizado para mobile-first`
  }
];

// Adicionar cada seção
sections.forEach(section => {
  addSection(section.title, section.content);
});

// Rodapé
const footerY = doc.internal.pageSize.height - 10;
doc.setFillColor(240, 240, 240);
doc.rect(0, footerY, 210, 10, 'F');

doc.setTextColor(100, 100, 100);
doc.setFontSize(8);
doc.text('Resumo gerado automaticamente - Fazendinha App', 105, footerY + 6, null, null, 'center');

// Salvar PDF
const pdfPath = '/Users/jblleite/Desktop/fazendinha/resumo_paginas.pdf';
doc.save(pdfPath);

console.log(`✅ PDF gerado com sucesso: ${pdfPath}`);
