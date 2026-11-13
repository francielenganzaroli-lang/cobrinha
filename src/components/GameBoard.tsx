import React, { useEffect, useRef } from 'react';
import { Pause, Play, RotateCcw, UserCheck } from 'lucide-react';
import { GRID_SIZE } from '../data/levels';
import { Direction, GameState, LevelConfig, Point } from '../types/game';

interface GameBoardProps {
  snake: Point[];
  food: Point;
  direction: Direction;
  obstacles: Point[];
  gameState: GameState;
  currentLevel: LevelConfig;
  score: number;
  playerName: string;
  nameError: string;
  lastRankPosition: number | null;
  onPlayerNameChange: (name: string) => void;
  onStartGame: () => void;
  onResumeGame: () => void;
  onRestartGame: () => void;
  onChangePlayer: () => void;
  onDirectionInput: (dir: Direction) => void;
}

const CANVAS_LOGICAL_SIZE = 560;

export const GameBoard: React.FC<GameBoardProps> = ({
  snake,
  food,
  direction,
  obstacles,
  gameState,
  currentLevel,
  score,
  playerName,
  nameError,
  lastRankPosition,
  onPlayerNameChange,
  onStartGame,
  onResumeGame,
  onRestartGame,
  onChangePlayer,
  onDirectionInput,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeHandledRef = useRef(false);

  // Render board on canvas whenever game visuals update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetSize = CANVAS_LOGICAL_SIZE * dpr;
    if (canvas.width !== targetSize || canvas.height !== targetSize) {
      canvas.width = targetSize;
      canvas.height = targetSize;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const cell = CANVAS_LOGICAL_SIZE / GRID_SIZE;

    // 1. Subtle checkerboard arena surface
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#0F231A' : '#12291F';
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    // 2. Obstacles (solid carved slate blocks)
    for (const obs of obstacles) {
      const px = obs.x * cell;
      const py = obs.y * cell;
      const pad = 2;
      const size = cell - pad * 2;

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(px + pad, py + pad, size, size, 4);
      ctx.fill();

      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + pad + 1.5, py + pad + 1.5, size - 3, size - 3);

      // Subtle inner bevel dot/line for clear visual distinction
      ctx.fillStyle = '#475569';
      ctx.fillRect(px + pad + 4, py + pad + 4, size - 8, 3);
    }

    // 3. Food (ruby apple with leaf)
    {
      const cx = food.x * cell + cell / 2;
      const cy = food.y * cell + cell / 2 + 1;
      const radius = cell * 0.34;

      // Subtle warm glow behind apple
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.45, 0, Math.PI * 2);
      ctx.fill();

      // Apple body
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(cx - radius * 0.32, cy - radius * 0.32, radius * 0.24, 0, Math.PI * 2);
      ctx.fill();

      // Small green leaf
      ctx.fillStyle = '#86EFAC';
      ctx.beginPath();
      ctx.ellipse(
        cx + 2,
        cy - radius - 1.5,
        radius * 0.34,
        radius * 0.18,
        -Math.PI / 5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // 4. Snake segments (tail to head)
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const isHead = i === 0;
      const progress = snake.length > 1 ? 1 - i / (snake.length - 1) : 1;

      const pad = isHead ? 1.5 : 2.5;
      const px = seg.x * cell + pad;
      const py = seg.y * cell + pad;
      const size = cell - pad * 2;
      const radius = isHead ? 7 : 5;

      // Gradient from deep emerald tail to vivid emerald head
      if (isHead) {
        ctx.fillStyle = '#34D399';
      } else {
        const g = Math.round(145 + progress * 55);
        const b = Math.round(102 + progress * 35);
        ctx.fillStyle = `rgb(16, ${g}, ${b})`;
      }

      ctx.beginPath();
      ctx.roundRect(px, py, size, size, radius);
      ctx.fill();

      if (isHead) {
        // Directional eyes
        const centerX = seg.x * cell + cell / 2;
        const centerY = seg.y * cell + cell / 2;
        const eyeOffsetForward = cell * 0.17;
        const eyeOffsetSide = cell * 0.19;

        let e1x = centerX;
        let e1y = centerY;
        let e2x = centerX;
        let e2y = centerY;

        if (direction === 'RIGHT') {
          e1x = centerX + eyeOffsetForward;
          e1y = centerY - eyeOffsetSide;
          e2x = centerX + eyeOffsetForward;
          e2y = centerY + eyeOffsetSide;
        } else if (direction === 'LEFT') {
          e1x = centerX - eyeOffsetForward;
          e1y = centerY - eyeOffsetSide;
          e2x = centerX - eyeOffsetForward;
          e2y = centerY + eyeOffsetSide;
        } else if (direction === 'UP') {
          e1x = centerX - eyeOffsetSide;
          e1y = centerY - eyeOffsetForward;
          e2x = centerX + eyeOffsetSide;
          e2y = centerY - eyeOffsetForward;
        } else {
          e1x = centerX - eyeOffsetSide;
          e1y = centerY + eyeOffsetForward;
          e2x = centerX + eyeOffsetSide;
          e2y = centerY + eyeOffsetForward;
        }

        ctx.fillStyle = '#062016';
        ctx.beginPath();
        ctx.arc(e1x, e1y, 2.6, 0, Math.PI * 2);
        ctx.arc(e2x, e2y, 2.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(e1x - 0.5, e1y - 0.5, 0.9, 0, Math.PI * 2);
        ctx.arc(e2x - 0.5, e2y - 0.5, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }, [snake, food, direction, obstacles]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameState !== 'PLAYING') return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    swipeHandledRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameState !== 'PLAYING' || !touchStartRef.current || swipeHandledRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const threshold = 22;

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      onDirectionInput(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      onDirectionInput(dy > 0 ? 'DOWN' : 'UP');
    }
    // Reset origin so continuous swipes without lifting finger also work smoothly
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    swipeHandledRef.current = true;
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    swipeHandledRef.current = false;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame();
  };

  return (
    <div
      className="relative w-full max-w-[560px] mx-auto aspect-square rounded-xl overflow-hidden bg-[#0F231A] border border-slate-300 shadow-sm select-none"
      style={{ touchAction: gameState === 'PLAYING' ? 'none' : 'auto' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        aria-label="Tabuleiro do jogo da cobrinha"
      />

      {/* TITLE MENU OVERLAY */}
      {gameState === 'TITLE_MENU' && (
        <div className="absolute inset-0 bg-[#0A1812]/88 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
          <form
            onSubmit={handleFormSubmit}
            className="w-full max-w-sm bg-white rounded-xl p-5 sm:p-6 shadow-lg border border-slate-200 text-slate-900"
          >
            <div className="mb-4">
              <p className="text-xs font-medium text-emerald-700 mb-1">
                5 níveis progressivos · Ranking local
              </p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Identifique-se para jogar
              </h2>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Seu nome será salvo junto à pontuação no ranking ao final da partida.
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="player-name-input"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Nome do jogador
              </label>
              <input
                id="player-name-input"
                type="text"
                maxLength={24}
                value={playerName}
                onChange={(e) => onPlayerNameChange(e.target.value)}
                placeholder="Digite seu nome"
                autoComplete="nickname"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
              />
              {nameError && (
                <p role="alert" className="text-xs font-medium text-red-600 mt-1.5">
                  {nameError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>Iniciar Jogo</span>
            </button>

            <p className="text-xs text-slate-500 mt-3.5 text-center">
              Setas do teclado no computador ou deslize na tela no celular.
            </p>
          </form>
        </div>
      )}

      {/* PAUSED OVERLAY */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 bg-[#0A1812]/80 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-xl p-6 shadow-lg border border-slate-200 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-700 mb-3">
              <Pause className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Jogo Pausado</h2>
            <p className="text-sm text-slate-600 mt-1 mb-5">
              Nível {currentLevel.level} · {score} pontos
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onResumeGame}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>Continuar</span>
              </button>
              <button
                type="button"
                onClick={onRestartGame}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Reiniciar Partida</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL UP TRANSITION OVERLAY */}
      {gameState === 'LEVEL_UP' && (
        <div className="absolute inset-0 bg-[#0A1812]/78 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-xl px-6 py-5 shadow-lg border border-emerald-200 text-center max-w-xs w-full">
            <p className="text-xs font-semibold text-emerald-700 mb-1">
              Avanço de fase
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              Nível {currentLevel.level}
            </h2>
            <p className="text-sm font-medium text-slate-700 mt-0.5">
              {currentLevel.name}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {currentLevel.description}
            </p>
          </div>
        </div>
      )}

      {/* GAME OVER OVERLAY */}
      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-[#0A1812]/85 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-xl p-5 sm:p-6 shadow-lg border border-slate-200 text-center">
            <p className="text-xs font-semibold text-red-600 mb-1">
              Colisão detectada
            </p>
            <h2 className="text-2xl font-bold text-slate-900">Fim de Jogo</h2>
            <p className="text-sm text-slate-600 mt-1">
              Partida de <span className="font-semibold text-slate-900">{playerName}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 my-4 py-3.5 px-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs text-slate-500">Pontuação</p>
                <p className="text-2xl font-bold font-mono-num text-slate-900 mt-0.5">
                  {score}
                </p>
              </div>
              <div className="border-l border-slate-200">
                <p className="text-xs text-slate-500">Nível alcançado</p>
                <p className="text-2xl font-bold font-mono-num text-emerald-700 mt-0.5">
                  {currentLevel.level}
                </p>
              </div>
            </div>

            {lastRankPosition !== null && (
              <p className="text-xs text-slate-600 mb-4">
                Classificação no ranking:{' '}
                <span className="font-semibold font-mono-num text-slate-900">
                  {lastRankPosition}º lugar
                </span>
              </p>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onRestartGame}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Jogar Novamente</span>
              </button>
              <button
                type="button"
                onClick={onChangePlayer}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" aria-hidden="true" />
                <span>Trocar Jogador</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
