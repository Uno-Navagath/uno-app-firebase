"use client";

import React, { useState } from "react";
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

    // Store scores as strings → avoids forced "0" & keyboard closing issues
    const [scores, setScores] = useState<Record<string, string>>(
        Object.fromEntries(game.playerIds.map((id) => [id, ""]))
    );

    const handleScoreChange = (id: string, value: string) => {
        // allow empty string for clearing, otherwise store raw string
        if (/^\d*$/.test(value)) {
            setScores((prev) => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmitRound = async () => {
        setAddingScore(true);

        const playerScores: Score[] = game.playerIds.map((id) => ({
            playerId: id,
            score: Number(scores[id] || 0),
        }));

        try {
            await addRound(game.id, playerScores);
            // reset input for next round
            setScores(Object.fromEntries(game.playerIds.map((id) => [id, ""])));
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
                    {/* optional average toggle */}
                    <Switch title="Average" disabled />
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
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Score Input Row */}
            <div className="flex items-center gap-2">
                <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    className="text-right"
                    value={scores[player.id] ?? ""}
                    onChange={(e) => handleScoreChange(player.id, e.target.value)}
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
                className="w-full"
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
