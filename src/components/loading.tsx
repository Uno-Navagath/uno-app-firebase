import React from 'react';
import {Skeleton} from "@/components/ui/skeleton";

const Loading = () => {
    return (
        <div className="space-y-2 p-4 w-full max-w-md mx-auto">
            <Skeleton className="h-6 w-32 rounded"/> {/* Title */}
            <Skeleton className="h-4 w-full rounded"/> {/* Subtitle */}
            <Skeleton className="h-24 w-full rounded"/> {/* Card or list */}
            <Skeleton className="h-24 w-full rounded"/>
            <Skeleton className="h-24 w-full rounded"/>
        </div>
    );
};

export default Loading;