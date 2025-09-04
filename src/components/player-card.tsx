import React, {useState} from "react";
import {Card} from "@/components/ui/card";
import {ChevronDown, Crown} from "lucide-react";
import PlayerAvatar from "@/components/player-avatar";
import {LeaderboardStat} from "@/lib/leaderboard-utils";

const PlayerCard: React.FC<{ stat: LeaderboardStat; rank: number }> = ({stat, rank}) => {
    const [expanded, setExpanded] = useState(false);
    const avg = stat.avgPerRound.toFixed(1);
    const adjAvg = stat.adjAvgPerRound.toFixed(1);

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
        <Card
            className="p-3 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setExpanded(!expanded)}
        >
            {/* Compact row */}
            <div className="flex items-center justify-between">
                {/* Avatar + Name + Crown */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <PlayerAvatar player={stat.player} size="sm"/>
                        {rank <= 3 && (
                            <Crown
                                className={`absolute -top-3 right-2 w-4 h-4 ${getCrownColor(rank)}`}
                            />
                        )}
                    </div>
                    <div className="flex flex-col">
            <span className="font-semibold leading-tight">
              {stat.player.name}
            </span>
                        <span className="text-xs text-muted-foreground">{stat.gamesPlayed} Games</span>
                    </div>
                </div>

                {/* Total score + toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{adjAvg}</span>
                    <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                            expanded ? "rotate-180" : ""
                        }`}
                    />
                </div>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center border-t pt-3">
                    <div>
                        <div className="text-sm font-medium">{stat.gamesPlayed}</div>
                        <div className="text-xs text-muted-foreground">Total Games</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium">
                            {(stat.totalScore / Math.max(stat.gamesPlayed, 1)).toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg / Game</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium">{stat.roundsPlayed}</div>
                        <div className="text-xs text-muted-foreground">Total Rounds</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium">{stat.avgPerRound.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Avg / Round</div>
                    </div>

                    {/* Total Score spanning 2 columns */}
                    <div className="col-span-2">
                        <div className="text-lg font-bold">{stat.totalScore}</div>
                        <div className="text-xs text-muted-foreground">Total Score</div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default PlayerCard;
