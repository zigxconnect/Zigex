"use client";

import React, { useRef } from "react";
import { FileText, X, AlertCircle, UploadCloud } from "lucide-react";
import { Label } from "@/components/ui/label";

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  label: string;
  accept?: string;
  error?: string;
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  file,
  onFileChange,
  label,
  accept = ".pdf",
  error,
  maxSizeMB = 10
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  const removeFile = () => {
    onFileChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3 w-full">
      <Label className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1">
        {label}
      </Label>
      
      {file ? (
        <div className="p-4 bg-white border-2 border-blue-50 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tighter">
                {file.name}
              </p>
              <p className="text-[9px] text-slate-400 font-medium">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`h-24 border-2 border-dashed rounded-2xl flex items-center justify-center gap-4 cursor-pointer transition-all duration-300 bg-slate-50/50 hover:bg-blue-50/50 ${
            error ? "border-red-200" : "border-blue-100 hover:border-[#155DFC]"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-white text-[#155DFC] flex items-center justify-center shadow-sm">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-900">
              {error ? "Intel Needed" : "Upload File"}
            </p>
            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">
              {accept} (MAX {maxSizeMB}MB)
            </p>
          </div>
        </div>
      )}

      {error && (
        <span className="text-[10px] font-bold text-red-500 flex items-center gap-1.5 ml-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </span>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
