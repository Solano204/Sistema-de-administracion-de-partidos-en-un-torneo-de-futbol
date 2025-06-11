import React from "react";

type CheckboxProps = {
  className?: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
export const Checkbox = ({ checked, onChange, className }: CheckboxProps) => {
  return (
    <div className="relative inline-block">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`appearance-none h-5 w-5 border border-gray-300 dark:border-gray-600 rounded 
                   checked:bg-company-green dark:checked:bg-company-green checked:border-0
                   focus:outline-none focus:ring-2 focus:ring-company-green/50
                   transition-colors duration-200 ${className}`}
      />
      {checked && (
        <svg
          className="absolute inset-0 h-5 w-5 text-white pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
};
