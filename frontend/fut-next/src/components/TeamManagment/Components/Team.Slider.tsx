"use client";
import React, { useState } from "react";
import clsx from "clsx";
import {
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
} from "react-icons/fa";
import { SliderProps } from "../../common/types/SliceTypes";

export const Slider: React.FC<SliderProps> = ({
  children,
  className,
  activeIndex: controlledIndex,
  onIndexChange,
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const isControlled = controlledIndex !== undefined;
  const activeIndex = isControlled ? controlledIndex : internalIndex;

  const handleNext = () => {
    const newIndex =
      activeIndex + 1 < React.Children.count(children)
        ? activeIndex + 1
        : activeIndex;
    if (!isControlled) setInternalIndex(newIndex);
    onIndexChange?.(newIndex);
  };

  const handlePrev = () => {
    const newIndex = activeIndex - 1 >= 0 ? activeIndex - 1 : activeIndex;
    if (!isControlled) setInternalIndex(newIndex);
    onIndexChange?.(newIndex);
  };

  const getItemStyle = (index: number): React.CSSProperties => {
    const distance = index - activeIndex;
    const absDistance = Math.abs(distance);

    // Base styles without transform to avoid conflicts
    const baseStyle: React.CSSProperties = {
      transformOrigin: "center",
      transition: "all 0.5s cubic-bezier(0.17, 0.67, 0.21, 0.99)",
      boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
    };

    if (distance === 0) {
      return {
        ...baseStyle,
        transform: "translateX(0) scale(1) rotateY(0deg)",
        zIndex: 10,
        filter: "none",
        opacity: 1,
      };
    }

    if (distance === 1) {
      return {
        ...baseStyle,
        transform:
          "translateX(120px) scale(0.9) perspective(1000px) rotateY(-10deg)",
        zIndex: 5,
        filter: "blur(2px)",
        opacity: 0.8,
      };
    }

    if (distance === -1) {
      return {
        ...baseStyle,
        transform:
          "translateX(-120px) scale(0.9) perspective(1000px) rotateY(10deg)",
        zIndex: 5,
        filter: "blur(2px)",
        opacity: 0.8,
      };
    }

    if (distance > 0) {
      return {
        ...baseStyle,
        transform: `translateX(${120 + 80 * (absDistance - 1)}px) scale(${
          0.8 - 0.1 * (absDistance - 1)
        }) perspective(1000px) rotateY(-15deg)`,
        zIndex: 5 - absDistance,
        filter: "blur(4px)",
        opacity: absDistance > 2 ? 0 : 0.5,
      };
    } else {
      return {
        ...baseStyle,
        transform: `translateX(${-120 - 80 * (absDistance - 1)}px) scale(${
          0.8 - 0.1 * (absDistance - 1)
        }) perspective(1000px) rotateY(15deg)`,
        zIndex: 5 - absDistance,
        filter: "blur(4px)",
        opacity: absDistance > 2 ? 0 : 0.5,
      };
    }
  };
  return (
    <div
      className={clsx(
        className,
        "relative overflow-hidden flex items-center  justify-center"
      )}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) {
          return null;
        }

        // Type-safe way to handle the child element
        const element = child as React.ReactElement<{
          style?: React.CSSProperties;
          className?: string;
        }>;

        return React.cloneElement(element, {
          style: {
            position: "absolute",
            left: "calc(50%-120px)",
            transform: "translateY(-50%)",
            ...getItemStyle(index),
            ...element.props.style,
          },
          className: `${element.props.className || ""}`,
        });
      })}

      <button className="   absolute left-8 top-1/2 -translate-y-1/2  text-white  bg-opacity-20 bg-transparent border-none text-5xl font-bold w-16 h-16 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-300 shadow-lg z-20"
      onClick={handlePrev}
      >
        <FaRegArrowAltCircleLeft />
      </button>

      <button className="absolute right-8 top-1/2 -translate-y-1/2 text-white bg-opacity-20 bg-transparent border-none text-5xl font-bold w-16 h-16 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-300 shadow-lg z-20
      " onClick={handleNext} >
      
       <FaRegArrowAltCircleRight />
      </button>

    </div>
  );
};
