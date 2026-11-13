import { RankingEntry } from '../types/game';

const RANKING_STORAGE_KEY = 'cobrinha_ranking_v1';
const PLAYER_NAME_STORAGE_KEY = 'cobrinha_player_name_v1';
const MAX_STORED_ENTRIES = 50;

export function sortRanking(entries: RankingEntry[]): RankingEntry[] {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.level !== a.level) return b.level - a.level;
    return new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime();
  });
}

export function getRanking(): RankingEntry[] {
  try {
    const raw = localStorage.getItem(RANKING_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid = parsed.filter(
      (item): item is RankingEntry =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as RankingEntry).id === 'string' &&
        typeof (item as RankingEntry).playerName === 'string' &&
        typeof (item as RankingEntry).score === 'number' &&
        typeof (item as RankingEntry).level === 'number' &&
        typeof (item as RankingEntry).playedAt === 'string'
    );
    return sortRanking(valid);
  } catch {
    return [];
  }
}

export function saveRankingEntry(
  entry: Omit<RankingEntry, 'id' | 'playedAt'>
): { ranking: RankingEntry[]; savedEntry: RankingEntry } {
  const newEntry: RankingEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    playerName: entry.playerName.trim(),
    score: entry.score,
    level: entry.level,
    playedAt: new Date().toISOString(),
  };

  const current = getRanking();
  const updated = sortRanking([newEntry, ...current]).slice(0, MAX_STORED_ENTRIES);

  try {
    localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors gracefully
  }

  return { ranking: updated, savedEntry: newEntry };
}

export function getLastPlayerName(): string {
  try {
    return localStorage.getItem(PLAYER_NAME_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveLastPlayerName(name: string): void {
  try {
    localStorage.setItem(PLAYER_NAME_STORAGE_KEY, name.trim());
  } catch {
    // Ignore storage errors gracefully
  }
}
