import { RefObject, useEffect, useRef, useState } from "react";

export const useInput = (error: string | null) => {
  const [wasFocused, setWasFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const listener = () => {
      if (!wasFocused) {
        setWasFocused(true);
      }
    };

    inputRef.current?.addEventListener("focus", listener);

    const input = inputRef.current;
    return () => input?.removeEventListener("focus", listener);
  }, [inputRef, wasFocused]);

  return [wasFocused ? error : null, inputRef] as [
    string | null,
    RefObject<HTMLInputElement | null>,
  ];
};
