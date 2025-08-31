"use client";

import {onAuthStateChanged} from "firebase/auth";
import React, {createContext, useContext, useEffect, useState} from "react";
import {auth} from "@/lib/firebase/client";
import {createOrUpdatePlayer} from "@/services/player-service";
import type {Player} from "@/models/types";
import {redirect, usePathname} from "next/navigation";


type AuthContextType = {
    player: Player | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    player: null,
    loading: true,
});

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('User state changed:', user);
            if (user) {
                const playerProfile = await createOrUpdatePlayer(user);
                setPlayer(playerProfile);
            } else {
                setPlayer(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (loading) return;
        console.log('Pathname:', pathname);
        console.log('Player:', player);
        if (player === null && pathname !== '/login') {
            console.log('Redirecting to login');
            redirect('/login');
        }
        if (player !== null && pathname === '/login') {
            console.log('Redirecting to dashboard');
            redirect('/dashboard');
        }
    }, [pathname, player, loading]);

    return (
        <AuthContext.Provider value={{player, loading}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
