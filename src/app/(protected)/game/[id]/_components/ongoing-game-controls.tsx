'use client'
import React, {useState} from 'react';
import {Button} from "@/components/ui/button";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {deleteGame, updateGame} from "@/services/game-service";
import {Game} from "@/models/types";
import {redirect, useRouter} from "next/navigation";

const OngoingGameControls = ({
                                 game,
                             }: {
    game: Game;
}) => {
    const router = useRouter();
    const [openFinishDialog, setOpenFinishDialog] = useState(false);
    const [openDiscardDialog, setOpenDiscardDialog] = useState(false);

    async function handleDiscardGame() {
        await deleteGame(game.id);
        redirect('/');
    }

    async function handleFinishGame() {
        await updateGame(game.id, {state: "Finished"});
        router.refresh();
    }

    return (
        <div className="sticky bottom-2 flex items-center justify-between gap-2">
            <Button variant="destructive"
                    onClick={event => {
                        event.preventDefault();
                        setOpenDiscardDialog(true);
                    }}
            >Discard Game</Button>
            <Button variant="default" className="flex-1" onClick={event => {
                event.preventDefault();
                setOpenFinishDialog(true);
            }}>Finish Game</Button>

            <ConfirmationDialog open={openFinishDialog} onOpenChange={setOpenFinishDialog} title={"Finish Game?"}
                                onConfirm={handleFinishGame} description={"Are you sure you want to finish the game?"}/>
            <ConfirmationDialog open={openDiscardDialog} onOpenChange={setOpenDiscardDialog} title={"Discard Game?"}
                                onConfirm={handleDiscardGame}
                                description={"Are you sure you want to discard the game?"}/>
        </div>
    );
};

export default OngoingGameControls;