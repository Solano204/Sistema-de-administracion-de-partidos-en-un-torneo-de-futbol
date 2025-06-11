import React from "react";

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="  2xl:max-w-screen h-screen mx-auto w-full   2xl:px-8 2xl:py-8 xl:px-6 xl:py-6 lg:px-4 lg:py-4 md:px-2 md:py-2 sm:px-2 sm:py-2 ">
    {/* <div className="  2xl:max-w-screen h-screen mx-auto w-full  border-6 2xl:border-green-400 xl:border-cyan-300 lg:border-red-400 md:border-amber-200 sm:border-purple-400 2xl:px-8 2xl:py-8 xl:px-6 xl:py-6 lg:px-4 lg:py-4 md:px-2 md:py-2 sm:px-2 sm:py-2 z-[-1]"> */}
      {children}
    </div>
  );
};



