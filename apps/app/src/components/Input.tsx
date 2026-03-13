import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  value: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  valid?: boolean;
  onChange?: (value: string) => void;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      value,
      type = "text",
      placeholder,
      disabled = false,
      valid = true,
      onChange = () => {},
    },
    ref,
  ) => {
    return (
      <input
        ref={ref}
        value={value}
        type={type}
        className={twMerge(
          "no-controls h-8 w-full bg-white/10 p-2 text-sm text-white/75 outline-0",
          !valid && "border-red border border-1",
        )}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  },
);

Input.displayName = "Input";
