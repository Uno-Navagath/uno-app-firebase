'use client'

import React from 'react';
import Logo from "@/components/logo";
import {useAuth} from "@/components/providers/auth-provider";
import {Button} from "@/components/ui/button";
import Link from "next/link";

const Header = () => {
    const {player} = useAuth();
    if (!player) {
        return null;
    }
    return (
        <div className="flex sticky top-0 z-20 bg-background items-center justify-between p-4">
            <Logo size="sm"/>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/game/new">Create Game</Link>
                </Button>
            </div>
        </div>
    );
};

export default Header;