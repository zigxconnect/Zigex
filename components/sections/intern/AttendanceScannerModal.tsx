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
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full sm:max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none rounded-3xl">
        <AttendanceQRScanner />
      </DialogContent>
    </Dialog>
  );
}
