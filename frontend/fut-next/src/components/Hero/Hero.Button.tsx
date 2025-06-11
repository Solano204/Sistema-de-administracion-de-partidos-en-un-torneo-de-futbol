"use client";
import React, { useState } from "react";

export function ButtonNext() {
  // Initialize the state with a default direction ("right")
  const [direction, setDirection] = useState<"right" | "left">("right");

  // Toggle the direction on button click
  const toggleDirection = () => {
    setDirection((prevDirection) =>
      prevDirection === "right" ? "left" : "right"
    );
  };

  return (
    <div className="group flex relative  w-[200px] items-center justify-center">
      <button
        className="cursor-pointer bg-none border-none rounded-lg px-6 py-2 text-xl font-semibold text-indigo-600 transition-all duration-300 ease-in-out"
        onClick={toggleDirection}
      >
        
        {/* Button content */}
      </button>

      {/* First arrow */}
      <span
        className={`absolute w-[24px] pointer-events-none fill-gray-400 top-1/4 left-[50%] transition-all duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)] ${
          direction === "right" ? "rotate-0" : "rotate-180"
        }`}
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
        </svg>
      </span>

      {/* Second arrow */}
      <span
        className={`absolute w-[24px] pointer-events-none fill-gray-400 top-1/4 left-[60%] opacity-0 group-hover:opacity-66 transition-all duration-300 delay-50 ease-[cubic-bezier(0.645,0.045,0.355,1)] group-hover:right-[-20px] ${
          direction === "right" ? "rotate-0" : "rotate-180"
        }`}
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
        </svg>
      </span>

      {/* Third arrow */}
      <span
        className={`absolute w-[24px] pointer-events-none fill-gray-400 top-1/4 left-[70%] opacity-0 group-hover:opacity-33 transition-all duration-300 delay-100 ease-[cubic-bezier(0.645,0.045,0.355,1)] group-hover:right-[-40px] ${
          direction === "right" ? "rotate-0" : "rotate-180"
        }`}
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
        </svg>
      </span>
    </div>
  );
}
