import { Input } from "@/app/_components/ui/Input";
import { Button } from "@/app/_components/ui/Button";
import { Plus, Settings, Send, Paperclip, Image, FileText } from "lucide-react";
import { useState, useRef } from "react";
import { useAiContext } from "@/app/(fupro ai)/AiContext";

export const ChatInput = () => {
  const { inputValue, setInputValue } = useAiContext();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (type: "file" | "image") => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === "image" ? "image/*" : "*";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    setShowAddMenu(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* File attachments display */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {file.type.startsWith("image/") ? (
                <Image size={14} />
              ) : (
                <FileText size={14} />
              )}
              <span className="max-w-20 truncate">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="hover:text-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 relative">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="absolute -left-[9999px]"
          onChange={handleFileChange}
        />

        {/* Add button with dropdown */}
        <div className="relative z-[1000]">
          <Button
            variant="secondary"
            className="p-2 h-10 w-10 hover:scale-110 hover:rotate-12 transition-all duration-300 hover:shadow-lg group"
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            <Plus
              size={20}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
          </Button>

          {/* Add menu dropdown */}
          {showAddMenu && (
            <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-40 animate-fade-in-up z-[999]">
              <button
                onClick={() => handleFileSelect("file")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                <Paperclip size={16} />
                Attach File
              </button>
              <button
                onClick={() => handleFileSelect("image")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                <Image size={16} />
                Upload Image
              </button>
              <button
                onClick={() => setShowAddMenu(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                <FileText size={16} />
                New Document
              </button>
            </div>
          )}
        </div>

        <Button
          variant="secondary"
          className="p-2 h-10 w-10 hover:scale-110 transition-all duration-300 hover:shadow-lg group"
        >
          <Settings
            size={20}
            className="transition-transform duration-300 group-hover:rotate-180"
          />
        </Button>

        <div className="relative flex-1 group">
          <Input
            value={inputValue || ""}
            onChange={(e) => setInputValue?.(e.target.value)}
            placeholder="Chat with FuproAI..."
            className="pr-12 h-12 transition-all duration-300 focus:shadow-lg focus:shadow-blue-100 focus:border-blue-400 bg-white backdrop-blur-sm border-gray-200/50 hover:bg-white focus:bg-white text-gray-900 placeholder:text-gray-500"
          />

          {/* Animated placeholder dots when focused */}
          {(!inputValue || inputValue === "") && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}

          <Button
            variant="orange"
            className="absolute top-1/2 right-2 -translate-y-1/2 p-2 h-9 w-9 hover:scale-110 transition-all duration-300 hover:shadow-lg group/send hover:rotate-12"
          >
            <Send
              size={18}
              className="transition-transform duration-300 group-hover/send:translate-x-0.5"
            />
          </Button>

          {/* Subtle glow effect on focus */}
          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400/20 to-orange-400/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none blur-sm -z-10"></div>
        </div>
      </div>
    </div>
  );
};
