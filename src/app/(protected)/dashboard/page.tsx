'use client'
import React from 'react';
import Header from "@/app/(protected)/dashboard/_components/header";
import TopPlayers from "@/app/(protected)/dashboard/_components/top-players";
import RecentGames from "@/app/(protected)/dashboard/_components/recent-games";
import PlayerStats from "@/app/(protected)/dashboard/_components/player-stats";
import {useGameData} from "@/components/providers/game-data-provider";

function Page() {
    const {loading} = useGameData();
    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <main>
            <Header/>
            <div className="p-4">
                <PlayerStats/>
                <TopPlayers/>
                <RecentGames/>
            </div>
        </main>
    );
}

export default Page;