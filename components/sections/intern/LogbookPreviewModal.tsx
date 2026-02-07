"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Printer, FileText, Loader2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface LogbookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  studentName: string;
}

export function LogbookPreviewModal({
  isOpen,
  onClose,
  applicationId,
  studentName,
}: LogbookPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const previewUrl = `/api/internships/logbook/${applicationId}`;

  const handlePrint = () => {
    const iframe = document.getElementById("logbook-preview-iframe") as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-slate-950 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/20"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Logbook Preview</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{studentName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="hidden sm:flex rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs"
                >
                  <Printer size={14} className="mr-2" />
                  Print
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="hidden sm:flex rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow-lg shadow-blue-500/20"
                >
                  <a href={previewUrl} download={`Logbook_${studentName.replace(/\s+/g, '_')}.html`}>
                    <Download size={14} className="mr-2" />
                    Download
                  </a>
                </Button>
                <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 mx-2 hidden sm:block" />
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Iframe Content */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-900 relative">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Generating Preview...</p>
                </div>
              )}
              <iframe
                id="logbook-preview-iframe"
                src={previewUrl}
                className="w-full h-full border-0"
                onLoad={() => setIsLoading(false)}
              />
            </div>

            {/* Mobile Footer Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex sm:hidden gap-3 shrink-0">
                <Button
                  variant="outline"
                  size="default"
                  onClick={handlePrint}
                  className="flex-1 rounded-xl border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest"
                >
                  <Printer size={14} className="mr-2" />
                  Print
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="default"
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
                >
                  <a href={previewUrl} download={`Logbook_${studentName.replace(/\s+/g, '_')}.html`}>
                    <Download size={14} className="mr-2" />
                    Download
                  </a>
                </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
