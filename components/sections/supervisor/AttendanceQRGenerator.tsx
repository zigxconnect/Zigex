"use client";

import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Printer, Download, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateStaticAttendanceToken } from "@/lib/actions/attendance.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AttendanceQRGeneratorProps {
    internshipId: string;
    internshipTitle?: string;
    companyName?: string;
}

export function AttendanceQRGenerator({ internshipId, internshipTitle, companyName }: AttendanceQRGeneratorProps) {
    const [qrToken, setQrToken] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const generateCode = async () => {
        setIsGenerating(true);
        try {
            const res = await generateStaticAttendanceToken(internshipId);
            if (res.success && res.token) {
                setQrToken(res.token);
                toast.success("QR code generated! You can now print it.");
            } else {
                toast.error(res.error || "Failed to generate QR code");
            }
        } catch (error) {
            toast.error("Unexpected error generating QR code");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        if (!printRef.current) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Please allow popups to print the QR code.");
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Zigex Attendance QR - ${internshipTitle || "Internship"}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        display: flex; align-items: center; justify-content: center;
                        min-height: 100vh; background: white;
                    }
                    .poster {
                        width: 400px; padding: 48px; text-align: center;
                        border: 3px solid #155DFC; border-radius: 24px;
                    }
                    .logo-text {
                        font-size: 32px; font-weight: 900; color: #155DFC;
                        letter-spacing: -1px; margin-bottom: 8px;
                    }
                    .subtitle {
                        font-size: 11px; color: #64748b; font-weight: 600;
                        text-transform: uppercase; letter-spacing: 3px; margin-bottom: 32px;
                    }
                    .qr-container {
                        display: inline-block; padding: 16px;
                        border: 4px solid #e2e8f0; border-radius: 20px;
                        margin-bottom: 24px;
                    }
                    .instructions {
                        font-size: 14px; font-weight: 700; color: #0f172a;
                        margin-bottom: 8px;
                    }
                    .sub-instructions {
                        font-size: 11px; color: #94a3b8; line-height: 1.5;
                    }
                    .program-name {
                        font-size: 12px; font-weight: 700; color: #155DFC;
                        background: #eff6ff; padding: 8px 16px; border-radius: 8px;
                        margin-top: 24px; display: inline-block;
                    }
                    @media print {
                        body { background: white; }
                        .poster { border: 3px solid #155DFC; }
                    }
                </style>
            </head>
            <body>
                <div class="poster">
                    <div class="logo-text">ZIGEx</div>
                    <div class="subtitle">Attendance Scanner</div>
                    <div class="qr-container">
                        ${printRef.current.querySelector('svg')?.outerHTML || ''}
                    </div>
                    <div class="instructions">Scan to Log Your Attendance</div>
                    <div class="sub-instructions">
                        Open your Zigex app → Go to your workspace → Tap "Scan Attendance"
                    </div>
                    ${internshipTitle ? `<div class="program-name">${companyName ? companyName + ' — ' : ''}${internshipTitle}</div>` : ''}
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-[#155DFC] rounded-xl flex items-center justify-center mb-4">
                <QrCode size={24} />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 tracking-tight">QR Attendance Code</h3>
            <p className="text-[10px] text-slate-500 text-center mb-6 max-w-xs font-medium leading-relaxed">
                Generate a permanent QR code poster. Print it and place it in your internship workspace departments. Interns scan it to automatically log attendance.
            </p>

            <AnimatePresence mode="wait">
                {qrToken ? (
                    <motion.div
                        key="qr-code"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center w-full"
                    >
                        {/* Printable QR poster preview */}
                        <div 
                            ref={printRef}
                            className="bg-white p-6 rounded-2xl border-2 border-[#155DFC]/20 shadow-lg mb-6 flex flex-col items-center"
                        >
                            <p className="text-2xl font-black text-[#155DFC] tracking-tighter mb-0.5">ZIGEx</p>
                            <p className="text-[8px] font-bold text-slate-400 tracking-[4px] uppercase mb-4">Attendance Scanner</p>
                            
                            <div className="p-3 border-4 border-slate-100 rounded-2xl">
                                <QRCodeSVG 
                                    value={`http://10.145.144.236:3000/attendance/scan?token=${qrToken}`} 
                                    size={180}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="Q"
                                />
                            </div>
                            
                            <p className="text-xs font-bold text-slate-800 mt-4 mb-1">Scan to Log Your Attendance</p>
                            <p className="text-[9px] text-slate-400 text-center max-w-[200px]">
                                Open Zigex → Workspace → Scan Attendance
                            </p>
                            {internshipTitle && (
                                <div className="mt-3 bg-blue-50 text-[#155DFC] text-[9px] font-bold px-3 py-1.5 rounded-lg">
                                    {companyName ? `${companyName} — ` : ""}{internshipTitle}
                                </div>
                            )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 w-full max-w-xs">
                            <Button 
                                onClick={handlePrint}
                                className="flex-1 bg-[#155DFC] hover:bg-[#1A3CB9] text-white rounded-xl shadow-lg shadow-blue-500/20 gap-2"
                            >
                                <Printer size={14} />
                                Print Poster
                            </Button>
                            <Button 
                                onClick={generateCode}
                                variant="outline"
                                className="rounded-xl gap-2 border-slate-200 dark:border-slate-700"
                            >
                                Regenerate
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 mt-4 text-[9px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
                            <Check size={12} />
                            This code is permanent — print as many copies as needed
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="generate-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-8"
                    >
                        <Button 
                            onClick={generateCode}
                            disabled={isGenerating}
                            className="bg-[#155DFC] hover:bg-[#1A3CB9] text-white rounded-xl shadow-lg shadow-blue-500/20 px-8 gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <QrCode size={14} />
                                    Generate QR Code
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
