import React from "react";
import {DateRange} from "react-day-picker";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar";
import {DateFilter, SortKey} from "@/app/(protected)/leaderboard/page";

const LeaderboardFilters: React.FC<{
    dateFilter: DateFilter;
    setDateFilter: (v: DateFilter) => void;
    customRange: DateRange | undefined;
    setCustomRange: (v: DateRange | undefined) => void;
    sortKey: SortKey;
    setSortKey: (v: SortKey) => void;
}> = ({dateFilter, setDateFilter, customRange, setCustomRange, sortKey, setSortKey}) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full flex-wrap">
                <Select value={dateFilter} onValueChange={v => setDateFilter(v as DateFilter)}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Date filter"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortKey} onValueChange={v => setSortKey(v as SortKey)}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Sort by"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="rating">Rating</SelectItem>
                        {/*<SelectItem value="games">Games</SelectItem>*/}
                        {/*<SelectItem value="avg">Average</SelectItem>*/}
                        <SelectItem value="total">Total</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                </Select>

                {dateFilter === "custom" && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                className="w-36">{customRange?.from && customRange?.to ? `${format(customRange.from, 'MM/dd')} - ${format(customRange.to, 'MM/dd')}` : 'Select Range'}</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                            <Calendar
                                mode="range"
                                selected={customRange}
                                onSelect={setCustomRange}
                                className="rounded-md border"
                            />
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </div>
    );
};

export default LeaderboardFilters;