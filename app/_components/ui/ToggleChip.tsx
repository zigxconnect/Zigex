"use client";

type ToggleChipProps = {
  text: string;
  isSelected: boolean;
  onToggle: () => void;
};

export const ToggleChip = ({ text, isSelected, onToggle }: ToggleChipProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer
        ${
          isSelected
            ? "bg-black text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }
      `}
    >
      {text}
    </button>
  );
};
