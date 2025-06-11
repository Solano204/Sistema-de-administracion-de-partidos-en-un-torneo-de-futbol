import clsx from "clsx";
import React, { forwardRef } from "react";

type InputProps = {
  className?: string;
  placeHolder?: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  disabled?: boolean;
  defaultValue?: string | number;
  backgroundColor?: string; // Custom background color or text color
} & React.InputHTMLAttributes<HTMLInputElement>; // Inherit native input props

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      placeHolder = "",
      type = "text",
      value,
      onChange,
      name,
      disabled = false,
      defaultValue,
      backgroundColor = "",
      ...rest
    },
    ref
  ) => {
    return (
      <div className={clsx("flex items-center justify-center", className)}>
        <div className="group/messageBoxGroup w-full h-full flex px-4 rounded-lg border dark:border-[#fff] border-[#3f3f3f] focus-within:border-[#6e6e6e]">
          <input
            ref={ref}
            disabled={disabled}
            name={name}
            onChange={onChange}
            placeholder={placeHolder}
            type={type}
            value={value}
            defaultValue={defaultValue}
            id="messageInput"
            className={clsx(
              backgroundColor,
              "w-full h-full outline-none border-none pl-2"
            )}
            {...rest} // Allow other input props like autoFocus, maxLength, etc.
          />
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";
