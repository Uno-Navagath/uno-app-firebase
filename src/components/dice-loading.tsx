"use client";

import * as animationData from "@/assets/dice.json";
import Lottie from "lottie-react";

const DiceLoading = () => {


    return (
        <Lottie
            animationData={animationData}
            className="flex justify-center items-center"
            loop={true}
        />
    );
};

export default DiceLoading;