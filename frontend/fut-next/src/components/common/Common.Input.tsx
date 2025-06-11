"use client";

import React, { forwardRef, useEffect, useState } from 'react';
import { formStyles } from './Common.FormStyle';
import { inputBaseStyles } from './Common.FormStyles';
import clsx from 'clsx';

export const FormInput = forwardRef<HTMLInputElement, {
  id: string;
  name?: string;
  label: string;
  type?: string; 
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  step?: string;
  required?: boolean;
  debounceTime?: number; // Add debounce for validation
}>(({ 
  id, 
  label, 
  type = 'text', 
  placeholder, 
  value = '', 
  onChange, 
  onBlur,
  className = '', 
  error, 
  name, 
  disabled = false,
  min,
  max,
  maxLength,
  step,
  required = false,
}, ref) => {
  const [internalValue, setInternalValue] = useState(value);
  
  useEffect(() => {
    setInternalValue(value);
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };
  
  return (
    <div className={formStyles.fieldContainer}>
      <label 
        htmlFor={id} 
        className={clsx(
          formStyles.label,
          formStyles.text,
          "text-gray-700 dark:text-gray-300"
        )}
      >
        {label}
        {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
      </label>
      <input
        ref={ref}
        id={id}
        type={type}
        placeholder={placeholder}
        value={internalValue}
        name={name}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        min={min}
        max={max}
        maxLength={maxLength}
        step={step}
        className={clsx(
          inputBaseStyles,
          error ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-700",
          disabled ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" : "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
          "focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600",
          "placeholder-gray-400 dark:placeholder-gray-500",
          className
        )}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400 text-left">
          {error}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';