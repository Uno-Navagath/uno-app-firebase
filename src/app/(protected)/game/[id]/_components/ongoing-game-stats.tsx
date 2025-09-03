"use client";

import React, {useMemo} from "react";
import {Game, Player} from "@/models/types";
import {useGameData} from "@/components/providers/game-data-provider";
import {Card} from "@/components/ui/card";
import {Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis,} from "recharts";
import {Separator} from "@radix-ui/react-menu";
import {chartColors} from "@/lib/utils";
import PlayerBreakdown from "@/app/(protected)/game/[id]/_components/player-breakdown";
import PlayerAvatar from "@/components/player-avatar";

type ChartRow = {
    round: string;
    [playerName: string]: string | number;
};

const OngoingGameStats = ({game}: { game: Game }) => {
    const {players} = useGameData();

    // Resolve players in the game
    const gamePlayers: Player[] = useMemo(
        () =>
            game.playerIds
                .map((id) => players.find((p) => p.id === id))
                .filter((p): p is Player => Boolean(p)),
        [game, players]
    );

    // Aggregate scores so far
    const playerTotals: Record<string, number> = {};
    game.rounds.forEach((round) => {
        round.scores.forEach((s) => {
            playerTotals[s.playerId] = (playerTotals[s.playerId] || 0) + s.score;
        });
    });

    // Leaderboard
    const leaderboard = [...gamePlayers]
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

    // Chart data: cumulative score per round
    const chartData: ChartRow[] = useMemo(() => {
        const totals: Record<string, number> = {};
        return game.rounds.map((round, i) => {
            const row: ChartRow = {round: `R${i + 1}`};
            round.scores.forEach((s) => {
                totals[s.playerId] = (totals[s.playerId] || 0) + s.score;
                const player = players.find((p) => p.id === s.playerId);
                if (player) row[player.name] = totals[s.playerId];
            });
            return row;
        });
    }, [game.rounds, players]);

    return (
        <div className="space-y-6">
            {/* Leaderboard */}
            <Card className="p-4 gap-y-2">
                <h2 className="text-lg font-bold">Leading</h2>
                {leaderboard.length ? (
                    <div>
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <PlayerAvatar player={leaderboard[0]} size="xs"/>
                                    <span className="text-sm font-medium">
                                    {leaderboard[0].name}
                                </span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    Score: {leaderboard[0].total} | Avg: {leaderboard[0].avg.toFixed(0)}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">
                        No scores yet. Waiting for the first round.
                    </p>
                )}
            </Card>

            <PlayerBreakdown leaderboard={leaderboard}/>

            {/* Quick Game Info */}
            <Card className="p-4 gap-y-2">
                <h2 className="text-lg font-bold mb-2">Stats</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col bg-secondary py-2 rounded-lg items-center justify-between">
                        <span className="text-muted-foreground">Players</span>
                        <span className="font-medium">{gamePlayers.length}</span>
                    </div>
                    <div className="flex flex-col bg-secondary py-2 rounded-lg items-center justify-between">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-medium">
                            {
                                leaderboard.map((p) => p.total).reduce((a, b) => a + b, 0)
                            }
                        </span>
                    </div>
                    <div className="flex flex-col bg-secondary py-2 rounded-lg items-center justify-between">
                        <span className="text-muted-foreground">Average</span>
                        <span className="font-medium">
                            {
                                (leaderboard.map((p) => p.avg).reduce((a, b) => a + b, 0) /
                                    leaderboard.length).toFixed(0)
                            }
                        </span>
                    </div>
                    <div className="flex flex-col bg-secondary py-2 rounded-lg items-center justify-between">
                        <span className="text-muted-foreground">Rounds</span>
                        <span className="font-medium">
                            {
                                game.rounds.length
                            }
                        </span>
                    </div>
                </div>
            </Card>

            {/* Progression Chart */}
            <Card className="p-4">
                <h2 className="text-lg font-bold mb-2">Score Progression</h2>
                <Separator/>
                {chartData.length ? (
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart
                            data={chartData}
                            margin={{top: 10, right: 10, bottom: 10, left: -26}}
                        >
                            <XAxis
                                dataKey="round"
                                stroke="#e1e1e1"
                                tick={{fill: "#e1e1e1"}} // Tick labels
                            />
                            <YAxis
                                stroke="#e1e1e1"
                                tick={{fill: "#e1e1e1"}}
                            />
                            <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{bottom: 0, left: 0}}/>
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
                ) : (
                    <p className="text-muted-foreground text-sm">
                        No rounds yet — chart will update once the game starts.
                    </p>
                )}
            </Card>
        </div>
    );
};

export default OngoingGameStats;
