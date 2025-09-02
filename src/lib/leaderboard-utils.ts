import type { Game, Player } from "@/models/types";

/* ---------------- Types ---------------- */
export interface LeaderboardStat {
    player: Player;
    gamesPlayed: number;
    roundsPlayed: number;
    totalScore: number;
    avgScore: number;
    rating: number; // lower = better
}

/* ---------------- Core Leaderboard Logic ---------------- */
export const computeLeaderboard = (
    players: Player[],
    games: Game[]
): LeaderboardStat[] => {
    // map of player -> accumulator
    const map = new Map(
        players.map(p => [
            p.id,
            { scores: [] as number[], gamesPlayed: 0, roundsPlayed: 0 },
        ])
    );

    for (const g of games) {
        const pids = g.playerIds ?? [];

        // even ongoing/fake games count as "played"
        for (const pid of pids) {
            const entry = map.get(pid);
            if (entry) entry.gamesPlayed += 1;
        }

        g.rounds?.forEach(r => {
            // each round might be incomplete (some players missing scores)
            for (const pid of pids) {
                const entry = map.get(pid);
                if (!entry) continue;

                const score = r.scores.find(s => s.playerId === pid)?.score;

                if (typeof score === "number" && !isNaN(score)) {
                    entry.scores.push(score);
                } else {
                    // missing = treat as 0, so fake/incomplete games don’t break things
                    entry.scores.push(0);
                }

                entry.roundsPlayed += 1;
            }
        });
    }

    // build final stats
    const stats: LeaderboardStat[] = players.map(p => {
        const data = map.get(p.id)!;
        const totalScore = data.scores.reduce((a, b) => a + b, 0);
        const avgScore = data.scores.length > 0 ? totalScore / data.scores.length : 0;

        // if no games -> put last by giving Infinity
        const rating =
            data.gamesPlayed === 0 ? Number.POSITIVE_INFINITY : avgScore;

        return {
            player: p,
            gamesPlayed: data.gamesPlayed,
            roundsPlayed: data.roundsPlayed,
            totalScore,
            avgScore,
            rating,
        };
    });

    // 🚨 NEW: if everyone has 0 scores, return empty
    const allZero = stats.every(s => s.totalScore === 0);
    if (allZero) return [];

    // default sort: lowest rating first, then more games, then name
    return stats.sort((a, b) => {
        if (a.rating !== b.rating) return a.rating - b.rating;
        if (a.gamesPlayed !== b.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
        return a.player.name.localeCompare(b.player.name);
    });
};
