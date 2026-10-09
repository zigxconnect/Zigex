"use client";

import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AttendanceQRScanner } from "./AttendanceQRScanner";

interface AttendanceScannerModalProps {
  children: React.ReactNode;
}

export function AttendanceScannerModal({ children }: AttendanceScannerModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 sm:max-w-md">
        <AttendanceQRScanner />
      </DialogContent>
    </Dialog>
  );
}
