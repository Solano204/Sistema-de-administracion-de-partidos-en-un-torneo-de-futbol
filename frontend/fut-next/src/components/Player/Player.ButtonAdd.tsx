"use client"; // Mark this component as a Client Component

import clsx from "clsx";
import React from "react";

type ButtonProps = {
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  dissabled?: boolean;
  showMessageOnHover?: boolean;
  className?: string;
  icon?: React.ReactNode; // Allow any icon to be passed
  iconSize?: number; // Customize icon size
  buttonSize?: "sm" | "md" | "lg"; // Customize button size
  children?: React.ReactNode; // Add this line
};

export const Button: React.FC<ButtonProps> = ({
  onClick,
  className,
  icon,
  children,
  dissabled,
  buttonSize = "md",

}) => {
  // Define button size classes
  const buttonSizeClasses = {
    sm: "p-[1em]",
    md: "p-[1.4em]",
    lg: "p-[1.8em]",
  };

  return (
    <button
      disabled= {dissabled}
      className={clsx(
        className,
        buttonSizeClasses[buttonSize] // Apply button size
      )}
      onClick={onClick}
    >
      <div
        className={clsx(
          "rounded-full transition-transform duration-500 hover:rotate-[360deg]   transform ease-out hover:scale-110 active:scale-122 active:animate-pulse dark:border-gray-800 ",
          // buttonBaseStylesCustom,"" // Icon color for light/dark mode
        )}
      >
        {icon }
        {children}
      </div>
    </button>
  );
};
