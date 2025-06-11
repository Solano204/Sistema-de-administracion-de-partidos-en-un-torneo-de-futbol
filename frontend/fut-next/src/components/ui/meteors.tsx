// import { cn } from "@/lib/utils";
// import clsx from "clsx";
// import React from "react";

// export const Meteors = ({
//   number,
//   className,
// }: {
//   number?: number;
//   className?: string;
// }) => {
//   const meteors = new Array(number || 20).fill(true);
//   return (
//     <>
//       {meteors.map((el, idx) => (
//         <span
//           key={"meteor" + idx}
//           className={clsx(
//             "animate-meteor-effect  absolute top-0 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[0deg]",
//             "before:content-[''] before:absolute before:top-1/2 before:opacity-0 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent backdrop-blur-[8.2px]  rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] ",
//             className
//           )}
//           style={{
//             bottom: Math.floor(Math.random() * (400 - -400) + -400) + "px",
//             left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
//             animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
//             animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
//           }}
//         ></span>
//       ))}
//     </>
//   );
// };
