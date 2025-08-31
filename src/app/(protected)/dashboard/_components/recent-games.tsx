"use client";

import React, {useMemo} from "react";
import {useGameData} from "@/components/providers/game-data-provider";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import GameCard from "@/components/game-card";


const RecentGames = () => {
    const {games, players} = useGameData();

    // get latest 5 games by createdAt
    const recentGames = useMemo(() => {
        return [...games]
            .sort(
                (a, b) =>
                    (b.createdAt?.toMillis?.() ?? 0) -
                    (a.createdAt?.toMillis?.() ?? 0)
            )
            .slice(0, 5);
    }, [games]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2 mt-4" >
                <h2 className="text-lg font-bold">Recent Games</h2>
                <Button variant="outline" asChild>
                    <Link href="/games">View All</Link>
                </Button>
            </div>

            {
                recentGames.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent games yet.</p>
                ) : (
                    <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-none">
                        {recentGames.map((game) =>
                            (
                                <GameCard
                                    key={game.id}
                                    game={game}
                                    players={players}
                                />
                            ))}
                    </div>
                )
            }
        </div>
    );
};

export default RecentGames;
