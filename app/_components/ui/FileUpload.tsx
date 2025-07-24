"use client";
import { Upload } from "lucide-react";

export const FileUpload = () => {
  // In a real app, you would add state management here for the uploaded file.
  return (
    <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <Upload className="w-6 h-6 text-slate-500" />
        </div>
        <p className="mb-2 text-sm text-gray-800">
          <span className="font-semibold">Click to upload</span> or drag and
          drop
        </p>
        <p className="text-xs text-gray-500">PNG, JPG or SVG (max. 2MB)</p>
      </div>
      {/* The actual file input is hidden */}
      <input id="dropzone-file" type="file" className="hidden" />
    </div>
  );
};
