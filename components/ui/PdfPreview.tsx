"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface PdfViewerModalProps {
  file: File;
  onClose: () => void;
}

/**
 * A modal pop-up component to display a preview of a local PDF file.
 */
export const PdfViewerModal = ({ file, onClose }: PdfViewerModalProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    // Create a temporary URL for the local file
    const url = URL.createObjectURL(file);
    setFileUrl(url);

    // Cleanup function to prevent memory leaks
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]); // Re-run if the file prop ever changes

  return (
    // The Modal Backdrop
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]"
      onClick={onClose} // Close modal on backdrop click
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg truncate" title={file.name}>
            Preview: {file.name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body with PDF Embed */}
        <div className="flex-grow p-2">
          {fileUrl ? (
            <embed
              src={fileUrl}
              type="application/pdf"
              width="100%"
              height="100%"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Loading preview...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
