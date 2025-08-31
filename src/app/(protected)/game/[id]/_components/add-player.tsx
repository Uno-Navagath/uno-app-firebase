"use client";

import * as React from "react";
import {Button} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {useGameData} from "@/components/providers/game-data-provider";
import {Game, Player} from "@/models/types";
import {PlusIcon} from "lucide-react";

const AddPlayer = ({
                       game,
                       onAdd,
                   }: {
    game: Game;
    onAdd: (player: Player) => void;
}) => {
    const {players} = useGameData();
    const [open, setOpen] = React.useState(false);

    // players not already in the game
    const availablePlayers = players.filter(
        (p) => !game.playerIds.includes(p.id)
    );

    const handleSelect = (player: Player) => {
        onAdd(player);
        setOpen(false);
    };

    return (
        <div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    {
                        availablePlayers.length === 0 ?
                            <p className="text-sm text-muted-foreground">No players available</p> :
                            <div className="flex items-center gap-2 w-full justify-between">
                                <p className="text-sm text-muted-foreground">Add Player</p>
                                <Button variant="outline" size="sm">
                                    <PlusIcon className="w-4 h-4"/>
                                </Button>
                            </div>
                    }
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0">
                    <Command>
                        <CommandInput placeholder="Search players..."/>
                        <CommandList>
                            <CommandEmpty>No players found.</CommandEmpty>
                            <CommandGroup>
                                {availablePlayers.map((player) => (
                                    <CommandItem
                                        key={player.id}
                                        value={player.name}
                                        onSelect={() => handleSelect(player)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={player.avatar}
                                                alt={player.name}
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <span>{player.name}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default AddPlayer;
