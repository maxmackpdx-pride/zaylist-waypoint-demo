"use client";

import { type ChangeEvent, useState } from "react";

type UseCharacterLimitProps = {
  maxLength: number;
  initialValue?: string;
};

export function useCharacterLimit({ maxLength, initialValue = "" }: UseCharacterLimitProps) {
  const [value, setValue] = useState(initialValue);
  const [characterCount, setCharacterCount] = useState(initialValue.length);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = e.target.value;
    if (next.length <= maxLength) {
      setValue(next);
      setCharacterCount(next.length);
    }
  };

  return { value, characterCount, handleChange, maxLength, setValue };
}