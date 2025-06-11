"use client";
import clsx from "clsx";
import { gsap } from "gsap";
import { useState, useRef, useEffect, ReactNode } from "react";
import React from "react";

interface VideoPreviewProps {
  children: ReactNode;
  className: string;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  children,
  className,
}) => {
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const sectionRef = useRef<HTMLDivElement | null>(null); // Reference for the container section
  const contentRef = useRef<HTMLDivElement | null>(null); // Reference for the inner content

  const handleMouseMove = ({
    clientX,
    clientY,
    currentTarget,
  }: React.MouseEvent<HTMLDivElement>) => {
    const rect = currentTarget.getBoundingClientRect(); // Get dimensions of the container

    // Scale down the movement by reducing the factor (e.g., divide by 5)
    const xOffset = (clientX - (rect.left + rect.width / 2)) / 5;
    const yOffset = (clientY - (rect.top + rect.height / 2)) / 5;

    if (isHovering) {
      gsap.to(sectionRef.current, {
        x: xOffset,
        y: yOffset,
        rotationY: xOffset / 4, // Reduce rotation effect
        rotationX: -yOffset / 4,
        transformPerspective: 800,
        duration: 0.8, // Increase duration for smoother movement
        ease: "power2.out", // Smoother ease function
      });

      gsap.to(contentRef.current, {
        x: -xOffset / 1.5, // Reduce parallax effect
        y: -yOffset / 1.5,
        duration: 0.8,
        ease: "power2.out",
      });
    }
  };

  // THIS METHOD IS FOR WHEN I TAKE OFF THE MOUSE THE SQUARE WILL BE TURNIN' OFF SLOW
  useEffect(() => {
    // Reset the position of the content when hover ends
    if (!isHovering) {
      gsap.to(sectionRef.current, {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        duration: 1,
        ease: "power1.out",
      });

      gsap.to(contentRef.current, {
        x: 0,
        y: 0,
        duration: 1,
        ease: "power1.out",
      });
    }
  }, [isHovering]);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={clsx(`absolute z-50 size-full overflow-hidden`, className)}
      style={{
        perspective: "700px",
      }}
    >
      <div
        ref={contentRef}
        className="origin-center "
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </section>
  );
};

export default VideoPreview;
