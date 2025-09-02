import React from 'react';
import {Separator} from "@/components/ui/separator";
import {Card} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

const PlayerBreakdown = (
    {leaderboard}: {
        leaderboard: { id: string; name: string; avatar: string; total: number; avg: number; best: number }[]
    }
) => {
    return (
        <Card className="p-4 space-y-3">
            <h2 className="text-lg font-bold">Player Breakdown</h2>
            <Separator/>
            {leaderboard.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={p.avatar} alt={p.name}/>
                            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{p.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
              Total: {p.total} | Avg: {p.avg.toFixed(1)}
            </span>
                </div>
            ))}
        </Card>
    );
};

export default PlayerBreakdown;