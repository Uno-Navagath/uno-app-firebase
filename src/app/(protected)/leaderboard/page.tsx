"use client";

import React, {useMemo, useState} from "react";
import {useGameData} from "@/components/providers/game-data-provider";
import type {Game} from "@/models/types";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {DateRange} from "react-day-picker";
import LeaderboardPlayerCard from "@/app/(protected)/leaderboard/_components/leaderboard-player-card";
import LeaderboardFilters from "@/app/(protected)/leaderboard/_components/leaderboard-filters";
import {computeLeaderboard} from "@/lib/leaderboard-utils";

/* ----------------------- Types ----------------------- */
export type DateFilter = "all" | "today" | "week" | "30days" | "custom";
export type SortKey = "rating" | "games" | "avg" | "total" | "name";

/* ----------------------- Helpers ----------------------- */
const startOfDay = (d: Date) => {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
};

const endOfDay = (d: Date) => {
    const c = new Date(d);
    c.setHours(23, 59, 59, 999);
    return c;
};
type TimestampLike = { toDate: () => Date };

const isTimestampLike = (v: unknown): v is TimestampLike =>
    typeof v === "object" && v !== null && "toDate" in v && typeof (v as TimestampLike).toDate === "function";

const toDate = (v: unknown): Date => {
    if (!v) return new Date(0);
    if (v instanceof Date) return v;
    if (isTimestampLike(v)) return v.toDate();
    return new Date(String(v));
};

/* ----------------------- Date Filter ----------------------- */
const filterGamesByDate = (games: Game[], filter: DateFilter, range?: DateRange) => {
    const now = new Date();
    let from: Date | undefined, to: Date | undefined;

    switch (filter) {
        case "today":
            from = startOfDay(now);
            to = endOfDay(now);
            break;
        case "week":
            from = startOfDay(new Date(now.getTime() - 7 * 864e5));
            to = endOfDay(now);
            break;
        case "30days":
            from = startOfDay(new Date(now.getTime() - 30 * 864e5));
            to = endOfDay(now);
            break;
        case "custom":
            if (range?.from && range?.to) {
                from = startOfDay(range.from);
                to = endOfDay(range.to);
            }
            break;
    }

    return games.filter(g => {
        const date = toDate(g.createdAt);
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
    });
};


/* ----------------------- Main Page ----------------------- */
const LeaderboardPage: React.FC = () => {
    const {players, games} = useGameData();
    const [dateFilter, setDateFilter] = useState<DateFilter>("all");
    const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
    const [sortKey, setSortKey] = useState<SortKey>("rating");

    const filteredGames = useMemo(
        () => filterGamesByDate(games ?? [], dateFilter, customRange),
        [games, dateFilter, customRange]
    );

    const leaderboard = useMemo(
        () => computeLeaderboard(players ?? [], filteredGames),
        [players, filteredGames]
    );

    const sorted = useMemo(() => {
        const copy = [...leaderboard];
        switch (sortKey) {
            case "rating":
                copy.sort((a, b) => a.rating - b.rating);
                break;
            case "games":
                copy.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
                break;
            case "avg":
                copy.sort((a, b) => a.avgScore - b.avgScore);
                break;
            case "total":
                copy.sort((a, b) => a.totalScore - b.totalScore);
                break;
            case "name":
                copy.sort((a, b) => a.player.name.localeCompare(b.player.name));
                break;
        }
        return copy;
    }, [leaderboard, sortKey]);

    return (
        <main className="p-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-4 flex flex-wrap gap-3 items-center justify-between">
                <h1 className="text-xl font-semibold">Leaderboard</h1>
                <Button variant="outline" size="sm" onClick={() => {
                    setDateFilter("all");
                    setCustomRange(undefined);
                    setSortKey("rating");
                }}>Reset Filters</Button>
            </div>

            <LeaderboardFilters
                dateFilter={dateFilter} setDateFilter={setDateFilter}
                customRange={customRange} setCustomRange={setCustomRange}
                sortKey={sortKey} setSortKey={setSortKey}
            />

            <div className="h-4"/>

            <ScrollArea className="h-[70vh]">
                <div className="flex flex-col gap-3">
                    {sorted.length === 0 ? (
                        <Card className="p-4 text-sm text-muted-foreground">No stats available.</Card>
                    ) : (
                        sorted.map((s, idx) => <LeaderboardPlayerCard key={s.player.id} stat={s} rank={idx + 1}/>)
                    )}
                </div>
            </ScrollArea>
        </main>
    );
};

export default LeaderboardPage;
