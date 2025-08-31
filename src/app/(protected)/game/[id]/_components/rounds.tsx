"use client";

import React from "react";
import {Game} from "@/models/types";
import {useGameData} from "@/components/providers/game-data-provider";
import {Card} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import PlayerAvatar from "@/components/player-avatar";

const Rounds = ({game}: { game: Game }) => {
    const {players} = useGameData();

    const gamePlayers = game.playerIds
        .map((id) => players.find((p) => p.id === id))
        .filter(Boolean);

    if (!game.rounds || game.rounds.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                No rounds have been played yet.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {game.rounds.map((round, idx) => (
                <Card key={round.id} className="p-4 gap-2">
                    <h3 className="font-semibold">Round {idx + 1}</h3>
                    <Separator/>
                    <div className="space-y-2">
                        {gamePlayers.map((p) => {
                            const score = round.scores.find((s) => s.playerId === p!.id);
                            return (
                                <div
                                    key={p!.id}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <PlayerAvatar player={p!} size={"xs"}/>
                                        <span className="text-sm font-medium">{p!.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold">
                    {score ? score.score : "-"}
                  </span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default Rounds;
