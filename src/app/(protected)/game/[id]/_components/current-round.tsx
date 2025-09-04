"use client";

import React, { useRef, useState } from "react";
import { Game, Player, Score } from "@/models/types";
import { useGameData } from "@/components/providers/game-data-provider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PlayerAvatar from "@/components/player-avatar";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/providers/auth-provider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon } from "lucide-react";
import { addRound, removePlayer } from "@/services/game-service";
import ConfirmationDialog from "@/components/confirmation-dialog";

const CurrentRound = ({ game }: { game: Game }) => {
    const { players } = useGameData();
    const { player } = useAuth();

    const [addingScore, setAddingScore] = useState(false);
    const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);

    const isHost = player?.id === game.hostId;

    // Refs for all inputs
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const handleSubmitRound = async () => {
        setAddingScore(true);
        try {
            const playerScores: Score[] = game.playerIds.map((id) => {
                const rawValue = inputRefs.current[id]?.value || "0";
                return { playerId: id, score: Number(rawValue) };
            });

            await addRound(game.id, playerScores);

            // reset input fields
            game.playerIds.forEach((id) => {
                if (inputRefs.current[id]) {
                    inputRefs.current[id]!.value = "";
                }
            });
        } finally {
            setAddingScore(false);
        }
    };

    const gamePlayers = game.playerIds
        .map((id) => players.find((p) => p.id === id))
        .filter(Boolean) as Player[];

    async function handleRemovePlayer() {
        if (playerToRemove) {
            await removePlayer(game.id, playerToRemove.id);
            setPlayerToRemove(null);
        }
    }

    const PlayerScoreCard: React.FC<{ player: Player }> = ({ player }) => (
        <Card className="flex flex-col gap-3 p-3 rounded-lg shadow-sm">
            {/* Player Info Row */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <PlayerAvatar player={player} size="xs" />
                    <span className="font-medium">{player.name}</span>
                </div>

                <div className="flex items-center gap-2">
                    {isHost && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVerticalIcon className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>{player.name}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {game.playerIds.length > 2 ? (
                                    <DropdownMenuItem onClick={() => setPlayerToRemove(player)}>
                                        Remove Player
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem disabled>Cannot remove</DropdownMenuItem>
                                )}
                                <DropdownMenuItem disabled>
                                    Enable Average
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Score Input Row */}
            <div className="flex items-center gap-2">
                <Input
                    ref={(el) => {
                        inputRefs.current[player.id] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    className="text-right"
                />
            </div>
        </Card>
    );

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold">Current Round</h2>

            <div className="space-y-3">
                {gamePlayers.map((p) => (
                    <PlayerScoreCard key={p.id} player={p} />
                ))}
            </div>

            <Button
                disabled={addingScore}
                onClick={handleSubmitRound}
                className="sticky bottom-4 w-full"
            >
                {addingScore ? "Submitting..." : "Submit Round"}
            </Button>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={playerToRemove !== null}
                onOpenChange={(open) => {
                    if (!open) setPlayerToRemove(null);
                }}
                title={`Remove ${playerToRemove?.name}?`}
                description="This action cannot be undone."
                onConfirm={handleRemovePlayer}
            />
        </div>
    );
};

export default CurrentRound;
