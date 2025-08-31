import React from "react";
import {Player} from "@/models/types";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import clsx from "clsx";

type AvatarSize = "xs" | "sm" | "md" | "lg";

interface UserAvatarProps {
    player: Player;
    size?: AvatarSize;
}

const sizeMap = {
    xs: "h-6 w-6 text-xs",   // 32px
    sm: "h-8 w-8 text-sm",   // 32px
    md: "h-12 w-12 text-base", // 48px
    lg: "h-16 w-16 text-lg",   // 64px
};

const PlayerAvatar: React.FC<UserAvatarProps> = ({player, size = "md"}) => {
    return (
        <Avatar className={clsx(sizeMap[size])}>
            <AvatarImage src={player.avatar} alt={player.name}/>
            <AvatarFallback>
                {player.name.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
};

export default PlayerAvatar;
