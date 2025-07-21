"use client";

import { createContext, useState, useContext, ReactNode } from "react";

type AiContextType = {
  inputValue: string;
  setInputValue: (value: string) => void;
};

const AiContext = createContext<AiContextType | undefined>(undefined);

export const AiContextProvider = ({ children }: { children: ReactNode }) => {
  const [inputValue, setInputValue] = useState("");

  return (
    <AiContext.Provider value={{ inputValue, setInputValue }}>
      {children}
    </AiContext.Provider>
  );
};

export const useAiContext = () => {
  const context = useContext(AiContext);
  if (context === undefined) {
    throw new Error("useAiContext must be used within an AiContextProvider");
  }
  return context;
};
