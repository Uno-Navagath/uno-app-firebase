"use client";

import React, {useMemo} from "react";
import {Game, Player} from "@/models/types";
import {useGameData} from "@/components/providers/game-data-provider";
import {Card} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis,} from "recharts";
import {chartColors} from "@/lib/utils";
import PlayerBreakdown from "@/app/(protected)/game/[id]/_components/player-breakdown";

type ChartRow = {
    round: string;
    [playerName: string]: string | number;
};

type PlayerStat =
    {
        total: number
        avg: number
        best: number
        id: string
        name: string
        avatar: string
    }

const FinishedGameStats = ({ game }: { game: Game }) => {
    const { players } = useGameData();

    // Players in game
    const gamePlayers: Player[] = useMemo(
        () =>
            game.playerIds
                .map((id) => players.find((p) => p.id === id))
                .filter((p): p is Player => Boolean(p)),
        [game, players]
    );

    if (!game.rounds.length) {
        return (
            <p className="text-muted-foreground text-sm">
                No rounds played in this game.
            </p>
        );
    }

    // Totals
    const playerTotals: Record<string, number> = {};
    game.rounds.forEach((round) => {
        round.scores.forEach((s) => {
            playerTotals[s.playerId] = (playerTotals[s.playerId] || 0) + s.score;
        });
    });

    // Leaderboard
    const leaderboard: PlayerStat[] = [...gamePlayers]
        .map((p) => ({
            ...p,
            total: playerTotals[p.id] || 0,
            avg: game.rounds.length
                ? (playerTotals[p.id] || 0) / game.rounds.length
                : 0,
            best: Math.min(
                ...game.rounds.map(
                    (r) => r.scores.find((s) => s.playerId === p.id)?.score ?? Infinity
                )
            ),
        }))
        // sort ascending because least total is better
        .sort((a, b) => a.total - b.total);

    // Winner (explicit or top scorer)
    const winner =
        (game.winnerId && players.find((p) => p.id === game.winnerId)) ||
        leaderboard[0];

    // Chart data → cumulative progression
    const chartData: ChartRow[] = (() => {
        const totals: Record<string, number> = {};
        return game.rounds.map((round, i) => {
            const row: ChartRow = { round: `R${i + 1}` };
            round.scores.forEach((s) => {
                totals[s.playerId] = (totals[s.playerId] || 0) + s.score;
                const player = players.find((p) => p.id === s.playerId);
                if (player) row[player.name] = totals[s.playerId];
            });
            return row;
        });
    })();

    return (
        <div className="space-y-6">
            {/* Winner */}
            <Card className="p-4">
                <h2 className="text-lg font-bold mb-2">Winner</h2>
                {winner ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={winner.avatar} alt={winner.name} />
                                <AvatarFallback>{winner.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold">{winner.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
              Total: {playerTotals[winner.id] || 0}
            </span>
                    </div>
                ) : (
                    <p className="text-muted-foreground">No winner recorded</p>
                )}
            </Card>

            {/* Game Stats Summary */}
            <Card className="p-4 gap-y-2">
                <h2 className="text-lg font-bold mb-2">Stats</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col bg-secondary py-2 rounded-lg items-center">
                        <span className="text-muted-foreground">Players</span>
                        <span className="font-medium">{gamePlayers.length}</span>
                    </div>
                    <div className="flex flex-col bg-secondary py-2 rounded-lg items-center">
                        <span className="text-muted-foreground">Rounds</span>
                        <span className="font-medium">{game.rounds.length}</span>
                    </div>
                    <div className="flex flex-col bg-secondary py-2 rounded-lg items-center">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-medium">
              {leaderboard.map((p) => p.total).reduce((a, b) => a + b, 0)}
            </span>
                    </div>
                    <div className="flex flex-col bg-secondary py-2 rounded-lg items-center">
                        <span className="text-muted-foreground">Avg/Player</span>
                        <span className="font-medium">
              {(
                  leaderboard.map((p) => p.avg).reduce((a, b) => a + b, 0) /
                  leaderboard.length
              ).toFixed(0)}
            </span>
                    </div>
                </div>
            </Card>

            {/* Player Breakdown */}
            <PlayerBreakdown leaderboard={leaderboard}/>

            {/* Progression Chart */}
            <Card className="p-4">
                <h2 className="text-lg font-bold mb-2">Score Progression</h2>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData}>
                        <XAxis dataKey="round" />
                        <YAxis />
                        <Legend />
                        {gamePlayers.map((p, idx) => (
                            <Line
                                key={p.id}
                                type="monotone"
                                dataKey={p.name}
                                strokeWidth={2}
                                stroke={chartColors[idx % chartColors.length]}
                                dot
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default FinishedGameStats;
