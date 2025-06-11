"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = (containerRef: React.RefObject<HTMLElement>) => {
   useGSAP(
      () => {
        const cards = document.querySelectorAll(".card");
        const images = document.querySelectorAll(".card img");
        const totalCards = cards.length;
  
        // Initialize first card
        gsap.set(cards[0], { y: "0%", scale: 1, rotation: 0 });
        gsap.set(images[0], { scale: 1 });
  
        // Position other cards below
        for (let i = 1; i < totalCards; i++) {
          gsap.set(cards[i], { y: "100%", scale: 1, rotation: 0 });
          gsap.set(images[i], { scale: 1 });
        }
  
        const scrollTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".sticky-cards",
            start: "top top",
            end: `+=${window.innerHeight * (totalCards - 1)}`,
            pin: true,
            scrub: 0.5,
          },
        });
  
        for (let i = 0; i < totalCards - 1; i++) {
          const currentCard = cards[i];
          const currentImage = images[i];
          const nextCard = cards[i + 1];
          const position = i;
  
          scrollTimeline.to(
            currentCard,
            {
              scale: 0.5,
              rotation: 10,
              duration: 1,
              ease: "none",
            },
            position
          );
  
          scrollTimeline.to(
            currentImage,
            {
              scale: 1.5,
              duration: 1,
              ease: "none",
            },
            position
          );
  
          scrollTimeline.to(
            nextCard,
            {
              y: "0%",
              duration: 1,
              ease: "none",
            },
            position
          );
        }
  
        return () => {
          scrollTimeline.kill();
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
      },
      { scope: containerRef }
    );
};
