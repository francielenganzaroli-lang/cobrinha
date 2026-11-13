import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { GameBoard } from './components/GameBoard';
import { LevelProgressPanel } from './components/LevelProgressPanel';
import { RankingBoard } from './components/RankingBoard';
import { TouchControls } from './components/TouchControls';
import {
  GRID_SIZE,
  INITIAL_DIRECTION,
  INITIAL_SNAKE,
  LEVELS,
  POINTS_PER_FOOD,
  getLevelForScore,
} from './data/levels';
import { Direction, GameState, LevelConfig, Point, RankingEntry } from './types/game';
import {
  getNextHead,
  isOppositeDirection,
  isOutOfBounds,
  pointsEqual,
  spawnFood,
} from './utils/gameLogic';
import {
  playEatSound,
  playGameOverSound,
  playLevelUpSound,
} from './utils/sound';
import {
  getLastPlayerName,
  getRanking,
  saveLastPlayerName,
  saveRankingEntry,
} from './utils/storage';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [playerName, setPlayerName] = useState<string>(() => getLastPlayerName());
  const [nameError, setNameError] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [food, setFood] = useState<Point>(() =>
    spawnFood(INITIAL_SNAKE, LEVELS[0].obstacles, GRID_SIZE)
  );
  const [score, setScore] = useState<number>(0);

  const [ranking, setRanking] = useState<RankingEntry[]>(() => getRanking());
  const [lastSavedEntryId, setLastSavedEntryId] = useState<string | null>(null);
  const [lastRankPosition, setLastRankPosition] = useState<number | null>(null);

  // Refs for deterministic tick execution
  const snakeRef = useRef<Point[]>(snake);
  const directionRef = useRef<Direction>(direction);
  const directionQueueRef = useRef<Direction[]>([]);
  const foodRef = useRef<Point>(food);
  const scoreRef = useRef<number>(score);
  const levelRef = useRef<LevelConfig>(currentLevel);
  const gameStateRef = useRef<GameState>(gameState);
  const playerNameRef = useRef<string>(playerName);
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  const levelTransitionTimerRef = useRef<number | null>(null);

  snakeRef.current = snake;
  directionRef.current = direction;
  foodRef.current = food;
  scoreRef.current = score;
  levelRef.current = currentLevel;
  gameStateRef.current = gameState;
  playerNameRef.current = playerName;
  soundEnabledRef.current = soundEnabled;

  const clearLevelTransitionTimer = useCallback(() => {
    if (levelTransitionTimerRef.current !== null) {
      window.clearTimeout(levelTransitionTimerRef.current);
      levelTransitionTimerRef.current = null;
    }
  }, []);

  const resetBoardToLevel = useCallback((level: LevelConfig, resetScore: boolean) => {
    const startSnake = INITIAL_SNAKE.map((p) => ({ ...p }));
    const startFood = spawnFood(startSnake, level.obstacles, GRID_SIZE);

    snakeRef.current = startSnake;
    directionRef.current = INITIAL_DIRECTION;
    directionQueueRef.current = [];
    foodRef.current = startFood;
    levelRef.current = level;

    setSnake(startSnake);
    setDirection(INITIAL_DIRECTION);
    setFood(startFood);
    setCurrentLevel(level);

    if (resetScore) {
      scoreRef.current = 0;
      setScore(0);
    }
  }, []);

  const startFreshMatch = useCallback(() => {
    const trimmed = playerNameRef.current.trim();
    if (!trimmed) {
      setNameError('Por favor, digite seu nome antes de iniciar.');
      return;
    }

    clearLevelTransitionTimer();
    setNameError('');
    setPlayerName(trimmed);
    saveLastPlayerName(trimmed);
    setLastSavedEntryId(null);
    setLastRankPosition(null);

    resetBoardToLevel(LEVELS[0], true);
    gameStateRef.current = 'PLAYING';
    setGameState('PLAYING');
  }, [clearLevelTransitionTimer, resetBoardToLevel]);

  const returnToTitleMenu = useCallback(() => {
    clearLevelTransitionTimer();
    resetBoardToLevel(LEVELS[0], true);
    setNameError('');
    gameStateRef.current = 'TITLE_MENU';
    setGameState('TITLE_MENU');
  }, [clearLevelTransitionTimer, resetBoardToLevel]);

  const togglePause = useCallback(() => {
    if (gameStateRef.current === 'PLAYING') {
      gameStateRef.current = 'PAUSED';
      setGameState('PAUSED');
    } else if (gameStateRef.current === 'PAUSED') {
      gameStateRef.current = 'PLAYING';
      setGameState('PLAYING');
    }
  }, []);

  const enqueueDirection = useCallback((nextDir: Direction) => {
    if (gameStateRef.current !== 'PLAYING') return;

    const queue = directionQueueRef.current;
    const referenceDir =
      queue.length > 0 ? queue[queue.length - 1] : directionRef.current;

    if (nextDir === referenceDir || isOppositeDirection(referenceDir, nextDir)) {
      return;
    }

    if (queue.length < 2) {
      queue.push(nextDir);
    }
  }, []);

  const handleGameOver = useCallback(() => {
    clearLevelTransitionTimer();
    playGameOverSound(soundEnabledRef.current);

    const trimmedName = playerNameRef.current.trim() || 'Jogador';
    const finalScore = scoreRef.current;
    const finalLevel = levelRef.current.level;

    const { ranking: updatedRanking, savedEntry } = saveRankingEntry({
      playerName: trimmedName,
      score: finalScore,
      level: finalLevel,
    });

    const rankPos = updatedRanking.findIndex((item) => item.id === savedEntry.id);

    setRanking(updatedRanking);
    setLastSavedEntryId(savedEntry.id);
    setLastRankPosition(rankPos >= 0 ? rankPos + 1 : null);

    gameStateRef.current = 'GAME_OVER';
    setGameState('GAME_OVER');
  }, [clearLevelTransitionTimer]);

  // Core game tick interval
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const tick = () => {
      if (gameStateRef.current !== 'PLAYING') return;

      const currentSnake = snakeRef.current;
      const activeLevel = levelRef.current;
      const currentFood = foodRef.current;

      const nextDir = directionQueueRef.current.shift() ?? directionRef.current;
      directionRef.current = nextDir;
      setDirection(nextDir);

      const nextHead = getNextHead(currentSnake[0], nextDir);
      const willEat = pointsEqual(nextHead, currentFood);

      // Wall collision
      if (isOutOfBounds(nextHead, GRID_SIZE)) {
        handleGameOver();
        return;
      }

      // Obstacle collision
      if (activeLevel.obstacles.some((obs) => pointsEqual(obs, nextHead))) {
        handleGameOver();
        return;
      }

      // Self collision (ignore tail cell if not eating since it moves forward)
      const bodyToCheck = willEat ? currentSnake : currentSnake.slice(0, -1);
      if (bodyToCheck.some((seg) => pointsEqual(seg, nextHead))) {
        handleGameOver();
        return;
      }

      const nextSnake = willEat
        ? [nextHead, ...currentSnake]
        : [nextHead, ...currentSnake.slice(0, -1)];

      if (willEat) {
        const nextScore = scoreRef.current + POINTS_PER_FOOD;
        scoreRef.current = nextScore;
        setScore(nextScore);

        const targetLevel = getLevelForScore(nextScore);

        if (targetLevel.level > activeLevel.level) {
          playLevelUpSound(soundEnabledRef.current);
          resetBoardToLevel(targetLevel, false);
          gameStateRef.current = 'LEVEL_UP';
          setGameState('LEVEL_UP');

          levelTransitionTimerRef.current = window.setTimeout(() => {
            levelTransitionTimerRef.current = null;
            if (gameStateRef.current === 'LEVEL_UP') {
              gameStateRef.current = 'PLAYING';
              setGameState('PLAYING');
            }
          }, 1250);
          return;
        }

        playEatSound(soundEnabledRef.current);
        const nextFood = spawnFood(nextSnake, activeLevel.obstacles, GRID_SIZE);
        foodRef.current = nextFood;
        setFood(nextFood);
      }

      snakeRef.current = nextSnake;
      setSnake(nextSnake);
    };

    const intervalId = window.setInterval(tick, currentLevel.speedMs);
    return () => window.clearInterval(intervalId);
  }, [gameState, currentLevel.speedMs, handleGameOver, resetBoardToLevel]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearLevelTransitionTimer();
  }, [clearLevelTransitionTimer]);

  // Keyboard controls (Arrow keys + WASD + Space/P for pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      if (isTyping) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          enqueueDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          enqueueDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          enqueueDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          enqueueDirection('RIGHT');
          break;
        case ' ':
        case 'p':
        case 'P':
        case 'Escape':
          if (
            gameStateRef.current === 'PLAYING' ||
            gameStateRef.current === 'PAUSED'
          ) {
            e.preventDefault();
            togglePause();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enqueueDirection, togglePause]);

  const handlePlayerNameChange = (value: string) => {
    setPlayerName(value);
    if (nameError && value.trim()) {
      setNameError('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F5] text-slate-900">
      {/* Top Bar Contract: Brand wordmark — clean single-line nav links — 1 primary CTA */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-8">
          <a
            href="#arena"
            className="text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display"
          >
            Cobrinha
          </a>

          <nav
            aria-label="Navegação principal"
            className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#arena"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Arena
            </a>
            <a
              href="#niveis"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Níveis
            </a>
            <a
              href="#ranking"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Ranking
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={returnToTitleMenu}
              className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Nova Partida
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left / Center Column: Active Arena & HUD */}
          <section
            id="arena"
            aria-label="Arena do jogo"
            className="lg:col-span-7 flex flex-col gap-4"
          >
            {/* Unboxed Clean HUD Strip */}
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <div>
                  <span className="text-xs text-slate-500 block">Nível atual</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-700 font-display">
                    Nível {currentLevel.level} · {currentLevel.name}
                  </span>
                </div>
                <div className="pl-5 border-l border-slate-200">
                  <span className="text-xs text-slate-500 block">Pontuação</span>
                  <span className="text-base sm:text-lg font-bold font-mono-num text-slate-900">
                    {score} pts
                  </span>
                </div>
                {playerName.trim() && gameState !== 'TITLE_MENU' && (
                  <div className="pl-5 border-l border-slate-200 hidden sm:block">
                    <span className="text-xs text-slate-500 block">Jogador</span>
                    <span className="text-sm font-semibold text-slate-800 max-w-[140px] truncate block">
                      {playerName.trim()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
                  <>
                    <button
                      type="button"
                      onClick={togglePause}
                      aria-label={
                        gameState === 'PAUSED' ? 'Continuar jogo' : 'Pausar jogo'
                      }
                      className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {gameState === 'PAUSED' ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                          <span>Continuar</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Pausar</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={startFreshMatch}
                      aria-label="Reiniciar partida"
                      className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  aria-label={soundEnabled ? 'Silenciar efeitos sonoros' : 'Ativar efeitos sonoros'}
                  aria-pressed={!soundEnabled}
                  className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Game Canvas */}
            <GameBoard
              snake={snake}
              food={food}
              direction={direction}
              obstacles={currentLevel.obstacles}
              gameState={gameState}
              currentLevel={currentLevel}
              score={score}
              playerName={playerName}
              nameError={nameError}
              lastRankPosition={lastRankPosition}
              onPlayerNameChange={handlePlayerNameChange}
              onStartGame={startFreshMatch}
              onResumeGame={togglePause}
              onRestartGame={startFreshMatch}
              onChangePlayer={returnToTitleMenu}
              onDirectionInput={enqueueDirection}
            />

            {/* Mobile Directional Buttons (complementing touch swipe on board) */}
            <TouchControls
              disabled={gameState !== 'PLAYING'}
              onDirection={enqueueDirection}
            />

            {/* Subtle Controls & Rules Summary */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
              <span>
                Controles: Setas do teclado, WASD ou deslize/toque na tela
              </span>
              <span className="font-mono-num">
                Espaço / P para pausar
              </span>
            </div>
          </section>

          {/* Right Column: Level Progression & Persistent Ranking */}
          <aside className="lg:col-span-5 flex flex-col gap-6">
            <LevelProgressPanel currentLevel={currentLevel} score={score} />
            <RankingBoard
              entries={ranking}
              highlightedEntryId={lastSavedEntryId}
            />
          </aside>
        </div>
      </main>

      {/* Footer with visible Author Credit */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Cobrinha · 5 níveis progressivos · Ranking salvo no navegador
          </span>
          <span className="font-medium text-slate-700">
            Criado por [SEU NOME]
          </span>
        </div>
      </footer>
    </div>
  );
}
