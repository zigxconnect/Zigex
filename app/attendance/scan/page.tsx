import React from "react";
import { XCircle, ArrowLeft } from "lucide-react";
import { StandaloneQRScanner } from "@/components/sections/intern/StandaloneQRScanner";
import Link from "next/link";

export default async function AttendanceScanPage(props: {
    searchParams: Promise<{ token?: string }>;
}) {
    const searchParams = await props.searchParams;
    const token = searchParams.token;

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl">
                    <XCircle size={64} className="mx-auto text-red-500 mb-6" />
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Invalid QR Code</h1>
                    <p className="text-sm text-slate-500 mb-8 font-medium">No attendance token was found in the URL.</p>
                    <Link href="/intern/workspace" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 h-12 transition-all">
                        <ArrowLeft size={16} className="mr-2" /> Return to Workspace
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
                <StandaloneQRScanner token={token} />
            </div>
        </div>
    );
}
