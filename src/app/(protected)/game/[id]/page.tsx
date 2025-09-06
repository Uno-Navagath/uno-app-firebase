'use client';

import React, {use, useEffect, useState} from 'react';
import {Game, Player} from "@/models/types";
import {useGameData} from "@/components/providers/game-data-provider";
import CurrentRound from "@/app/(protected)/game/[id]/_components/current-round";
import OngoingGameStats from "@/app/(protected)/game/[id]/_components/ongoing-game-stats";
import Rounds from "@/app/(protected)/game/[id]/_components/rounds";
import AddPlayer from "@/app/(protected)/game/[id]/_components/add-player";
import OngoingGameControls from "@/app/(protected)/game/[id]/_components/ongoing-game-controls";
import {Separator} from "@/components/ui/separator";
import {addPlayer, deleteGame} from "@/services/game-service";
import FinishedGameStats from "@/app/(protected)/game/[id]/_components/finished-game-stats";
import WheelOfPlayers from "@/components/wheel-of-players";
import {Button} from "@/components/ui/button";
import {Loader, LucideTrash2} from "lucide-react";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {redirect} from "next/navigation";

export default function Page({params}: { params: Promise<{ id: string }> }) {
    // unwrap the promise using React 18’s use()
    const {id} = use(params);

    const {games, players} = useGameData();
    const [game, setGame] = useState<Game | undefined>();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        setGame(games.find(value => value.id === id));
    }, [games, id]);

    if (!game) {
        return <Loader/>;
    }

    const isOngoing = game.state === "Ongoing";

    async function handleAddPlayer(player: Player) {
        await addPlayer(game!.id, player.id);
    }

    function getPlayersInGame() {
        return game!.playerIds.map(pid =>
            players.find(p => p.id === pid)?.name ?? "Unknown"
        );
    }

    async function handleDeleteGame() {
        setDeleteDialogOpen(false);
        await deleteGame(game!.id);
        redirect('/');
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-row items-center justify-between">
                <p className="text-xs font-light">#{game.id}</p>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-red-500 hover:text-red-700"
                >
                    <LucideTrash2/>
                </Button>
            </div>
            <Separator/>
            {isOngoing ? (
                <>
                    <CurrentRound game={game}/>
                    <Separator/>
                    <AddPlayer game={game} onAdd={handleAddPlayer}/>
                    <Separator/>
                    <WheelOfPlayers players={getPlayersInGame()}/>
                    <Separator/>
                    <OngoingGameStats game={game}/>
                    <Separator/>
                    <Rounds game={game}/>
                    <Separator/>
                    <OngoingGameControls game={game}/>
                </>
            ) : (
                <>
                    <FinishedGameStats game={game}/>
                    <Separator/>
                    <Rounds game={game}/>
                </>
            )}

            <ConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Game?"
                description="Are you sure you want to delete the game?"
                onConfirm={handleDeleteGame}
            />
        </div>
    );
}
