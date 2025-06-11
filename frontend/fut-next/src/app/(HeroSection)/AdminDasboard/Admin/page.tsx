"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LenisRef, ReactLenis, useLenis } from "lenis/react";
import { useGSAP } from "@gsap/react";

import { RouteItem } from "@/components/common/types/hookTypeNavigation";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useRevealer } from "@/components/common/hooks/hookNavigation";
import Image from "next/image";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);
const Page = () => {
  useRevealer();
  // Default routes if none are provided
  const defaultRoutes: RouteItem[] = [
    { path: "/AdminDasboard/partidos", title: "partidos", id: 9 },
    { path: "/AdminDasboard/categorias", title: "categorias", id: 3 },
    { path: "/AdminDasboard/inscriptions", title: "inscriptions", id: 7 },
    { path: "/AdminDasboard/select", title: "torneos", id: 9 },
    { path: "/AdminDasboard/pagosArbitros", title: "Pagos", id: 1 },
    { path: "/AdminDasboard/debts/players", title: "debts players", id: 5 },
    { path: "/AdminDasboard/debts/teams", title: "debts teams", id: 6 },
    { path: "/AdminDasboard/arbitros", title: "arbitros", id: 2 },
    { path: "/AdminDasboard/credentials", title: "Credentials", id: 4 },
    { path: "/AdminDasboard/users", title: "users", id: 8 },
  ];

  const lenisRef = useRef<LenisRef>(null);
  const container = useRef(null);

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
            duration: 0 - 1,
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
    { scope: container }
  );

  const router = useTransitionRouter();
  const pathName = usePathname();

  /// This animate the currentPage before all
  function animateTournamentStageTransition() {
    document.documentElement.animate(
      [
        {
          clipPath: "polygon(25% 75%, 75% 75%, 75% 75%, 25% 75%)",
        },
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        },
      ],
      {
        duration: 2000,
        easing: "cubic-bezier(0.8, 0, 0.1, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }

  const handleNavigation =
    (path: string) => (e: { preventDefault: () => void }) => {
      console.log(pathName);
      if (path === pathName) {
        e.preventDefault();
        return;
      }
      console.log(path);
      router.push(path, {
        onTransitionReady: animateTournamentStageTransition,
      });
    };

  return (
    <ReactLenis ref={lenisRef} root>
      <div className="revealer"></div>
      <div
        className="container transition-colors duration-300 w-full h-full "
        ref={container}
      >
        <section className="sticky-cards section-card  w-full ">
          <div className="cards-container w-full">
            {" "}
            *
            {defaultRoutes.map((route, index) => (
              <div
                key={index}
                className="card relative cursor-pointer group overflow-hidden transition-all duration-500"
                onClick={handleNavigation(route.path)}
              >
                {/* Dark overlay with hover effect */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300 z-10 rounded-xl" />

                {/* Tag number */}
                <div className="tag absolute top-4 left-4 bg-white dark:bg-gray-800 text-black dark:text-white px-3 py-1 rounded-full z-20 font-bold shadow-lg">
                  {index + 1}
                </div>

                {/* Title */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <h2 className="text-white text-3xl font-bold drop-shadow-lg text-center px-4 transform transition-transform duration-300 group-hover:scale-105">
                    {route.title}
                  </h2>
                </div>

                {/* Image with gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 dark:to-black/60 z-5 rounded-xl"></div>
                <Image
                  fill
                  src="https://dxfjdqqppxfoobevbubc.supabase.co/storage/v1/object/public/fut-next-images/CategoriesImages/Sub21Back.jpeg"
                  alt={route.title}
                  className="w-full h-full object-cover rounded-xl transform transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Global styles for cards */}
    </ReactLenis>
  );
};

export default Page;
