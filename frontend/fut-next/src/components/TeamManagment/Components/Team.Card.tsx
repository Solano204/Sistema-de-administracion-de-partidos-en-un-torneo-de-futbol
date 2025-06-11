"use client";
import React, { useState, useRef, useEffect } from "react";
import { SlideItem } from "@/components/common/types/SliceTypes";
import { redirect, usePathname } from "next/navigation";
import { Button } from "@/components/Player/Player.ButtonAdd";

interface CardProps extends SlideItem {
  className?: string;
  style?: React.CSSProperties;
  image?: string;
  disabled?: boolean;
  idCategory: string;
  shape?: "circle" | "square";
  actionType?: "redirect" | "modal";
  onModalOpen?: (shouldOpen: boolean) => void;
  modalContent?: {
    title?: string;
    description?: string;
  };
}

export const Card: React.FC<CardProps> = ({
  disabled = false,
  title,
  id,
  className = "",
  style,
  image,
  shape = "circle",
  actionType = "redirect",
  onModalOpen,
}) => {
  const pathname = usePathname();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLoadData = (itemName: string) => {
    // Sanitize the itemName for URL
    const sanitizedName = itemName
      .toLowerCase() // Convert to lowercase
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, "") // Remove all non-alphanumeric characters except hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

    console.log("Original:", itemName, "Sanitized:", sanitizedName);
    redirect(`${pathname}/${id}`);
  };

  const handleCardAction = () => {

    if( disabled) {
      return;
    }
    if (actionType === "modal" && onModalOpen) {
      onModalOpen(true);
    } else {
      handleLoadData(title);
    }
  };

  useEffect(() => {
    if (cardRef.current) {
      setDimensions({
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      });
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dimensions.width / 2;
    const y = e.clientY - rect.top - dimensions.height / 2;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setMousePosition({ x: 0, y: 0 });
      setIsHovering(false);
    }, 300);
  };

  const mousePX = mousePosition.x / dimensions.width;
  const mousePY = mousePosition.y / dimensions.height;

  const cardTransform = {
    transform: `rotateY(${mousePX * 10}deg) rotateX(${mousePY * -10}deg)`,
    transition: "transform 0.3s ease-out",
  };

  const bgTransform = {
    transform: `translateX(${mousePX * -20}px) scale(1.2) translateY(${
      mousePY * -20
    }px)`,
    backgroundImage: image ? `url(${image})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
return (
  <div
    className={`cardCategory-wrap w-full h-full ${className} ${
      shape === "circle" ? "rounded-full" : "rounded-3xl"
    }`}
    onMouseMove={handleMouseMove}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
    ref={cardRef}
    style={style}
    onClick={handleCardAction}
  >
    <div
      className={`cardCategory w-full h-full relative overflow-hidden ${
        isHovering ? "hovering" : ""
      } text-justify p-6 ${
        shape === "circle" ? "rounded-full" : "rounded-3xl"
      } ${className}`}
      style={cardTransform}
    >
      {/* Background image */}
      <div
        className="cardCategory-bg absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-50 pointer-events-none"
        style={bgTransform}
      />

      {/* Centered Button */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <button
            className={`z-[100] text-2xl  font-bold  transition-all duration-300 ${
            isHovering ? "scale-110" : "scale-100"
          }`}
        >
          {title}
        </button>
      </div>
    </div>
  </div>
);
}