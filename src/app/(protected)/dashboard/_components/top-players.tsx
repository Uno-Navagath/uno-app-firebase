"use client";
import React, {useMemo} from "react";
import {useGameData} from "@/components/providers/game-data-provider";
import PlayerAvatar from "@/components/player-avatar";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Crown} from "lucide-react";

type Player = {
    id: string;
    name: string;
    avatar: string;
    totalScore: number;
    games: number;
}

const PlayerCard = ({player, rank}: { player: Player; rank?: number }) => {
    const getCrownColor = (rank?: number) => {
        if (!rank) return "transparent";
        switch (rank) {
            case 1:
                return "text-yellow-400"; // Gold
            case 2:
                return "text-gray-400";   // Silver
            case 3:
                return "text-amber-700";  // Bronze
            default:
                return "transparent";
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 border rounded-lg shadow-lg bg-card hover:shadow-xl transition">
            <div className="flex-1 flex items-center">
                <div className="relative flex flex-col items-center mr-4 text-center w-10">
                    {/* Crown positioned above the circle */}
                    {rank && rank <= 3 && (
                        <Crown className={`absolute -top-4 w-5 h-5 z-11 ${getCrownColor(rank)}`}/>
                    )}

                    <PlayerAvatar player={player} size="xs"/>
                </div>

                {/* Player info */}
                <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">{player.name}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Avg: {(player.totalScore / player.games).toFixed(0)}
                    </p>
                </div>

                {/* Total score */}
                <p className="text-xl font-bold">{player.totalScore}</p>
            </div>
        </div>
    );
};


const TopPlayers = () => {
    const {games, players, loading} = useGameData();

    const topPlayers: Player[] = useMemo(() => {
        if (!games.length) return [];

        const scoreMap: Record<string, number> = {};

        games.forEach((game) => {
            game.rounds.forEach((round) => {
                round.scores.forEach((score) => {
                    scoreMap[score.playerId] =
                        (scoreMap[score.playerId] || 0) + score.score;
                });
            });
        });

        return Object.entries(scoreMap)
            .map(([playerId, totalScore]) => {
                const player = players.find((p) => p.id === playerId);
                return {
                    id: playerId,
                    name: player?.name ?? "Unknown Player",
                    avatar: player?.avatar ?? "/default-avatar.png", // fallback avatar
                    totalScore,
                    games: games.filter((g) => g.playerIds.includes(playerId)).length,
                };
            })
            .sort((a, b) => a.totalScore - b.totalScore)
            .slice(0, 5);
    }, [games, players]);

    if (loading) {
        return <p>Loading top players...</p>;
    }


    return (
        <div>
            <div className="flex items-center justify-between mb-2 mt-4">
                <h2 className="text-lg font-bold mb-4">Top Players</h2>
                <Button variant="outline" asChild>
                    <Link href="/leaderboard">
                        Leaderboard
                    </Link>
                </Button>
            </div>
            {
                !topPlayers.length ? <p className="text-sm text-muted-foreground">No players have scored yet.</p> : (


                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {topPlayers.map((p, index) => (
                            <PlayerCard
                                key={p.id}
                                player={p}
                                rank={index + 1}
                            />
                        ))}
                    </div>)
            }
        </div>
    );
};

export default TopPlayers;
