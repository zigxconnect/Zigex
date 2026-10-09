"use client";

import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AttendanceQRScanner } from "./AttendanceQRScanner";

interface AttendanceScannerModalProps {
  children: React.ReactNode;
  /** "test": before the placement starts, only checks that the camera reads a QR code. */
  mode?: "check-in" | "test";
  startsOn?: Date | null;
}

export function AttendanceScannerModal({ children, mode = "check-in", startsOn }: AttendanceScannerModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 sm:max-w-md">
        <AttendanceQRScanner mode={mode} startsOn={startsOn} />
      </DialogContent>
    </Dialog>
  );
}
