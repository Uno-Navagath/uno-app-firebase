"use client";
import React, {useMemo} from "react";
import {useGameData} from "@/components/providers/game-data-provider";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {computeLeaderboard} from "@/lib/leaderboard-utils";
import PlayerCard from "@/components/player-card";

type Player = {
    id: string;
    name: string;
    avatar: string;
    totalScore: number;
    games: number;
}

const TopPlayers = () => {
    const {games, players, loading} = useGameData();


    const leaderboard = useMemo(
        () => computeLeaderboard(players ?? [], games),
        [players, games]
    );

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
                !leaderboard.length ? <p className="text-sm text-muted-foreground">No players have scored yet.</p> : (


                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {leaderboard.map((p, index) => (
                            <PlayerCard
                                key={p.player.id}
                                stat={p}
                                rank={index + 1}
                            />
                        ))}
                    </div>)
            }
        </div>
    );
};

export default TopPlayers;
