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

        if (g.state === 'Ongoing') continue;
        if (g.rounds.length === 0) continue;

        for (const pid of pids) {
            const entry = map.get(pid);
            if (entry) entry.gamesPlayed += 1;
        }

        g.rounds?.forEach(r => {
            for (const pid of pids) {
                const entry = map.get(pid);
                if (!entry) continue;

                const score = r.scores.find(s => s.playerId === pid)?.score;

                if (typeof score === "number" && !isNaN(score)) {
                    entry.scores.push(score);
                } else {
                    // keep your current behavior
                    entry.scores.push(0);
                }

                entry.roundsPlayed += 1;
            }
        });
    }

    // --- Tunables ---
    const K = 2;         // higher -> stronger penalty for few games
    const EPS = 1e-3;    // floor for avgScore to avoid infinities

    // build final stats
    const stats: LeaderboardStat[] = players.map(p => {
        const data = map.get(p.id)!;
        const totalScore = data.scores.reduce((a, b) => a + b, 0);
        const avgScore = data.scores.length > 0 ? totalScore / data.scores.length : 0;

        // confidence term: grows with gamesPlayed but saturates to 1
        const confidence = data.gamesPlayed > 0 ? (data.gamesPlayed / (data.gamesPlayed + K)) : 0;

        // lower avgScore => higher rating; more games => higher rating
        const denom = Math.max(avgScore, EPS);
        const rating = confidence * (1 / denom);

        return {
            player: p,
            gamesPlayed: data.gamesPlayed,
            roundsPlayed: data.roundsPlayed,
            totalScore,
            avgScore,
            rating,
        };
    });

    const allZero = stats.every(s => s.totalScore === 0);
    if (allZero) return [];

    // sort by rating DESC, then more games, then name
    return stats.sort((a, b) => {
        if (a.rating !== b.rating) return b.rating - a.rating;               // DESC
        if (a.gamesPlayed !== b.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
        return a.player.name.localeCompare(b.player.name);
    });
};
