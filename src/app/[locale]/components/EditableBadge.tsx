"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Input } from "@/app/[locale]/components/ui/input";

const EditableBadge = ({
  value,
  onChange,
  suffix = "",
  min = 0,
  max = 100,
}: {
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleBlur = () => {
    let newValue = parseFloat(inputValue);
    if (isNaN(newValue)) {
      newValue = value;
    } else {
      newValue = Math.max(min, Math.min(max, newValue));
    }
    setInputValue(newValue.toString());
    onChange(newValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setInputValue(value.toString());
      setIsEditing(false);
    }
  };

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  return (
    <div onClick={() => setIsEditing(true)} className="inline-block">
      {isEditing ? (
        <Input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-16 h-6 p-1 text-xs font-mono"
          autoFocus
          min={min}
          max={max}
          step="any"
        />
      ) : (
        <Badge
          variant="outline"
          className="font-mono cursor-pointer hover:bg-gray-100"
        >
          {value}
          {suffix}
        </Badge>
      )}
    </div>
  );
};

export default EditableBadge;
