"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface LogbookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  studentName: string;
}

/**
 * The logbook as it prints: every day's report, for the supervisor and the
 * school to sign. "Print" also saves it as a PDF from the print dialog.
 */
export function LogbookPreviewModal({ isOpen, onClose, applicationId }: LogbookPreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const frame = useRef<HTMLIFrameElement>(null);
  const url = `/api/internships/logbook/${encodeURIComponent(applicationId)}`;

  // The frame can finish loading before React listens for it: check, then keep listening.
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      if (frame.current?.contentDocument?.readyState === "complete" && frame.current.contentDocument.body?.childElementCount) {
        setLoading(false);
        clearInterval(timer);
      }
    }, 300);
    return () => clearInterval(timer);
  }, [isOpen]);

  const button =
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setLoading(true);
        }
      }}
    >
      <DialogContent className="flex h-[92dvh] w-[calc(100%-1rem)] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0">
        <div className="flex flex-col gap-3 border-b border-[#EEF2FA] px-5 py-4 pr-14 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <DialogTitle className="font-heading text-lg font-semibold text-[#0B1B3F]">Logbook</DialogTitle>
            <DialogDescription className="text-sm text-[#4A5670]">
              Ready to print and sign. For a PDF, choose Print, then Save as PDF.
            </DialogDescription>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0">
            <button
              type="button"
              onClick={() => frame.current?.contentWindow?.print()}
              disabled={loading}
              className={`${button} flex-1 bg-[#155DFC] text-white hover:bg-[#0F3FB8] disabled:opacity-60 sm:flex-none`}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer" className={`${button} flex-1 whitespace-nowrap bg-white text-[#0B1B3F] ring-1 ring-[#DCE5F5] hover:bg-[#F8FAFF] sm:flex-none`}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="sm:hidden">Open full page</span>
              <span className="hidden sm:inline">Open in a new tab</span>
            </a>
          </div>
        </div>

        <div className="relative flex-1 bg-[#EEF2FA]">
          {loading && (
            <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#EEF2FA]">
              <Loader2 className="h-7 w-7 animate-spin text-[#155DFC] motion-reduce:animate-none" aria-hidden="true" />
              <p className="text-sm text-[#4A5670]">Putting your logbook together…</p>
            </div>
          )}
          {isOpen && <iframe ref={frame} title="Logbook" src={url} className="h-full w-full border-0" onLoad={() => setLoading(false)} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
