"use client";
import { ReactNode, useEffect, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { DarkMode } from "./Bar.DarkMode";
import { DropdownMenu } from "./Bar.Desplegable";
import { UserIcon } from "./Bar.UserIcon";
import {
  getAuthUser,
  getAuthUserAdmin,
  getPhotoUser,
} from "@/app/utils/Domain/AuthenticationActions/AuthUser";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";

interface SidebarLink {
  type: "link";
  name: string;
  href: string;
  allow: "admin" | "user" | "all";
  icon?: string;
}

interface SidebarComponent {
  type: "component";
  component: ReactNode;
  allow: "admin" | "user" | "all";
  isLogo?: boolean;
}

type SidebarItem = SidebarLink | SidebarComponent;

export const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [urlImage, setUrlImage] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getAuthUser();
        const adminStatus = await getAuthUserAdmin();
        const imageUrl = userData?.idUser ? await getPhotoUser() : "";
        
        setIsAdmin(adminStatus);
        setUrlImage(imageUrl);
        setSessionActive(!!(userData?.idUser && userData?.token));
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const sidebarItems: SidebarItem[] = [
    {
      type: "component",
      component: (
        <Link className="flex items-center gap-2" href="/Soccer">
          <UserIcon className="w-8 h-8 md:w-10 md:h-10" imageUrl="/Images/logo.png" />
          <span className="text-black dark:text-white font-bold text-sm hidden md:block bg-clip-text">
            Juguar
          </span>
        </Link>
      ),
      isLogo: true,
      allow: "all",
    },
    {
      type: "link",
      name: "Categorias",
      href: "/Soccer/Categories",
      icon: "🏆",
      allow: "user",
    },
    {
      type: "link",
      name: "Agenda",
      href: "/agenda",
      icon: "🏆",
      allow: "user",
    },
    {
      type: "link",
      name: "Administracion",
      href: "/AdminDasboard/Admin",
      icon: "⚙️",
      allow: "admin",
    },
    {
      type: "component",
      allow: "all",
      component: <DarkMode className="h-6 w-6 md:h-8 md:w-8" />,
    },
    {
      type: "component",
      allow: "all",
      component: (
        <DropdownMenu
          className="flex h-full"
          isUserSession={sessionActive}
          photo={sessionActive ? urlImage : ""}
        />
      ),
    },
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
 
   const handleNavigation = (path: string) => (e: { preventDefault: () => void; }) => {
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
 

  const filteredSidebarItems = sidebarItems.filter((item) => {
    if (item.allow === "all") return true;
    if (item.allow === "admin" && isAdmin) return true;
    if (item.allow === "user" && sessionActive) return true;
    return false;
  });

  const logoItem = filteredSidebarItems.find(item => item.type === "component" && item.isLogo);
  const linkItems = filteredSidebarItems.filter(item => item.type === "link");
  const componentItems = filteredSidebarItems.filter(item => item.type === "component" && !item.isLogo);

  if (isLoading) {
    return (
      <header className="fixed top-2 md:top-4 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[90%] lg:w-[80%] xl:w-[70%] z-50">
        <div className="font-burble">
          <nav
            className={clsx(
              "flex items-center justify-between px-2 md:px-4 py-2 rounded-xl",
              "bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg",
              "border border-gray-200/30 dark:border-gray-700/30",
              "shadow-lg transition-all duration-300"
            )}
          >
            {/* Loading skeleton */}
            <div className="animate-pulse flex space-x-4 w-full">
              <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-8 w-8 md:h-10 md:w-10"></div>
              <div className="flex-1 space-y-2 hidden md:block">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
              <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-6 w-6 md:h-8 md:w-8"></div>
            </div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-2 md:top-4 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[90%] lg:w-[80%] xl:w-[70%] z-50">
      <div className="font-burble">
        <nav
          className={clsx(
            "flex items-center justify-between px-2 md:px-4 py-2 rounded-xl",
            "bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg",
            "border border-gray-200/30 dark:border-gray-700/30",
            "shadow-lg transition-all duration-300"
          )}
        >
          {/* Logo */}
          {logoItem?.type === "component" && (
            <div className="flex-shrink-0">
              {logoItem.component}
            </div>
          )}

          {/* Navigation Links - Hidden on mobile, visible on larger screens */}
          <div className="hidden md:flex items-center gap-4 md:gap-6 lg:gap-8 mx-auto">
            {linkItems.map((item, index) => (
              <Link
                key={index}
                href={(item as SidebarLink).href}
                onClick={handleNavigation((item as SidebarLink).href)}
                className={clsx(
                  "relative px-2 md:px-3 py-1 md:py-2 rounded-lg font-medium text-xs md:text-sm",
                  "text-gray-700 dark:text-gray-200",
                 
                )}
              >
                <span className="flex items-center gap-1">
                  {(item as SidebarLink).icon && <span>{(item as SidebarLink).icon}</span>}
                  {(item as SidebarLink).name}
                </span>
              </Link>
            ))}
          </div>

          {/* Mobile Navigation Links - Condensed into dropdown menu on mobile */}
          <div className="flex md:hidden ml-auto mr-2">
            <MobileMenu linkItems={linkItems} />
          </div>

          {/* Right-side components */}
          <div className="flex items-center gap-20 md:gap-25">
            {componentItems.map((item, index) => (
              <div key={index} className="flex items-center">
                {(item as SidebarComponent).component}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

// Mobile menu component remains the same
const MobileMenu = ({ linkItems }: { linkItems: SidebarItem[] }) => {
  const [isOpen, setIsOpen] = useState(false);

    
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
 
   const handleNavigation = (path: string) => (e: { preventDefault: () => void; }) => {
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
 
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (isOpen && !event.target.closest('.mobile-menu-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="mobile-menu-container relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-lg z-30
                        bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
                        border border-gray-200/50 dark:border-gray-700/50">
          <div className="py-1">
            {linkItems.map((item, index) => (
              item.type === "link" && (
                <Link
                  key={index}
                  href={(item as SidebarLink).href}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    "block px-4 py-2 text-sm",
                    "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <span className="flex items-center gap-2"
                  onClick={handleNavigation((item as SidebarLink).href )} >
                    {(item as SidebarLink).icon && <span>{(item as SidebarLink).icon}</span>}
                    {(item as SidebarLink).name}
                  </span>
                </Link>
              )
            ))}
            
          </div>
        </div>
      )}
    </div>
  );
};