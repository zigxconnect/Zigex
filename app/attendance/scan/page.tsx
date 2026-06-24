import React from "react";
import { scanAttendanceQR } from "@/lib/actions/attendance.actions";
import { CheckCircle, XCircle, ShieldCheck, ArrowLeft, ShieldAlert } from "lucide-react";
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

    const result = await scanAttendanceQR(token);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl">
                {result.success ? (
                    result.alreadyLogged ? (
                        <>
                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={40} className="text-[#155DFC]" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Already Logged</h1>
                            <p className="text-sm text-slate-500 mb-8 font-medium">You have already marked your attendance for today. Have a great workday!</p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} className="text-emerald-500" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Attendance Verified!</h1>
                            <p className="text-sm text-slate-500 mb-8 font-medium">Your attendance for today has been logged securely.</p>
                        </>
                    )
                ) : result.code === "not_accepted" ? (
                    <>
                        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldAlert size={40} className="text-orange-500" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Access Denied</h1>
                        <p className="text-sm text-slate-500 mb-8 font-medium">{result.error}</p>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle size={40} className="text-red-500" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Scan Failed</h1>
                        <p className="text-sm text-slate-500 mb-8 font-medium">{result.error || "An unknown error occurred while verifying the QR code."}</p>
                    </>
                )}

                <Link href="/intern/workspace" className="inline-flex items-center justify-center bg-[#155DFC] hover:bg-[#1A3CB9] text-white font-bold rounded-xl px-8 h-12 transition-all shadow-lg shadow-blue-500/20 w-full sm:w-auto">
                    Go to My Workspace
                </Link>
            </div>
        </div>
    );
}
