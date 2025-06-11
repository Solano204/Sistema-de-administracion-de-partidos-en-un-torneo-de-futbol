"use client";
import clsx from 'clsx';
import React from 'react';
import { FiX } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  width?: string; // e.g. "500px", "80vw", "50%"
  height?: string; // e.g. "300px", "60vh", "auto"
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  closeButtonPosition?: 'top-right' | 'top-left' | 'bottom-center';
  closeButtonClassName?: string;
  contentClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children,
  width = "500px",
  height = "auto",
  minWidth = "300px",
  minHeight = "200px",
  maxWidth = "90vw",
  maxHeight = "90vh",
  closeButtonPosition = 'top-right',
  closeButtonClassName = "",
  contentClassName = ""
}) => {
  // Position mapping for close button
  const closeButtonPositions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  // Modal content style with dynamic dimensions
  const modalContentStyle = {
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight
  };
 // Styled Modal Component
  return (
    <div
      className={clsx(
        "fixed inset-0 z-[1000] transition-all duration-300",
        "bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm",
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      )}
      onClick={onClose} // Close when clicking outside
    >
      <div className="flex items-center justify-center h-full p-4">
        <div
          className={clsx(
            "rounded-2xl relative overflow-auto transition-all duration-300 transform",
            "bg-white/95 dark:bg-gray-900/95 shadow-2xl",
            "border border-gray-200/50 dark:border-gray-700/50",
            "backdrop-filter backdrop-blur-md",
            isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95',
            contentClassName
          )}
          style={modalContentStyle}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
        >
          {/* Close Button with dynamic positioning */}
          <button
            onClick={onClose}
            className={clsx(
              "absolute z-10 p-2 rounded-full transition-all duration-200",
              "text-xl flex items-center justify-center",
              "bg-gray-200/80 hover:bg-gray-300/80 text-gray-800",
              "dark:bg-gray-800/80 dark:hover:bg-gray-700/80 dark:text-gray-200",
              "shadow-md hover:shadow-lg transform hover:scale-105",
              "focus:outline-none focus:ring-2 focus:ring-gray-500/50 dark:focus:ring-gray-400/50",
              closeButtonPositions[closeButtonPosition],
              closeButtonClassName
            )}
            aria-label="Close dialog"
          >
            <FiX />
          </button>
          
          {/* Modal content */}
          <div className="h-full w-full p-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};