import React from "react";
import Image from "next/image";
import clsx from "clsx"; // optional helper for class merging

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
    size?: LogoSize;
}

const sizeMap = {
    sm: { img: 24, text: "text-lg" },
    md: { img: 40, text: "text-2xl" },
    lg: { img: 64, text: "text-4xl" },
};

const Logo: React.FC<LogoProps> = ({ size = "md" }) => {
    const { img, text } = sizeMap[size];

    return (
        <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="UNO Logo" width={img} height={img} />
            <h1 className={clsx("font-bold", text)}>UNO</h1>
        </div>
    );
};

export default Logo;
