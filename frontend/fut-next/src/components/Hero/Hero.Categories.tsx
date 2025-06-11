"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CgGenderFemale } from "react-icons/cg";
import { CgGenderMale } from "react-icons/cg";
import { FaTransgender } from "react-icons/fa";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
// import StarsCanvas from "../ui/StartsCanvas";
import SmoothScrolling from "./SmoothScrolling";
import { useQuery } from "@tanstack/react-query";
import { CategoryInfoRecord, fetchAllCategories } from "../CategoryManagment/components";
import VideoPreview from "./Hero.VideoPreview";
import { LenisRef } from "lenis/react";
import { MdArrowCircleDown } from "react-icons/md";
gsap.registerPlugin(ScrollTrigger);

export function Categories() {
  // Images to apply in the center
  const imagesTrail: string[] = [
    "/Images/Categories/General/CenterPlayer.png",
    "/Images/Categories/General/LeftPlayer.png",
    "/Images/Categories/General/LeftPlayer2.png",
    "/Images/Categories/General/RightPlayer.png",
  ];
  // Define your categories and corresponding video sources

  // Fetch categories from React Query cache
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<CategoryInfoRecord[]>({
    queryKey: ["allCategories"],
    queryFn: fetchAllCategories,
    select: (data: CategoryInfoRecord[]) =>
      data.map((category) => ({
        id: category.id,
        name: category.name,
        ageRange: category.ageRange,
        imageUrl: category.imageUrl, // ✅ Fixed: Include imageUrl in the mapping
      })),
    staleTime: 5 * 60 * 1000, // 5 minutes (better for performance than 0)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Helper function to get icon based on category name


  const lenisRef = useRef<LenisRef>(null);
  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
      console.log("updating scroll");
    }

    gsap.ticker.add(update);

    return () => gsap.ticker.remove(update);
  }, []);

  const pinnedSectionRef = useRef<HTMLDivElement | null>(null);
  const indicesContainerRef = useRef(null);
  const [currentActiveIndex, setCurrentActiveIndex] = useState(-1);

  // Function to show progress and indices
  const showProgressAndIndices = () => {
    gsap.to([indicesContainerRef.current], {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  // Function to hide progress and indices
  const hideProgressAndIndices = () => {
    gsap.to([indicesContainerRef.current], {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    });
    animateIndexOpacity(-1);
  };

  // Function to animate index opacity
  const animateIndexOpacity = (newIndex: number) => {
    if (newIndex !== currentActiveIndex) {
      const indices = Array.from(document.querySelectorAll(".index"));
      indices.forEach((index, i) => {
        gsap.to(index, {
          opacity: i === newIndex ? 1 : 0.25,
          // color: i === newIndex ? progressColors[newIndex] : "",
          textShadow: "20px 20px 10px #fff",
          duration: 0.5,
          ease: "power2.out",
          index,
        });
      });
      setCurrentActiveIndex(newIndex);
    }
  };

  useGSAP(
    () => {
      if (categories.length === 0) return;
      const clipAnimation = gsap.timeline({
        scrollTrigger: {
          start: "top top", // Start animation when the top of #hero hits the top of the viewport
          end: "bottom top", // End animation when the bottom of #hero hits the top of the viewport
          // markers: true, // Show markers for debugging
          scrub: 0.5, // Smoothly scrub through the animation on scroll
          pin: true, // Pin the #hero section while animating
        },
      });

      // Animate the .about element
      clipAnimation.to(".player", {
        opacity: 1,
      });

      const cards = Array.from(document.querySelectorAll(".cardCategory"));
      let totalHeight = 0;

      cards.forEach((card) => {
        const cardHeight = card.getBoundingClientRect().height;
        totalHeight += cardHeight;
      });

      const cardCount = cards.length;
      const startRotations = [0, 0, 0, 0];
      const endRotations = [10, -10, 20, -20];

      cards.forEach((card, index) => {
        gsap.set(card, { rotation: startRotations[index] });
      });

      if (!pinnedSectionRef.current) return;
      ScrollTrigger.create({
        trigger: pinnedSectionRef.current,
        start: "top top",
        end: `bottom top`,
        pin: true,
        onLeave: hideProgressAndIndices,
        onEnterBack: showProgressAndIndices,
        onUpdate: (self) => {
          const progress = self.progress * (cardCount + 1);
          const currentCard = Math.floor(progress);

          if (progress > 1) {
            showProgressAndIndices();
          } else if (progress <= 1) {
            hideProgressAndIndices();
          }

          if (progress > 1) {
            let colorIndex = Math.min(Math.floor(progress - 1), cardCount - 1);
            animateIndexOpacity(colorIndex);
          }

          cards.forEach((card, index) => {
            if (index < currentCard) {
              gsap.set(card, {
                rotation: endRotations[index],
                ease: "power1.in",
                opacity: 1,
              });
            } else if (index === currentCard) {
              const cardProgress = progress - currentCard;
              const newTop = gsap.utils.interpolate(150, 30, cardProgress);
              const newRotation = gsap.utils.interpolate(
                startRotations[index],
                endRotations[index],
                cardProgress
              );
              gsap.set(card, {
                top: `${newTop}%`,
                rotation: newRotation,
                opacity: progress,
              });
            } else {
              gsap.set(card, {
                top: "180%",
                rotation: startRotations[index],
              });
            }
          });
        },
      });
    },
    { dependencies: [categories] }
  );

  return (
    <SmoothScrolling>
      <div className=" canva w-full h-[1500px] pt-40">
        <section
          className="w-full h-full relative flex justify-center items-center z-[23]"
          ref={pinnedSectionRef}
        >
          <div className="w-full h-full absolute flex">
            <div className=" player xl:w-[1000px] xl:h-[1200px] sm:w-[700px] sm:h-[800px] w-[400px] h-[500px] relative filter drop-shadow-[10px_10px_15px_rgba(255,191,0,0.7)] opacity-0">
              <Image src={imagesTrail[0]} alt="" fill />
            </div>
          </div>
          <div className="flex h-[20%] w-[50%] relative">
            {categories.map((category, index) => {
             
              
              <div className="text-center mx-auto text-2xl opacity-40 ">SCROLL PARA ABAJO <MdArrowCircleDown /> </div>
              return (
                <VideoPreview
                  key={category.id}
                  className={clsx(
                    "cardCategory absolute h-[200px] w-[200px] md:w-[500px] md:h-[300px] top-[150%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 grid gap-6 border-2 ",
                    {
                      "border-[#c381d5]": category.name === "FEMENIL",
                      "border-[#05ff9b]": category.name !== "FEMENIL",
                      "border-[#5000a8]": category.name === "MIXTOS",
                    }
                  )}
                >
                  <div className="relative origin-scale-100 opacity-100 transition-all duration-500 ease-in w-full h-full flex items-center justify-center">
                    {/* <video
                      // src={category.videoSrc}
                      loop
                      muted
                      className="absolute origin-center scale-160 object-cover object-center h-full w-full"
                    /> */}

                    <Image
                      src={category.imageUrl}
                      alt={`${category.name} category image`}
                      fill
                      className="absolute origin-center scale-160 object-cover object-center h-full w-full"
                    />
                    <Link
                      className="left-1/2 transform -translate-x-1/2 absolute top-[20%] p-2 sm:text-sm text-[60px] font-semibold origin-center transition-all duration-500 ease-in
                      text-bg-main-black backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:scale-105 hover:translate-y-[-10px] "
                      href={`/Categories/${category.id}/teams`}
                    >
                      {"Ver Detalles " + category.name}
                    </Link>
                  </div>
                </VideoPreview>
              );
            })}
          </div>

          <div className="relative flex flex-col items-center justify-center w-[20%] h-full">
            <div
              className="indices absolute flex flex-col gap-8 h-[500px] top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 opacity-0 z-[23] font-burble  dark:shadow-none rounded-4xl dark:rounded-none"
              ref={indicesContainerRef}
            >
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="text-center opacity-25 index flex "
                >
                  <p
                    className="uppercase line-through sm:text-xs md:text-2xl flex items-center justify-center mr-2 filter dark:drop-shadow-[10px_10px_15px_rgba(255,191,0,0.7)] dark:border-2 dark:border-white text-bg-main-black dark:text-bg-main"
                    style={{
                      textShadow: "2px 12px 14px rgba(88, 232, 14, 0.5)", // Example text shadow
                    }}
                  >
                    {category.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </SmoothScrolling>
  );
}