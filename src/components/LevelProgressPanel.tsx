import React from 'react';
import { Check } from 'lucide-react';
import { LEVELS, getNextLevel } from '../data/levels';
import { LevelConfig } from '../types/game';

interface LevelProgressPanelProps {
  currentLevel: LevelConfig;
  score: number;
}

export const LevelProgressPanel: React.FC<LevelProgressPanelProps> = ({
  currentLevel,
  score,
}) => {
  const nextLevel = getNextLevel(currentLevel.level);

  const progressPercent = nextLevel
    ? Math.min(
        100,
        Math.max(
          0,
          ((score - currentLevel.minScore) /
            (nextLevel.minScore - currentLevel.minScore)) *
            100
        )
      )
    : 100;

  return (
    <section
      id="niveis"
      aria-labelledby="levels-heading"
      className="bg-white rounded-xl border border-slate-200 p-5"
    >
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <h2 id="levels-heading" className="text-base font-bold text-slate-900">
          Progressão de Níveis
        </h2>
        <span className="text-xs font-mono-num text-slate-500 whitespace-nowrap">
          {nextLevel
            ? `Próximo: ${nextLevel.minScore} pts`
            : 'Nível máximo atingido'}
        </span>
      </div>

      {/* Progress bar toward next level */}
      <div
        className="w-full h-2 bg-slate-100 rounded-sm overflow-hidden mb-4"
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso para o próximo nível"
      >
        <div
          className="h-full bg-emerald-600 transition-transform duration-200 origin-left"
          style={{ transform: `scaleX(${progressPercent / 100})` }}
        />
      </div>

      <ol className="divide-y divide-slate-100">
        {LEVELS.map((lvl) => {
          const isCurrent = lvl.level === currentLevel.level;
          const isCompleted = lvl.level < currentLevel.level;

          return (
            <li
              key={lvl.level}
              className={`py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 ${
                isCurrent ? 'text-slate-900' : 'text-slate-600'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`font-mono-num font-semibold ${
                      isCurrent
                        ? 'text-emerald-700'
                        : isCompleted
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {lvl.level}.
                  </span>
                  <span
                    className={`truncate ${
                      isCurrent ? 'font-semibold text-slate-900' : 'font-medium'
                    }`}
                  >
                    {lvl.name}
                  </span>
                  {isCompleted && (
                    <Check
                      className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                      aria-label="Concluído"
                    />
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {lvl.obstacles.length === 0
                    ? 'Sem obstáculos'
                    : `${lvl.obstacles.length} blocos no mapa`}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-xs font-mono-num ${
                    isCurrent ? 'font-semibold text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {lvl.minScore} pts
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
