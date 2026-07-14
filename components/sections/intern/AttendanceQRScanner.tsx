"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Scan, Loader2, ShieldCheck, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scanAttendanceQR } from "@/lib/actions/attendance.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function AttendanceQRScanner() {
    const [isScanning, setIsScanning] = useState(true);
    const [status, setStatus] = useState<"idle" | "processing" | "success" | "already" | "error" | "not_accepted">("idle");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleScan = async (data: string | null) => {
        if (!data || status === "processing" || status === "success" || status === "already") return;

        let tokenToScan = data;
        try {
            // Check if the scanned data is a full URL and extract the token
            const url = new URL(data);
            if (url.searchParams.has('token')) {
                tokenToScan = url.searchParams.get('token')!;
            }
        } catch {
            // Not a URL, treat as raw token (backward compatibility)
        }

        setStatus("processing");
        setIsScanning(false);
        setMessage("Acquiring location...");

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    await processScan(tokenToScan, position.coords.latitude, position.coords.longitude);
                },
                async (error) => {
                    console.error("Geolocation error:", error);
                    // Still attempt scan; the server will reject it if geolocation is strictly required
                    await processScan(tokenToScan);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            await processScan(tokenToScan);
        }
    };

    const processScan = async (tokenToScan: string, lat?: number, lng?: number) => {
        setMessage("Verifying Attendance...");
        try {
            const res = await scanAttendanceQR(tokenToScan, lat, lng);
            if (res.success) {
                if (res.alreadyLogged) {
                    setStatus("already");
                    setMessage(res.message || "Attendance Already Recorded");
                } else {
                    setStatus("success");
                    setMessage(res.message || "Attendance Logged Successfully");
                }
                router.refresh();
            } else {
                if (res.code === "not_accepted") {
                    setStatus("not_accepted");
                } else {
                    setStatus("error");
                }
                setMessage(res.error || "Failed to log attendance");
            }
        } catch (error) {
            setStatus("error");
            setMessage("An unexpected error occurred");
        }
    };

    const resetScanner = () => {
        setStatus("idle");
        setMessage("");
        setIsScanning(false);
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-blue-900/5 relative">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[#155DFC] flex items-center justify-center">
                        <Scan size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Scan Attendance</h2>
                        <p className="text-[10px] font-medium text-slate-500">Scan the QR code displayed in your workspace</p>
                    </div>
                </div>

                <div className="relative w-full aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-700">
                    <AnimatePresence mode="wait">
                        {/* ─── Idle State ─── */}
                        {status === "idle" && !isScanning && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-900"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-[#155DFC]/10 flex items-center justify-center mb-4">
                                    <Scan size={32} className="text-[#155DFC]" />
                                </div>
                                <Button
                                    onClick={() => setIsScanning(true)}
                                    className="bg-[#155DFC] hover:bg-[#1A3CB9] text-white rounded-xl shadow-lg shadow-blue-500/20 px-8 py-5 h-auto gap-2 font-bold tracking-wide"
                                >
                                    <Scan size={16} />
                                    Open Camera
                                </Button>
                                <p className="text-[9px] text-slate-400 font-medium mt-3">
                                    Point your camera at the QR code poster
                                </p>
                            </motion.div>
                        )}

                        {/* ─── Camera Active ─── */}
                        {isScanning && (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0"
                            >
                                <div id="reader" className="w-full h-full [&>video]:object-cover" />
                                <Html5QrcodePlugin
                                    fps={10}
                                    qrbox={250}
                                    disableFlip={false}
                                    qrCodeSuccessCallback={(decodedText) => {
                                        handleScan(decodedText);
                                    }}
                                />

                                {/* Corner brackets overlay */}
                                <div className="absolute inset-8 pointer-events-none z-10">
                                    <div className="w-full h-full relative">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#155DFC] rounded-tl-lg" />
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#155DFC] rounded-tr-lg" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#155DFC] rounded-bl-lg" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#155DFC] rounded-br-lg" />

                                        {/* Scanning laser */}
                                        <motion.div
                                            animate={{ y: ["0%", "100%", "0%"] }}
                                            transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
                                            className="w-full h-0.5 bg-[#155DFC] shadow-[0_0_12px_3px_rgba(21,93,252,0.4)] absolute top-0"
                                        />
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsScanning(false);
                                    }}
                                    className="absolute top-3 right-3 z-50 bg-black/50 text-white hover:bg-black/70 rounded-full w-8 h-8 p-0"
                                >
                                    <XCircle size={16} />
                                </Button>

                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-4 py-2 rounded-full">
                                    Scanning for QR code...
                                </div>
                            </motion.div>
                        )}

                        {/* ─── Processing ─── */}
                        {status === "processing" && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                >
                                    <Loader2 className="text-[#155DFC] mb-4" size={48} />
                                </motion.div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Verifying Attendance...</p>
                                <p className="text-[9px] text-slate-400 font-medium mt-1">Checking your assignment</p>
                            </motion.div>
                        )}

                        {/* ─── Success ─── */}
                        {status === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#155DFC] via-[#1A3CB9] to-[#0D2E8C] text-white p-6 text-center"
                            >
                                {/* Decorative glow */}
                                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-[80px]" />
                                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-300/10 rounded-full blur-[80px]" />

                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                                    className="relative z-10"
                                >
                                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-5 shadow-2xl shadow-black/10">
                                        <CheckCircle size={48} className="text-white" />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="relative z-10"
                                >
                                    <p className="text-2xl font-black tracking-tight mb-2">{message}</p>
                                    <p className="text-xs text-blue-200 font-medium">Have a productive day at your workspace! 🚀</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="relative z-10 mt-6"
                                >
                                    <Button
                                        onClick={resetScanner}
                                        variant="ghost"
                                        className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl text-[10px] font-bold"
                                    >
                                        Done
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* ─── Already Logged ─── */}
                        {status === "already" && (
                            <motion.div
                                key="already"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#155DFC] via-[#1A3CB9] to-[#0D2E8C] text-white p-6 text-center"
                            >
                                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-[80px]" />

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", bounce: 0.5 }}
                                >
                                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-5">
                                        <ShieldCheck size={48} className="text-white" />
                                    </div>
                                </motion.div>

                                <p className="text-xl font-black tracking-tight mb-2">{message}</p>
                                <p className="text-xs text-blue-200 font-medium flex items-center gap-1.5">
                                    <Clock size={12} />
                                    Your attendance for today was already confirmed
                                </p>

                                <Button
                                    onClick={resetScanner}
                                    variant="ghost"
                                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl text-[10px] font-bold mt-6"
                                >
                                    Done
                                </Button>
                            </motion.div>
                        )}

                        {/* ─── Error ─── */}
                        {status === "error" && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950/30 p-6 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", bounce: 0.3 }}
                                >
                                    <XCircle size={56} className="text-red-500 mb-4" />
                                </motion.div>
                                <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Scan Failed</h3>
                                <p className="text-xs font-medium text-red-600/80 dark:text-red-400/80 max-w-xs">{message}</p>

                                <Button
                                    onClick={resetScanner}
                                    className="mt-6 bg-red-500 hover:bg-red-600 text-white rounded-xl"
                                >
                                    Try Again
                                </Button>
                            </motion.div>
                        )}

                        {/* ─── Not Accepted ─── */}
                        {status === "not_accepted" && (
                            <motion.div
                                key="not_accepted"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-orange-50 dark:bg-orange-950/30 p-6 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", bounce: 0.3 }}
                                >
                                    <ShieldAlert size={56} className="text-orange-500 mb-4" />
                                </motion.div>
                                <h3 className="text-lg font-bold text-orange-700 dark:text-orange-400 mb-2">Access Denied</h3>
                                <p className="text-xs font-medium text-orange-600/80 dark:text-orange-400/80 max-w-xs">{message}</p>

                                <Button
                                    onClick={resetScanner}
                                    className="mt-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                                >
                                    Close
                                </Button>
                            </motion.div>
                        )}
                        {/* ─── Error ─── */}
                        {status === "error" && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950/30 p-6 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", bounce: 0.3 }}
                                >
                                    <XCircle size={56} className="text-red-500 mb-4" />
                                </motion.div>
                                <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Scan Failed</h3>
                                <p className="text-xs font-medium text-red-600/80 dark:text-red-400/80 max-w-xs">{message}</p>

                                <Button
                                    onClick={resetScanner}
                                    className="mt-6 bg-red-500 hover:bg-red-600 text-white rounded-xl"
                                >
                                    Try Again
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// Wrapper for html5-qrcode
const Html5QrcodePlugin = (props: any) => {
    useEffect(() => {
        let html5QrCode: any;

        import('html5-qrcode').then(({ Html5Qrcode }) => {
            html5QrCode = new Html5Qrcode("reader");
            const config = {
                fps: props.fps || 10,
                qrbox: props.qrbox || { width: 250, height: 250 },
                aspectRatio: 1.0,
            };

            // Start immediately with the back camera
            html5QrCode.start(
                { facingMode: "environment" },
                config,
                (text: string) => {
                    if (props.qrCodeSuccessCallback) props.qrCodeSuccessCallback(text);
                },
                (err: any) => {
                    if (props.qrCodeErrorCallback) props.qrCodeErrorCallback(err);
                }
            ).catch((err: any) => {
                console.error("Failed to start camera", err);
            });
        });

        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                }).catch((error: any) => {
                    console.error("Failed to clear html5QrCode. ", error);
                });
            } else if (html5QrCode) {
                try { html5QrCode.clear(); } catch (e) {}
            }
        };
    }, []);

    return null;
};
