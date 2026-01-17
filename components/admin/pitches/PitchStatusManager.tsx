"use client";

import React, { useState } from "react";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updatePitchStatusAction } from "@/lib/actions/admin/pitches.action";
import { Loader2, Mail, MessageSquare } from "lucide-react";

interface PitchStatusManagerProps {
    submissionId: string;
    currentStatus: string;
}

const STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "viewed", label: "Viewed" },
    { value: "interested", label: "Interested" },
    { value: "meeting_scheduled", label: "Meeting Scheduled" },
    { value: "rejected", label: "Rejected" },
];

export default function PitchStatusManager({ submissionId, currentStatus }: PitchStatusManagerProps) {
    const [status, setStatus] = useState(currentStatus);
    const [sendMail, setSendMail] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const result = await updatePitchStatusAction(submissionId, status, sendMail);
            if (result.success) {
                toast.success("Status updated successfully!");
            } else {
                toast.error(result.error || "Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-col gap-1.5 min-w-[200px]">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Manage Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-11 rounded-xl font-bold border-slate-100 bg-slate-50/50">
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                        {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="font-medium rounded-lg">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <Switch 
                        id="send-mail" 
                        checked={sendMail} 
                        onCheckedChange={setSendMail}
                        className="data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="send-mail" className="text-xs font-bold text-slate-600 flex items-center gap-2 cursor-pointer">
                        <Mail className="w-3.5 h-3.5" /> Send Gmail Notification
                    </Label>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
                <Button 
                    variant="outline"
                    className="h-11 px-4 rounded-xl font-bold text-xs uppercase tracking-widest border-slate-100 text-slate-600 flex items-center gap-2"
                    onClick={() => toast.info("Encryption & Liveblocks DM coming soon!")}
                >
                    <MessageSquare className="w-4 h-4" /> Send DM
                </Button>
                
                <Button 
                    disabled={isUpdating || status === currentStatus}
                    onClick={handleUpdate}
                    className="h-11 px-8 rounded-xl font-black text-xs uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                    {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        "Update Status"
                    )}
                </Button>
            </div>
        </div>
    );
}
