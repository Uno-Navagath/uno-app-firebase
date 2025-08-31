"use client";

import React, {useMemo} from "react";
import {useAuth} from "@/components/providers/auth-provider";
import {useGameData} from "@/components/providers/game-data-provider";
import {Line} from "react-chartjs-2";
import {CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip} from "chart.js";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {BoltIcon, ChartBarIcon, TrophyIcon} from "@heroicons/react/24/solid";
import {GamepadIcon, RepeatIcon} from "lucide-react";
import PlayerAvatar from "@/components/player-avatar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {signOut} from "@firebase/auth";
import {auth} from "@/lib/firebase/client";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

/* ------------------- Types ------------------- */
interface Player {
    id: string;
    name: string;
    avatar: string;
}

interface Score {
    playerId: string;
    score: number;
}

interface Round {
    scores: Score[];
}

interface Game {
    playerIds: string[];
    winnerId?: string;
    rounds: Round[];
}

interface Stats {
    totalScore: number;
    gamesPlayed: number;
    wins: number;
    roundsWithPlayer: number;
    avgScorePerGame: number;
    avgScorePerRound: number;
    rank: number;
    weeklyScores: number[];
}

/* ------------------- Helpers ------------------- */
const formatDecimal = (v: number) => (Math.round(v * 10) / 10).toFixed(1);

/* ------------------- Hooks ------------------- */
function usePlayerStats(player: Player, games: Game[]): Stats {
    return useMemo(() => {
        let totalScore = 0, gamesPlayed = 0, wins = 0, roundsWithPlayer = 0;
        const weeklyScores = Array(7).fill(0);

        for (const game of games) {
            if (game.playerIds.includes(player.id)) gamesPlayed++;
            if (game.winnerId === player.id) wins++;
            for (const round of game.rounds) {
                const found = round.scores.find(s => s.playerId === player.id);
                if (found) {
                    totalScore += found.score;
                    roundsWithPlayer++;
                    // simple weekly mock: add score to day index
                    const dayIndex = new Date().getDay();
                    weeklyScores[dayIndex] += found.score;
                }
            }
        }

        return {
            totalScore,
            gamesPlayed,
            wins,
            roundsWithPlayer,
            avgScorePerGame: gamesPlayed ? totalScore / gamesPlayed : 0,
            avgScorePerRound: roundsWithPlayer ? totalScore / roundsWithPlayer : 0,
            rank: 1,
            weeklyScores
        };
    }, [player, games]);
}

/* ------------------- Components ------------------- */
const StatTile: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({
                                                                                                                 label,
                                                                                                                 value,
                                                                                                                 icon,
                                                                                                                 color
                                                                                                             }) => (
    <div
        className={`flex-1 flex flex-col items-center justify-center p-2 bg-card text-card-foreground rounded-lg shadow-sm gap-2 ${color}`}>
        <div className={`h-5 w-5 ${color}`}>{icon}</div>
        <div className="mt-1 text-sm font-semibold">{value}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
);
const PlayerMenu: React.FC<{ player: Player }> = ({player}) => {


    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="cursor-pointer">
                    <PlayerAvatar player={player}/>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div>
                            <p className="text-sm font-medium">{player.name}</p>
                        </div>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => signOut(auth)}
                    >
                        Sign Out
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

/* ------------------- Main Component ------------------- */
const PlayerStats: React.FC = () => {
    const {player} = useAuth();
    const {games} = useGameData();

    const stats = usePlayerStats(player!, games);
    if (!player) {
        return <p>Loading player stats...</p>;
    }

    return (
        <div className="flex flex-col gap-2">
            {/* Hero Section */}
            <Card className="flex flex-row items-center p-3 bg-card rounded-2xl shadow-md">
                <PlayerMenu player={player}/>
                <div className="flex-1">
                    <h2 className="text-base font-bold">{player.name}</h2>
                    <div className="mt-1 text-xs text-primary/30 font-semibold">#{player.id}</div>
                </div>
            </Card>

            {/* Stat Tiles */}
            <div className="flex gap-2 max-w-full">
                <StatTile label="Wins" value={stats.wins} icon={<TrophyIcon/>} color="text-green-400"/>
                <StatTile label="Avg/Game" value={formatDecimal(stats.avgScorePerGame)} icon={<ChartBarIcon/>}
                          color="text-yellow-400"/>
                <StatTile label="Games" value={stats.gamesPlayed} icon={<GamepadIcon/>} color="text-blue-400"/>
                <StatTile label="Rounds" value={stats.roundsWithPlayer} icon={<RepeatIcon/>} color="text-purple-400"/>
                <StatTile label="Total" value={stats.totalScore} icon={<BoltIcon/>} color="text-pink-400"/>
            </div>

            {/* Weekly Sparkline */}
            <Card className="bg-card rounded-2xl shadow-md gap-2">
                <CardHeader className="pb-1">
                    <CardTitle className="text-sm font-semibold">Weekly Performance</CardTitle>
                </CardHeader>
                <CardContent className="h-20 w-full">
                    {
                        stats.weeklyScores.every(score => score === 0) ? (
                            <p className="text-sm text-muted-foreground text-center w-full h-full">No data available for
                                this week.</p>
                        ) : (

                            <Line
                                data={{
                                    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                                    datasets: [{
                                        label: "Score",
                                        data: stats.weeklyScores,
                                        borderColor: "#8b5cf6",
                                        tension: 0.4,
                                        fill: true,
                                        pointRadius: 2
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {legend: {display: false}},
                                    scales: {x: {display: false}, y: {display: false}}
                                }}
                            />
                        )
                    }
                </CardContent>
            </Card>
        </div>
    );
};

export default PlayerStats;
