import React from "react";
import {Card} from "@/components/ui/card";
import {Crown} from "lucide-react";
import PlayerAvatar from "@/components/player-avatar";
import {LeaderboardStat} from "@/app/(protected)/leaderboard/page";

const LeaderboardPlayerCard: React.FC<{ stat: LeaderboardStat; rank: number }> = ({stat, rank}) => {
    const avg = stat.avgScore.toFixed(0);
    const getCrownColor = (rank: number) => {
        switch (rank) {
            case 1:
                return "text-yellow-400";
            case 2:
                return "text-gray-400";
            case 3:
                return "text-amber-600";
            default:
                return "";
        }
    };

    return (
        <Card className="flex flex-row items-center justify-between p-3 hover:shadow-lg transition-shadow">
            {/* Rank + Crown */}
            <div className="relative flex flex-col items-center w-10">
                {rank <= 3 && <Crown className={`absolute -top-4 w-5 h-5 z-15 ${getCrownColor(rank)}`}/>}
                <PlayerAvatar player={stat.player} size="sm"/>
            </div>

            {/* Player Info */}
            <div className="flex items-center gap-3 flex-1">

                <div className="flex flex-col">
                    <div className="font-semibold">{stat.player.name}</div>
                    <div className="text-xs text-muted-foreground">Games: {stat.gamesPlayed} · Avg: {avg}</div>
                </div>
            </div>

            {/* Total Score */}
            <div className="text-lg font-semibold text-right">{stat.totalScore}</div>
        </Card>
    );
};

export default LeaderboardPlayerCard;