'use client'

import {useAuth} from "@/components/providers/auth-provider";
import {redirect} from "next/navigation";

export default function Home() {
    const {player, loading} = useAuth();

    console.log(player);
    if (loading) {
        return <div>Loading...</div>;
    }
    if (!player) {
        redirect('/login');
    } else {
        redirect('/dashboard');
    }

}
