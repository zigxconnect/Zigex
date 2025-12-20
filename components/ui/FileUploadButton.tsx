"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, X } from "lucide-react";


function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

interface FileUploadButtonProps {
  value?: File | null;
  onChange: (file: File | null) => void;
}

export const FileUploadButton = ({
  value: file,
  onChange,
}: FileUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      onChange(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    onChange(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/pdf" 
      />

      {file ? (
        <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted">
          <div className="flex items-center gap-3">
            <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground truncate">{file.name}</p>
              <p className="text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <Upload size={16} className="mr-2" />
          Upload Resume (PDF, Max 2MB)
        </Button>
      )}
    </div>
  );
};
