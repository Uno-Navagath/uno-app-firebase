import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const chartColors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7300",
    "#a4de6c", "#d0ed57", "#8dd1e1", "#ffbb28",
    "#ff8042", "#d88884", "#a28cd8", "#84d8c4",
    "#d884d8", "#c4d884", "#f28c28", "#6c82de",
    "#de8282", "#82d8ff", "#d8c484", "#8cd8b4"
];