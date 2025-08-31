'use client'
import React, {useEffect, useState} from 'react';
import {Game, Player} from "@/models/types";
import {useGameData} from "@/components/providers/game-data-provider";
import CurrentRound from "@/app/(protected)/game/[id]/_components/current-round";
import OngoingGameStats from "@/app/(protected)/game/[id]/_components/ongoing-game-stats";
import Rounds from "@/app/(protected)/game/[id]/_components/rounds";
import AddPlayer from "@/app/(protected)/game/[id]/_components/add-player";
import OngoingGameControls from "@/app/(protected)/game/[id]/_components/ongoing-game-controls";
import {Separator} from "@/components/ui/separator";
import {addPlayer} from "@/services/game-service";
import FinishedGameStats from "@/app/(protected)/game/[id]/_components/finished-game-stats";

export function Page({params}: { params: Promise<{ id: string }> }) {

    const {games} = useGameData();
    const [game, setGame] = useState<Game | undefined>();


    useEffect(() => {
        const fetchId = async () => {
            const data = await params;
            setGame(games.find(value => value.id == data.id))
        };
        fetchId();
    }, [games, params]);

    if (!game) {
        return <div>Loading...</div>;
    }

    const isOngoing = game.state === "Ongoing";

    async function handleAddPlayer(player: Player) {
        await addPlayer(game!.id, player.id)
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <p className="text-xs font-light">#{game.id}</p>
            <Separator/>
            {
                isOngoing ? (
                    <>
                        <CurrentRound game={game}/>
                        <Separator/>
                        <AddPlayer game={game} onAdd={handleAddPlayer}/>
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
                )
            }

        </div>
    );
}

export default Page;