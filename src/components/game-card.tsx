import React from 'react';
import {Game, Player, Round} from "@/models/types";
import {format, formatDistanceToNow} from "date-fns";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {Badge} from "./ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "./ui/avatar";
import {Separator} from "./ui/separator";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "./ui/dialog";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";

const RoundList = ({rounds, players}: { rounds: Round[]; players: Player[] }) => {
    return (
        <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
                {rounds.map((round, idx) => (
                    <div key={round.id} className="p-3 rounded-md border bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Round {idx + 1}</span>
                            <span className="text-xs text-muted-foreground">
                {format(round.createdAt.toDate(), "HH:mm, MMM d")}
              </span>
                        </div>
                        <div className="space-y-1">
                            {round.scores.map((s) => {
                                const player = players.find((p) => p.id === s.playerId);
                                return (
                                    <div key={s.playerId} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={player?.avatar} alt={player?.name}/>
                                                <AvatarFallback>
                                                    {player?.name?.charAt(0).toUpperCase() ?? "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{player?.name ?? "Unknown"}</span>
                                        </div>
                                        <span className="font-medium">{s.score}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
};

const GameCard = (
    {game, players}: { game: Game; players: Player[] }
) => {
    const winner = players.find((p) => p.id === game.winnerId) ?? null;

    const formattedDate = game.createdAt
        ? format(game.createdAt.toDate(), "MMM d, yyyy")
        : "Unknown date";

    const relativeDate =
        game.createdAt &&
        Date.now() - game.createdAt.toDate().getTime() < 7 * 24 * 60 * 60 * 1000
            ? formatDistanceToNow(game.createdAt.toDate(), {addSuffix: true})
            : formattedDate;

    const rounds = game.rounds ?? [];
    const roundsCount = rounds.length;
    const playerCount = players.length;

    // Leader logic (for ongoing)
    let leader: Player | null = null;
    if (roundsCount > 0) {
        const totals = new Map<string, number>();
        rounds.forEach((r) =>
            r.scores.forEach((s) =>
                totals.set(s.playerId, (totals.get(s.playerId) ?? 0) + s.score)
            )
        );
        const sorted = [...totals.entries()].sort((a, b) => a[1] - b[1]);
        leader = players.find((p) => p.id === sorted[0]?.[0]) ?? null;
    }

    return (
        <Card
            key={game.id}
            className="flex-shrink-0 w-full sm:w-[45%] md:w-[30%] lg:w-[22%] bg-card text-card-foreground snap-start transition hover:shadow-lg"
        >
            <Link href={`/game/${game.id}`} className="block">
                <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">#{game.id}</span>

                    </CardTitle>
                </CardHeader>

                <CardContent className="text-sm space-y-3">
                    <div className="flex justify-between items-center">
            <span className="text-muted-foreground">
              {game.state === "Finished" ? "Winner:" : "Leading:"}
            </span>
                        {roundsCount === 0 ? (
                            <span className="italic text-muted-foreground">—</span>
                        ) : game.state === "Finished" && winner ? (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={winner.avatar} alt={winner.name}/>
                                    <AvatarFallback>
                                        {winner.name?.charAt(0).toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{winner.name}</span>
                            </div>
                        ) : leader ? (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={leader.avatar} alt={leader.name}/>
                                    <AvatarFallback>
                                        {leader.name?.charAt(0).toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{leader.name}</span>
                            </div>
                        ) : (
                            <span className="italic text-muted-foreground">—</span>
                        )}
                    </div>

                    <Separator/>

                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Players: {playerCount}</span>
                        <span>Rounds: {roundsCount}</span>
                        <p className="text-xs text-muted-foreground">{relativeDate}</p>
                    </div>
                </CardContent>
            </Link>

            <CardFooter className="flex justify-between">
                <Badge
                    variant={game.state === "Finished" ? "default" : "secondary"}
                    className="text-xs"
                >
                    {game.state}
                </Badge>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            View Rounds
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Rounds</DialogTitle>
                        </DialogHeader>
                        <RoundList rounds={rounds} players={players}/>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    );
};

export default GameCard;