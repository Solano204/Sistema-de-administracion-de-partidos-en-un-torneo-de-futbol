// MatchSelectorToggle.tsx
"use client";
import React, { useState } from "react";
// import { useSelector } from "react-redux";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import clsx from "clsx";
// import { RootState } from "@/app/Redux/store";
import MatchSelector from "./MathSelector";

type Props = {
  className?: string;
};

export const MatchSelectorToggle = ({ className }: Props) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Access matches directly from Redux instead of fetching
  // const matchesChose = useSelector((state: RootState) => state.matches.choseMatches); 
  return (
    <div className={clsx("w-full bg-white dark:bg-gray-900 rounded-lg shadow-md z-[20] border border-gray-200 dark:border-gray-700", className)}>
      {/* Toggle Button */}
      <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200">Match Selector</h2>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="p-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label={isVisible ? "Hide match selector" : "Show match selector"}
        >
          {isVisible ? (
            <FaChevronUp className="text-gray-700 dark:text-gray-300" />
          ) : (
            <FaChevronDown className="text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>
      
      {/* MatchSelector Content */}
      <div className="transition-all duration-300 overflow-hidden" style={{ maxHeight: isVisible ? '500px' : '0' }}>
        {isVisible && (
          <div className="p-3">
            <MatchSelector />
          </div>
        )}
      </div>
      
      {/* Placeholder when hidden */}
      {!isVisible && (
        <div className="p-2 text-center text-gray-500 dark:text-gray-400 text-sm italic">
          Click to show match selector
        </div>
      )}
    </div>
  );
};