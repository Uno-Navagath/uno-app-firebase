'use client'
import type {Game, Player} from "@/models/types";
import React, {createContext, useContext, useEffect, useState} from "react";
import {db} from "@/lib/firebase/client";
import {collection, onSnapshot} from "firebase/firestore";
import {useAuth} from "@/components/providers/auth-provider";
import Loading from "@/components/loading";

type GameDataContextType = {
    loading: boolean;
    games: Game[];
    players: Player[];
};

const GameDataContext = createContext<GameDataContextType | undefined>(
    undefined
);

export const GameDataProvider = ({children}: { children: React.ReactNode }) => {
    const {loading: authLoading, player} = useAuth();
    const [games, setGames] = useState<Game[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [gamesLoaded, setGamesLoaded] = useState(false);
    const [playersLoaded, setPlayersLoaded] = useState(false);

    useEffect(() => {
        // Don't subscribe until auth is resolved AND player exists
        if (authLoading || !player) return;

        const unsubGames = onSnapshot(collection(db, "games"), (snapshot) => {
            console.log('Games snapshot:', snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
            setGames(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()} as Game)));
            setGamesLoaded(true);
        });

        const unsubPlayers = onSnapshot(collection(db, "players"), (snapshot) => {
            console.log('Players snapshot:', snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
            setPlayers(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()} as Player)));
            setPlayersLoaded(true);
        });

        return () => {
            unsubGames();
            unsubPlayers();
        };
    }, [authLoading, player]);

    const loading = authLoading || !player || !(gamesLoaded && playersLoaded);

    if (loading) {
        return (
            <Loading/>
        );
    }
    return (
        <GameDataContext.Provider value={{loading, games, players}}>
            {children}
        </GameDataContext.Provider>
    );
};


export const useGameData = () => {
    const context = useContext(GameDataContext);
    if (!context) {
        throw new Error("useGameData must be used within a GameDataProvider");
    }
    return context;
};
