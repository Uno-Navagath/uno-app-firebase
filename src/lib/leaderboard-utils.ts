import type {Game, Player} from "@/models/types";

/* ---------------- Types ---------------- */
export interface LeaderboardStat {
    player: Player;
    gamesPlayed: number;
    roundsPlayed: number;
    totalScore: number;
    avgPerRound: number;        // raw average (lower is better)
    adjAvgPerRound: number;     // shrunken average (lower is better) -> used for ranking
    rating: number;             // convenience: 1 / adjAvgPerRound (higher is better)
    provisional: boolean;
}


type Options = {
    shrinkageRounds?: number;   // K in the formula -> higher = stronger penalty for low-sample
    minGamesForNonProvisional?: number;
    minRoundsForNonProvisional?: number;
    includeZeroRoundPlayers?: boolean; // if true, they appear as provisional at the bottom
};


export function computeLeaderboard(
    players: Player[],
    games: Game[],
    opts: Options = {
        shrinkageRounds: 12,
        minGamesForNonProvisional: 3,
        minRoundsForNonProvisional: 24,
        includeZeroRoundPlayers: false,
    }
): LeaderboardStat[] {
    const K = opts.shrinkageRounds ?? 12;
    const MIN_GAMES = opts.minGamesForNonProvisional ?? 3;
    const MIN_ROUNDS = opts.minRoundsForNonProvisional ?? 24;
    const INCLUDE_ZERO = opts.includeZeroRoundPlayers ?? false;

    // --- Accumulators ---
    const acc = new Map<string, { total: number; rounds: number; games: number }>();
    for (const p of players) acc.set(p.id, {total: 0, rounds: 0, games: 0});

    const allPerRoundScores: number[] = [];

    // --- Ingest finished games only ---
    for (const g of games) {
        if (!g || g.state === 'Ongoing' || !Array.isArray(g.rounds) || g.rounds.length === 0) continue;

        const pids = g.playerIds ?? [];
        // count game participation once per player
        for (const pid of pids) {
            const e = acc.get(pid);
            if (e) e.games += 1;
        }

        // per-round scores
        for (const r of g.rounds) {
            for (const pid of pids) {
                const e = acc.get(pid);
                if (!e) continue;

                const s = r.scores.find(s => s.playerId === pid)?.score;

                // UNO: winners usually score 0; missing treated as 0 only if the player is in the game
                const score =
                    typeof s === 'number' && Number.isFinite(s) ? s : 0;

                e.total += score;
                e.rounds += 1;
                allPerRoundScores.push(score);
            }
        }
    }

    // If no completed rounds exist, nothing to show
    if (allPerRoundScores.length === 0) return [];

    // --- Global mean (μ) of per-round scores across everyone ---
    const mu =
        allPerRoundScores.reduce((a, b) => a + b, 0) / allPerRoundScores.length;

    // --- Build leaderboard rows ---
    const rows: LeaderboardStat[] = players
        .map(p => {
            const e = acc.get(p.id)!;
            const hasRounds = e.rounds > 0;

            // If zero rounds and we don't include them, we’ll filter later
            const total = e.total;
            const avg = hasRounds ? total / e.rounds : NaN;

            // Empirical-Bayes shrinkage toward μ:
            // This protects against small-sample luck (good or bad).
            const adjAvg = hasRounds
                ? (total + mu * K) / (e.rounds + K)
                : mu; // neutral baseline if you decide to display them

            const provisional = e.games < MIN_GAMES || e.rounds < MIN_ROUNDS;

            return {
                player: p,
                gamesPlayed: e.games,
                roundsPlayed: e.rounds,
                totalScore: total,
                avgPerRound: hasRounds ? avg : 0,
                adjAvgPerRound: adjAvg,
                rating: 1 / Math.max(adjAvg, 1e-9),
                provisional,
            };
        })
        .filter(s => INCLUDE_ZERO || s.roundsPlayed > 0);

    // If everyone has zero totals (weird dataset), bail out
    const allZeroTotals = rows.every(s => s.totalScore === 0);
    if (allZeroTotals) return [];

    // --- Sort: lower adjusted average first ---
    rows.sort((a, b) => {
        if (a.adjAvgPerRound !== b.adjAvgPerRound) {
            return a.adjAvgPerRound - b.adjAvgPerRound; // ASC (lower is better)
        }
        if (a.roundsPlayed !== b.roundsPlayed) return b.roundsPlayed - a.roundsPlayed;
        if (a.gamesPlayed !== b.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
        return a.player.name.localeCompare(b.player.name);
    });

    // Optional: push provisional entries after non-provisionals while keeping internal order
    const nonProv = rows.filter(r => !r.provisional);
    const prov = rows.filter(r => r.provisional);
    return [...nonProv, ...prov];
}