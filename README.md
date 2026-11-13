# Cobrinha — Jogo Snake

Jogo clássico da cobrinha desenvolvido para navegador com **5 níveis de dificuldade crescente**, mapas com obstáculos progressivos, identificação do jogador, ranking persistente em `localStorage` e controles responsivos para desktop e celular.

## Funcionalidades

- **5 níveis progressivos**: a dificuldade aumenta conforme a pontuação alcançada, elevando a velocidade da cobra e introduzindo obstáculos no tabuleiro:
  - **Nível 1 — Campo Aberto** (`0 pts`): arena livre para aquecimento.
  - **Nível 2 — Quatro Pilares** (`50 pts`): velocidade maior e 4 blocos simétricos nos quadrantes.
  - **Nível 3 — Portões Laterais** (`100 pts`): barreiras horizontais e laterais em ritmo ágil.
  - **Nível 4 — Encruzilhada** (`160 pts`): cantoneiras e pilares centrais que exigem precisão.
  - **Nível 5 — Arena Mestre** (`230 pts`): circuito interno em alta velocidade.
- **Identificação do jogador**: antes de iniciar a partida, o jogador informa seu nome.
- **Ranking persistente**: todas as partidas encerradas são registradas com nome, nível alcançado e pontuação no `localStorage` do navegador, exibindo a lista ordenada das melhores marcas entre sessões.
- **Controles para desktop e celular**:
  - **Teclado**: setas direcionais (`↑ ↓ ← →`) ou `W A S D`, além de `Espaço` / `P` para pausar.
  - **Dispositivos móveis**: gestos de deslize (*swipe*) diretamente sobre o tabuleiro e botões direcionais na tela.
- **Efeitos sonoros opcionais**: feedback sonoro sintetizado via Web Audio API com botão para silenciar.

## Estrutura do Projeto

```text
├── index.html                        # Página HTML principal e fontes
├── package.json                      # Dependências e scripts Vite
├── src/
│   ├── main.tsx                      # Ponto de entrada React
│   ├── index.css                     # Estilos base e Tailwind CSS
│   ├── App.tsx                       # Estado principal, loop do jogo e layout
│   ├── types/
│   │   └── game.ts                   # Tipos TypeScript do jogo e ranking
│   ├── data/
│   │   └── levels.ts                 # Definição dos 5 níveis, velocidades e obstáculos
│   ├── utils/
│   │   ├── gameLogic.ts              # Movimentação, colisões e geração de comida
│   │   ├── storage.ts                # Leitura e gravação do ranking no localStorage
│   │   └── sound.ts                  # Efeitos sonoros via Web Audio API
│   └── components/
│       ├── GameBoard.tsx             # Tabuleiro HTML5 Canvas, swipe e telas de estado
│       ├── TouchControls.tsx         # Controles direcionais por toque para celular
│       ├── LevelProgressPanel.tsx    # Painel de progressão dos 5 níveis
│       └── RankingBoard.tsx          # Tabela de classificação das melhores pontuações
└── README.md
```

## Como Rodar Localmente

Pré-requisito: ter o [Node.js](https://nodejs.org/) instalado (versão 18 ou superior).

1. Clone o repositório e acesse a pasta do projeto:
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO>
   cd <NOME_DA_PASTA>
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra o endereço exibido no terminal (por padrão, `http://localhost:3000`) no navegador.

Para gerar a versão de produção estática na pasta `dist/`:

```bash
npm run build
```

## Deploy na Vercel via GitHub

Este projeto gera uma aplicação estática compatível nativamente com a Vercel, sem necessidade de servidor ou banco de dados externo:

1. Faça push do código para um repositório no **GitHub**.
2. Acesse [vercel.com](https://vercel.com/) e faça login com sua conta GitHub.
3. Clique em **Add New... → Project** e selecione o repositório do jogo.
4. Confirme as configurações detectadas automaticamente pela Vercel:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Clique em **Deploy**. Em poucos segundos o aplicativo estará publicado e pronto para jogar.

## Autoria

Projeto idealizado e desenvolvido por **[SEU NOME]**.
