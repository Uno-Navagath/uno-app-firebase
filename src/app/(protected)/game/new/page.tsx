"use client";

import React, {useMemo, useState} from "react";
import {useAuth} from "@/components/providers/auth-provider";
import {useGameData} from "@/components/providers/game-data-provider";
import {Card} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {createGame} from "@/services/game-service";
import {redirect} from "next/navigation";
import {Player} from "@/models/types";
import {Badge} from "@/components/ui/badge";

const PlayerCard = (
    {player, isHost, selected, onSelect}: {
        player: Player;
        isHost: boolean;
        selected: boolean;
        onSelect: (id: string) => void;
    }
) => {

    return (
        <Card
            className={cn(
                "flex flex-row items-center gap-3 p-3 border cursor-pointer transition h-fit",
                selected
                    ? "border-primary bg-primary/10"
                    : "hover:bg-muted/50"
            )}
            onClick={() => onSelect(player.id)}
        >
            <Avatar>
                <AvatarImage src={player.avatar} alt={player.name}/>
                <AvatarFallback>
                    {player.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1">
                <span className="font-medium">{player.name}</span>
                {isHost && (
                    <Badge className="text-xs font-semibold">Host</Badge>
                )}
            </div>
            {selected && (
                <span className="text-xs font-semibold text-primary">✓</span>
            )}
        </Card>
    );
}

function GameCreationPage() {
    const {player: currentPlayer} = useAuth();
    const {players} = useGameData();

    const [createGameLoading, setCreateGameLoading] = useState(false);

    const [selected, setSelected] = useState<string[]>(
        currentPlayer ? [currentPlayer.id] : []
    );
    const [search, setSearch] = useState("");

    const filteredPlayers = useMemo(() => {
        return players.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [players, search]);

    const toggleSelect = (id: string) => {
        if (id === currentPlayer?.id) return; // host can't be unselected
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const canCreate = selected.length >= 2;

    const handleCreateGame = async () => {
        console.log("Creating game with players:", selected);
        setCreateGameLoading(true);
        const game = await createGame(
            currentPlayer!.id,
            selected,
        );
        redirect(`/game/${game.id}`);
    };

    if (!currentPlayer) {
        return <p className="text-muted-foreground">You must be logged in to create a game.</p>;
    }

    return (
        <div className="flex flex-col h-screen p-4 gap-4">
            {/* Header */}
            <h1 className="text-xl font-bold">Create Game</h1>

            {/* Search bar */}
            <Input
                placeholder="Search players..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
            />

            {/* Scrollable players list */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                {filteredPlayers.find((p) => p.id === currentPlayer.id) && (
                    <PlayerCard
                        key={currentPlayer.id}
                        player={currentPlayer}
                        isHost={true}
                        selected={selected.includes(currentPlayer.id)}
                        onSelect={(id) => toggleSelect(id)}
                    />
                )}

                {filteredPlayers.map((p) => {
                    const isSelected = selected.includes(p.id);
                    const isHost = p.id === currentPlayer.id;
                    if (isHost) return null;

                    return (
                        <PlayerCard
                            key={p.id}
                            player={p}
                            isHost={isHost}
                            selected={isSelected}
                            onSelect={(id) => toggleSelect(id)}
                        />
                    );
                })}
            </div>

            {/* Sticky create button */}
            <Button
                onClick={handleCreateGame}
                disabled={!canCreate || createGameLoading}
                className="w-full"
            >
                {createGameLoading ? "Creating..." : "Create Game" + (canCreate ? ` (${selected.length})` : " (minimum 2 players)")}
            </Button>
        </div>
    );

}

export default GameCreationPage;
