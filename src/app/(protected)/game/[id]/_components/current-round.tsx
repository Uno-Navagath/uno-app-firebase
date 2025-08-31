"use client";

import React, {useState} from "react";
import {Game, Player, Score} from "@/models/types";
import {useGameData} from "@/components/providers/game-data-provider";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import PlayerAvatar from "@/components/player-avatar";
import {Switch} from "@/components/ui/switch";
import {useAuth} from "@/components/providers/auth-provider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {MoreVerticalIcon} from "lucide-react";
import {addRound, removePlayer} from "@/services/game-service";
import ConfirmationDialog from "@/components/confirmation-dialog";

const CurrentRound = ({game}: { game: Game }) => {
    const {players} = useGameData();
    const {player} = useAuth();

    const [addingScore, setAddingScore] = useState(false);
    const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);

    const isHost = player?.id == game.hostId;

    // Initialize scores for all players in the game
    const [scores, setScores] = useState<Record<string, number>>(
        Object.fromEntries(game.playerIds.map((id) => [id, 0]))
    );

    const handleScoreChange = (id: string, value: string) => {
        setScores((prev) => ({
            ...prev,
            [id]: Number(value) || 0,
        }));
    };

    const handleSubmitRound = async () => {
        setAddingScore(true);

        const playerScores: Score[] = game.playerIds.map((id) => ({
            playerId: id,
            score: scores[id] || 0,
        }));
        await addRound(game.id, playerScores);
        setAddingScore(false);
    };

    const gamePlayers = game.playerIds
        .map((id) => players.find((p) => p.id === id))
        .filter(Boolean);

    async function handleRemovePlayer() {
        await removePlayer(game.id, playerToRemove!.id);
    }

    const PlayerScoreCard: React.FC<{ player: Player }> = ({player}) => (
        <Card className="flex justify-between p-2 rounded-lg shadow-sm">
            <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-2">
                    <PlayerAvatar player={player!} size="xs"/>
                    <span className="font-medium">{player!.name}</span>
                </div>

                <Switch
                    title="Average"
                />
            </div>

            <div className="flex items-center justify-between gap-3 w-full">
                <Input
                    type="number"
                    className="text-right w-full"
                    value={scores[player!.id]}
                    onChange={(e) => handleScoreChange(player!.id, e.target.value)}
                />
                {isHost && (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVerticalIcon className="w-5 h-5"/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>{player!.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            {
                                game.playerIds.length > 2 ? (
                                    <DropdownMenuItem onClick={event => {
                                        setPlayerToRemove(player);
                                    }}>Remove Player</DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem disabled={true}>Cannot remove</DropdownMenuItem>
                                )
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </Card>
    );

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold">Current Round</h2>

            <div className="space-y-3">
                {gamePlayers.map((p) => (
                    <PlayerScoreCard key={p!.id} player={p!}/>
                ))}
            </div>

            <Button disabled={addingScore} onClick={handleSubmitRound} className="w-full">
                {addingScore ? "Submitting..." : "Submit Round"}
            </Button>
            <ConfirmationDialog open={playerToRemove !== null} onOpenChange={open => {
                if (!open)
                    setPlayerToRemove(null);
            }}
                                title={`Remove ${playerToRemove?.name}?`} onConfirm={handleRemovePlayer}
                                description={"This action cannot be undone."}/>

        </div>
    );
};

export default CurrentRound;
