"use client";

import React, {useMemo, useState} from "react";
import {useGameData} from "@/components/providers/game-data-provider";
import {GameState} from "@/models/types";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ScrollArea} from "@/components/ui/scroll-area";
import ClearGamesDialog from "@/app/(protected)/games/_components/clear-games";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {MoreVerticalIcon} from "lucide-react";
import GameCard from "@/components/game-card";

const GameListPage: React.FC = () => {
    const {games, players} = useGameData();
    const [stateFilter, setStateFilter] = useState<GameState | "All">("All");
    const [sortBy, setSortBy] = useState<"Latest" | "Oldest">("Latest");
    const [showClearDialog, setShowClearDialog] = useState(false);

    const filteredGames = useMemo(() => {
        if (!games?.length) return [];

        // Remove any undefined/null games
        let list = games.filter(Boolean);

        // Filter by state
        if (stateFilter !== "All") {
            list = list.filter(g => g?.state === stateFilter);
        }

        // Sort safely
        list.sort((a, b) => {
            const aTime = a?.createdAt?.toMillis?.() ?? 0;
            const bTime = b?.createdAt?.toMillis?.() ?? 0;
            return sortBy === "Latest" ? bTime - aTime : aTime - bTime;
        });

        return list;
    }, [games, stateFilter, sortBy]);

    return (
        <div className="flex flex-col gap-4 p-3">
            {/* Top bar: filters + menu */}
            <h2 className="text-lg font-bold">Games</h2>
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                    <Select onValueChange={(v) => setStateFilter(v as GameState | "All")} defaultValue="All">
                        <SelectTrigger className="w-32"><SelectValue placeholder="Filter by State"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Finished">Finished</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select onValueChange={(v) => setSortBy(v as "Latest" | "Oldest")} defaultValue="Latest">
                        <SelectTrigger className="w-32"><SelectValue placeholder="Sort by"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Latest">Latest</SelectItem>
                            <SelectItem value="Oldest">Oldest</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Kebab menu for actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 rounded-full hover:bg-muted transition">
                        <MoreVerticalIcon className="w-5 h-5"/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setShowClearDialog(true)}>
                            Clear Games
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("Other action")}>
                            Another Action
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Clear Games Dialog */}
            {showClearDialog && (
                <ClearGamesDialog
                    onClear={(options) => {
                        console.log("Clearing games with options", options);
                        setShowClearDialog(false);
                    }}
                    onClose={() => setShowClearDialog(false)}
                />
            )}

            {/* Game list */}
            <ScrollArea className="h-[70vh]">
                <div className="flex flex-col gap-2">
                    {filteredGames.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No games found.</p>
                    ) : (
                        filteredGames.map(game =>
                            game ? <GameCard key={game.id} game={game} players={players}/> : null
                        )
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default GameListPage;
