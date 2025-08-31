import React from "react";
import {GameDataProvider} from "@/components/providers/game-data-provider";

export default function ProtectedLayout({
                                            children,
                                        }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <GameDataProvider>
            {children}
        </GameDataProvider>
    );
}
