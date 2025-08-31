"use client";

import React, {useState} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import DiceLoading from "@/components/dice-loading";

type WheelOfPlayersProps = {
    players: string[];
};

const WheelOfPlayers = ({players}: WheelOfPlayersProps) => {
    const [phase, setPhase] = useState<"idle" | "animating" | "result">("idle");
    const [seats, setSeats] = useState<{ player: string; seat: number }[]>([]);

    const startAssignment = () => {
        setPhase("animating");

        // Simulate shuffle + seat assignment after animation
        setTimeout(() => {
            const shuffled = [...players].sort(() => Math.random() - 0.5);
            const result = shuffled.map((p, i) => ({player: p, seat: i + 1}));
            setSeats(result);
            setPhase("result");
        }, 2500); // 2.5 sec animation
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default">Assign Seats 🎲</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <DialogTitle>UNO Seat Assignment</DialogTitle>
                </DialogHeader>

                {phase === "idle" && (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-muted-foreground">Click start to shuffle players into random seats!</p>
                        <Button onClick={startAssignment}>Start 🎉</Button>
                    </div>
                )}

                {phase === "animating" && (
                    <div className="flex justify-center items-center h-40">
                        <DiceLoading/>
                    </div>
                )}

                {phase === "result" && (
                    <div className="space-y-3">
                        <h3 className="font-semibold">Results</h3>
                        <ul className="space-y-1">
                            {seats.map((s) => (
                                <li key={s.player} className="flex justify-between">
                                    <span>{s.player}</span>
                                    <span className="font-bold">Seat {s.seat}</span>
                                </li>
                            ))}
                        </ul>
                        <Button variant="secondary" onClick={() => setPhase("idle")}>
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default WheelOfPlayers;
