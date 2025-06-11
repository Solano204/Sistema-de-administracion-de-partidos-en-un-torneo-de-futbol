"use client";

import { IoReload } from "react-icons/io5";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type btnSize = "default" | "lg" | "sm";

type SubmitButtonProps = {
  className?: string;
  text?: string;
  size?: btnSize;
  logo?: ReactNode;
  disabled?: boolean; // Added disabled prop
};

export function SubmitButton({
  className = "",
  text = "",
  size = "lg",
  logo,
  disabled = false, // Default to not disabled
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || disabled} // Combine with form status
      className={cn("capitalize flex items-center gap-2", className)}
      size={size}
    >
      {logo && <span className="border-2 border-amber-50 rounded-full">{logo}</span>}

      {pending ? (
        <>
          <IoReload className="mr-2 h-4 w-4 animate-spin" />
          Please wait...
        </>
      ) : (
        (text ? text : "")
      )}
    </Button>
  );
}