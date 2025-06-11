"use client";
import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import {
  inputBaseStyles,
  labelStyles,
  scrollContainer,
} from "./Common.FormStyles";
import Image from "next/image";

export interface SelectOption<T> {
  label: string;
  value: T;
  image?: string;
}

interface GenericSelectProps<T> {
  options: SelectOption<T>[];
  onChange?: (selectedOption: SelectOption<T> | null) => void;
  value?: SelectOption<T> | null;
  defaultValue?: SelectOption<T> | null;
  placeholder?: string;
  label?: string;
  className?: string;
  searchable?: boolean;
  imageWidth?: string;
  imageHeight?: string;
  id: string;
  error?: string;
  disabled?: boolean;
}

export function NeonSelect<T>({
  options,
  onChange = () => {},
  value,
  defaultValue = null,
  placeholder = "Select an option",
  label = "Select",
  className = "",
  searchable = true,
  imageWidth = "w-6",
  imageHeight = "h-4",
  id,
  error,
  disabled = false,
}: GenericSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectOption<T> | null>(
    value || defaultValue
  );
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);

  // Sync internal state with external value
  useEffect(() => {
    if (value !== undefined) {
      setSelectedOption(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (option: SelectOption<T>) => {
    if (!disabled) {
      setSelectedOption(option);
      setIsOpen(false);
      onChange(option);
    }
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setSelectedOption(null);
      onChange(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      setSearchTerm(e.target.value);
    }
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className={`relative w-full z-20 ${className}`} ref={selectRef}>
      {/* Label */}
      <label htmlFor={id} className={labelStyles}>
        {label}
      </label>

      {/* Select button */}
      <div
        className={clsx(
          inputBaseStyles,
          className,
          "flex items-center justify-between z-20",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          isOpen ? "shadow-[#92dd0d]/20 dark:shadow-[#92dd0d]/30" : "",
          error ? "border-red-500 dark:border-red-500" : ""
        )}
        onClick={toggleDropdown}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
      >
        <div className="flex items-center gap-2 w-full relative">
          {selectedOption ? (
            <>
              {selectedOption.image && (
                <Image
                  fill
                  src={selectedOption.image}
                  alt=""
                  className={clsx(
                    imageWidth,
                    imageHeight,
                    "object-cover rounded-md",
                    "shadow-sm"
                  )}
                />
              )}
              <span className="truncate">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">
              {placeholder}
            </span>
          )}
        </div>

        {selectedOption ? (
          <button
            type="button"
            onClick={handleClearSelection}
            className={clsx(
              "rounded-full w-6 h-6 flex items-center justify-center transition-colors",
              "text-gray-400 dark:text-gray-500",
              disabled
                ? "cursor-not-allowed"
                : "hover:text-gray-700 dark:hover:text-gray-300"
            )}
            disabled={disabled}
          >
            ×
          </button>
        ) : (
          <svg
            className={clsx(
              "w-5 h-5 transition-transform duration-300",
              "text-gray-400 dark:text-gray-500",
              isOpen ? "transform rotate-180" : "",
              disabled ? "opacity-50" : ""
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs md:text-sm text-red-500 dark:text-red-400 text-left">
          {error}
        </p>
      )}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          className={clsx(
            "absolute z-10 w-full mt-2 rounded-xl md:rounded-2xl overflow-hidden",
            "backdrop-blur-lg",
            "bg-gradient-to-tr from-transparent via-[rgba(121,121,121,0.16)] to-transparent",
            "border border-gray-500 dark:border-gray-600",
            "shadow-lg"
          )}
        >
          {/* Search box */}
          {searchable && (
            <div
              className={clsx(
                "sticky top-0 p-3 border-b",
                "border-gray-500/30 dark:border-gray-600/30"
              )}
            >
              <input
                type="text"
                placeholder="Search options..."
                className={inputBaseStyles}
                value={searchTerm}
                onChange={handleSearchChange}
                disabled={disabled}
              />
            </div>
          )}

          {/* Options list */}
          <ul
            className={clsx(scrollContainer, "overflow-y-auto max-h-[250px]")}
            role="listbox"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={index}
                  className={clsx(
                    "px-3 py-2 md:px-4 z-20 md:py-3 relative flex items-center gap-3 cursor-pointer",
                    "transition-colors duration-300",
                    "border-b border-gray-500/20 dark:border-gray-600/20 last:border-b-0",
                    "dark:text-zinc-200 text-zinc-700",
                    "hover:bg-[rgba(121,121,121,0.25)] dark:hover:bg-[rgba(146,221,13,0.08)]",
                    selectedOption === option &&
                      "bg-[rgba(121,121,121,0.2)] dark:bg-[rgba(146,221,13,0.05)]"
                  )}
                  onClick={() => handleOptionSelect(option)}
                  role="option"
                  aria-selected={selectedOption === option}
                >
                  {option.image && (
                    <Image
                      fill
                      src={option.image}
                      alt=""
                      className={clsx(
                        imageWidth,
                        imageHeight,
                        "object-cover rounded-md",
                        "shadow"
                      )}
                    />
                  )}
                  <span>{option.label}</span>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-gray-400 dark:text-gray-500 text-center">
                No options found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
