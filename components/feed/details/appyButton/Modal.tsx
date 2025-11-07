import DynamicForm from "@/components/sections/dashboard/Application/application";
import { CheckCircle2, X } from "lucide-react";

// Modal Component
export default function ApplicationModal({
  isOpen,
  onClose,
  type,
  id,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: "internship" | "program" | "event";
  id: string;
  title: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="mt-[5rem] fixed inset-0 z-9999 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 z-9999"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 relative z-[10000]">
        <div className="relative w-full max-w-2xl animate-in zoom-in-95 duration-200">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-[10001] w-12 h-12 rounded-full bg-white shadow-xl hover:bg-gray-100 flex items-center justify-center transition-all hover:rotate-90 group"
          >
            <X size={20} className="text-gray-700 group-hover:text-gray-900" />
          </button>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-2xl max-h-[85vh] overflow-hidden relative z-[10000]">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Apply for {type}</h2>
                  <p className="text-blue-100 text-sm mt-1">{title}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8 overflow-y-auto max-h-[calc(85vh-120px)]">
              <DynamicForm type={type} id={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}