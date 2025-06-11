"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { UserIcon } from "./Bar.UserIcon";
import { deleteCookie } from "@/app/utils/Domain/AuthenticationActions/AuthCookie";
import { FormContainer } from "../ui/Form";
import { useRouter } from "next/navigation";

type Props = {
  className: string;
  isUserSession: boolean;
  photo?: string;
};

export const DropdownMenu = ({ className, isUserSession, photo }: Props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const navigateToLogin = () => {
    router.push("/Authentication/Login");
    setIsDropdownOpen(false);

  };
  const navigateToSignup = () => {
    router.push("/Authentication/Signup");
    setIsDropdownOpen(false);

  };
  const navigateToProfile = () => {
    router.push("/Authentication/CHANGEINFORMATION");
    setIsDropdownOpen(false);

  };
  const navigateToChangePassword = () => {
    router.push("/Authentication/CHANGEPASSWORD");
    setIsDropdownOpen(false);

  };
  const navigateToChangeUsername = () => {
    router.push("/Authentication/CHANGEUSERNAME");
    setIsDropdownOpen(false);

  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={clsx(className, "relative")}>
      {/* Dropdown Trigger Button */}
      <button
        onClick={toggleDropdown}
        className={clsx(
          "flex items-center  relative justify-center rounded-full p-1",
          "transition-all duration-300 transform hover:scale-105",
          isUserSession && "ring-2 "
        )}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <UserIcon className="w-6 h-6 md:w-8 md:h-8 rounded-full" imageUrl={photo} />
      </button>

      {/* Dropdown Content */}
      <div
        className={clsx(
          "absolute right-0 mt-2 w-48 rounded-xl shadow-xl z-50 overflow-hidden",
          "transform transition-all duration-300 origin-top-right",
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md",
          "border border-gray-200/50 dark:border-gray-700/50",
          isDropdownOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 translate-y-2 pointer-events-none"
        )}
      >
        <div className="py-1">
          {!isUserSession ? (
            <div className="p-3 space-y-2">
              <Link
                  onClick={navigateToLogin}

                href="/Authentication/Login"
                className={clsx(
                  "block w-full px-4 py-2 text-sm text-center rounded-lg",
                 
                )}
              >
                Iniciar Session
              </Link>
              <Link
                href="/Authentication/Signup"
                onClick={navigateToSignup}
                className={clsx(
                  "block w-full px-4 py-2 text-sm text-center rounded-lg",
                 
                  "transition-all duration-200 transform hover:scale-[1.02]"
                )}
              >
                Cerrar Session
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="p-3 text-center">
                <div className="inline-flex mb-2 justify-center rounded-full border-2 border-black">
                  <UserIcon className="w-12 h-12 md:w-16 md:h-16 rounded-full" imageUrl={photo} />
                </div>
              </div>
              
              <div className="p-2">
                <button
                  onClick={navigateToProfile}
                  className={clsx(
                    "block w-full px-4 py-2 text-sm text-left rounded-lg",
                    "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60",
                    "transition-all duration-200"
                  )}
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Perfil
                  </span>
                </button>
              </div>
              <div className="p-2">
                <button
                  onClick={navigateToChangePassword}
                  className={clsx(
                    "block w-full px-4 py-2 text-sm text-left rounded-lg",
                    "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60",
                    "transition-all duration-200"
                  )}
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Cambiar password
                  </span>
                </button>
              </div>
              <div className="p-2">
                <button
                  onClick={navigateToChangeUsername}
                  className={clsx(
                    "block w-full px-4 py-2 text-sm text-left rounded-lg",
                    "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60",
                    "transition-all duration-200"
                  )}
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Cambiar username
                  </span>
                </button>
              </div>
              
              <div className="p-2">
                <FormContainer action={deleteCookie}>
                  <button
                    key="logout-button"
                    className={clsx(
                      "flex items-center w-full px-4 py-2 text-sm text-left rounded-lg",
                      "text-black dark:text-white hover:bg-gray-50 dark:hover:bg-red-900/20",
                      "transition-all duration-200"
                    )}
                  >
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </span>
                  </button>
                </FormContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};