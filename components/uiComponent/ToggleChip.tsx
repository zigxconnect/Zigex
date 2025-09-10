"use client";

type ToggleChipProps = {
  text: string;
  isSelected: boolean;
  onToggle: (text: string) => void;
};

export const ToggleChip = ({ text, isSelected, onToggle }: ToggleChipProps) => {
  return (
    <button
      type="button"
      onClick={() => onToggle(text)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border
        ${
          isSelected
            ? "bg-[#EA580C] text-white border-[#EA580C]"
            : "bg-gray-100 text-gray-800 border-gray-100 hover:bg-gray-200"
        }
      `}
    >
      {text}
    </button>
  );
};
