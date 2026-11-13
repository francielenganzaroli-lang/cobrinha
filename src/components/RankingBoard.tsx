import React from 'react';
import { Trophy } from 'lucide-react';
import { RankingEntry } from '../types/game';

interface RankingBoardProps {
  entries: RankingEntry[];
  highlightedEntryId: string | null;
}

export const RankingBoard: React.FC<RankingBoardProps> = ({
  entries,
  highlightedEntryId,
}) => {
  const topEntries = entries.slice(0, 10);

  return (
    <section
      id="ranking"
      aria-labelledby="ranking-heading"
      className="bg-white rounded-xl border border-slate-200 p-5"
    >
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
          <h2 id="ranking-heading" className="text-base font-bold text-slate-900">
            Ranking de Pontuações
          </h2>
        </div>
        <span className="text-xs font-mono-num text-slate-500 whitespace-nowrap">
          Top {Math.max(topEntries.length, 10)}
        </span>
      </div>

      {topEntries.length === 0 ? (
        <div className="py-6 text-center border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Nenhuma partida registrada ainda.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Complete uma partida para entrar no ranking.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="pb-2 pr-2 w-10">Pos.</th>
                <th className="pb-2 pr-2">Jogador</th>
                <th className="pb-2 pr-3 text-right">Nível</th>
                <th className="pb-2 text-right">Pontos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {topEntries.map((entry, idx) => {
                const isHighlighted = entry.id === highlightedEntryId;
                return (
                  <tr
                    key={entry.id}
                    className={
                      isHighlighted
                        ? 'bg-emerald-50/80 font-semibold text-slate-900'
                        : 'text-slate-700'
                    }
                  >
                    <td className="py-2 pr-2 font-mono-num text-xs text-slate-500">
                      {idx + 1}º
                    </td>
                    <td className="py-2 pr-2 max-w-[140px] truncate text-slate-900">
                      {entry.playerName}
                    </td>
                    <td className="py-2 pr-3 text-right font-mono-num text-xs text-slate-600">
                      N{entry.level}
                    </td>
                    <td className="py-2 text-right font-mono-num font-semibold text-slate-900">
                      {entry.score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
