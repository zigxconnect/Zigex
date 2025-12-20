"use client";

import * as React from "react";
import { X } from "lucide-react"; // Assuming lucide-react for icons

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

type Option = {
  value: string;
  label: string;
};

interface CreatableMultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function CreatableMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select or create options...",
}: CreatableMultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const selectedOptions = React.useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value]
  );

  const handleSelect = (optionValue: string) => {
    if (!value.includes(optionValue)) {
      onChange([...value, optionValue]);
    }
  };

  const handleUnselect = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!inputRef.current) return;

    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      handleUnselect(value[value.length - 1]);
    }

    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      const newOptionValue = inputValue.trim();
      if (!value.includes(newOptionValue)) {
        onChange([...value, newOptionValue]);
      }
      setInputValue("");
    }
  };

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-2">
          {value.map((val) => {
            const option = options.find((opt) => opt.value === val);
            return (
              <Badge key={val} variant="secondary" className="px-2 py-1">
                {option ? option.label : val}
                <button
                  type="button"
                  className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleUnselect(val)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          <div className="flex-1 flex items-center min-w-[150px]">
            <CommandPrimitive.Input
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              onBlur={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground py-1"
            />
            {inputValue.trim() !== "" && (
               <button
                 type="button"
                 onClick={() => {
                   const newOptionValue = inputValue.trim();
                   if (!value.includes(newOptionValue)) {
                     onChange([...value, newOptionValue]);
                   }
                   setInputValue("");
                   inputRef.current?.focus();
                 }}
                 className="ml-2 text-blue-600 font-medium text-xs uppercase px-2 py-1 hover:bg-blue-50 rounded"
               >
                 Add
               </button>
            )}
          </div>
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <CommandList className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup heading="Suggestions">
              {options
                .filter((opt) => !value.includes(opt.value))
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onSelect={() => {
                      handleSelect(option.value);
                      setInputValue("");
                    }}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        )}
      </div>
    </Command>
  );
}
