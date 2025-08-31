"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClearGamesOptions {
    includeFinished?: boolean;
    includeOngoing?: boolean;
    oldestDate?: Date;
    newestDate?: Date;
}

interface ClearGamesDialogProps {
    onClear: (options: ClearGamesOptions) => void;
    onClose?: () => void; // <-- added optional onClose
}

const ClearGamesDialog: React.FC<ClearGamesDialogProps> = ({ onClear, onClose }) => {
    const [open, setOpen] = useState(false);

    // Filters
    const [includeFinished, setIncludeFinished] = useState(true);
    const [includeOngoing, setIncludeOngoing] = useState(false);
    const [oldestDate, setOldestDate] = useState<string>("");
    const [newestDate, setNewestDate] = useState<string>("");

    const handleClear = () => {
        onClear({
            includeFinished,
            includeOngoing,
            oldestDate: oldestDate ? new Date(oldestDate) : undefined,
            newestDate: newestDate ? new Date(newestDate) : undefined,
        });
        setOpen(false);
        onClose?.(); // call onClose after clearing
    };

    const handleClose = () => {
        setOpen(false);
        onClose?.(); // call onClose when user cancels/closes
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">Clear Games</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Clear Games</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-2">
                    {/* Status Filters */}
                    <div className="flex flex-col gap-2">
                        <Label>Game Status</Label>
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-1">
                                <Checkbox
                                    checked={includeFinished}
                                    onCheckedChange={(checked) => setIncludeFinished(checked === true)}
                                    id="finished"
                                />
                                <Label htmlFor="finished" className="text-sm">
                                    Finished
                                </Label>
                            </div>
                            <div className="flex items-center gap-1">
                                <Checkbox
                                    checked={includeOngoing}
                                    onCheckedChange={(checked) => setIncludeOngoing(checked === true)}
                                    id="ongoing"
                                />
                                <Label htmlFor="ongoing" className="text-sm">
                                    Ongoing
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Date Filters */}
                    <div className="flex flex-col gap-2">
                        <Label>Oldest Date</Label>
                        <Input type="date" value={oldestDate} onChange={(e) => setOldestDate(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Newest Date</Label>
                        <Input type="date" value={newestDate} onChange={(e) => setNewestDate(e.target.value)} />
                    </div>
                </div>

                <DialogFooter className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleClear}>
                        Clear
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ClearGamesDialog;
