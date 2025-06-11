// useAnimationRouting.ts
"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("hop", "0.9,0,0.1,1");

export function useRevealer() {
  useGSAP(() => {
    gsap.to(".revealer", {
      scaleY: 0, // decrease its size bottom to top
      duration: 1.25,
      delay: 1,
      ease: "hop", // custom easy
    });
  }, {});
}
