import React from "react";

interface CharacterCountProps {
  current: number;
  max: number;
  warningThreshold?: number;
}

export const CharacterCount: React.FC<CharacterCountProps> = ({ 
  current, 
  max, 
  warningThreshold = 0.9 
}) => {
  const isNearLimit = current > max * warningThreshold;
  
  return (
    <span className={`text-xs ${isNearLimit ? "text-red-500" : "text-muted-foreground"}`}>
      {current}/{max}
    </span>
  );
};