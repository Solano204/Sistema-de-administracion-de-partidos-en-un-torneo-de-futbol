"use client";
import clsx from "clsx";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";

type Props = {
  className?: string;
};

export function Navbar({ className }: Props) {
  const pathname = usePathname() || ""; // Handle potential null value

  // Extract the dynamic segment (e.g., 'FEMENIL') from the pathname
  const pathSegments = pathname.split("/");
  const categoryId = pathSegments[2] || ""; // Ensure categoryId is defined

  // Define sidebar items with dynamic hrefs
  const sidebarItems = [
    { name: "Volver", href: `/Soccer/Categories` },
    // { name: "Metrics", href: `/Categories/${categoryId}/metrics` },
    { name: "Teams", href: `/Categories/${categoryId}/teams` },
    { name: "Positions", href: `/Categories/${categoryId}/positions` },
  ];

  
      
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
   
     const handleNavigation = (path: string) => (e : { preventDefault: () => void; }) => {
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
    <div className={clsx("font-semibold my-6 ", className)}>
      <ul className="flex w-full  items-center justify-center gap-4">
        {sidebarItems.map((item, index) => (
          <li key={index}>
            <Link
              href={item.href}
              onClick={handleNavigation(item.href)}
              className={clsx(
                "w-full flex items-center justify-start dark:transparent p-4 rounded-full sm:text-[20px] text-[20px] relative",
                {
                  // Apply the effect for specific sections (Metrics, Teams, Positions) and for the "Back" button
                  "   dark:outline-2 before:content-[''] before:z-[2] before:absolute md:before:w-[80%] before:w-[50%] before:h-1 before:rounded-full before:translate-y-1/3 before:translate-x-[-2px] before:bg-secondary-color before:dark:bg-secondary-color":
                    (item.name !== "Back" && pathname.startsWith(item.href)) || 
                    (item.name === "Back" && pathname === item.href),
                  "z-[20]":
                    item.name === "Back"
                      ? pathname !== item.href // Exact match for "Back"
                      : !pathname.startsWith(item.href), // Sub-path match for Metrics, Teams, Positions
                }
              )}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}