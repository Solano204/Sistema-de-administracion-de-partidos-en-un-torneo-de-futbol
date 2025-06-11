// "use client";
// import Image from "next/image";
// import React, { Suspense, useEffect, useMemo, useState } from "react"; // Import Suspense
// import { BlackBlur } from "@/components/Player/index";
// import {
//   motion,
//   useTransform,
//   AnimatePresence,
//   useMotionValue,
//   useSpring,
//   animate,
// } from "framer-motion";
// import clsx from "clsx";
// import { redirect } from "next/navigation";
// import { usePathname } from "next/navigation";
// import { Loadin } from "../common";

// type infoCircle = {
//   size?: string;
//   className?: string;
// };
// type Props = {
//   className?: string;
//   items: {
//     id: number;
//     name: string;
//     designation: string;
//     image: string;
//   }[];
//   infoCircle?: infoCircle;
// };

// export const AnimatedTooltip = ({ items, className, infoCircle }: Props) => {
//   const pathname = usePathname();
//   const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
//   const [loading, setLoading] = useState(true); // Add a loading state
//   const springConfig = { stiffness: 100, damping: 5 };
//   const x = useMotionValue(0);
//   const rotate = useSpring(
//     useTransform(x, [-120, 100], [-45, 45]),
//     springConfig
//   );
//   const translateX = useSpring(
//     useTransform(x, [-30, 100], [-50, 50]),
//     springConfig
//   );
//   const [selectedItemName, setSelectedItemName] = useState<string>("");
//   const [selectedItem, setSelectedItem] = useState<boolean>(false);

//   // Simulate loading delay (replace with actual data fetching logic)
//   useEffect(() => {
//     setLoading(false); // Set loading to false after a delay
//   }, []);

//   const handleMouseMove = (event: any) => {
//     const halfWidth = event.target.offsetWidth / 2;
//     x.set(event.nativeEvent.offsetX - halfWidth);
//   };

//   const handleLoadData = (
//     event: React.MouseEvent<HTMLButtonElement>,
//     itemName: string
//   ) => {
//     event.preventDefault();
//     setSelectedItem(true);
//     setSelectedItemName(itemName);
//     setHoveredIndex(null);
//     redirect(pathname + "/" + itemName);
//   };

//   const isOverlapping = (
//     a: { top: any; left: any },
//     b: { top: any; left: any },
//     size: number
//   ) => {
//     return !(
//       a.left + size < b.left ||
//       b.left + size < a.left ||
//       a.top + size < b.top ||
//       b.top + size < a.top
//     );
//   };

//   const generatePositions = (
//     numItems: number,
//     itemSize = 10,
//     maxAttempts = 100
//   ) => {
//     const positions: { top: number; left: number }[] = [];
//     for (let i = 0; i < numItems; i++) {
//       let attempts = 0;
//       let pos: { top: number; left: number };
//       do {
//         const top = Math.random() * (100 - itemSize);
//         const left = Math.random() * (100 - itemSize);
//         pos = { top, left };
//         attempts++;
//         const hasOverlap = positions.some((existing) =>
//           isOverlapping(existing, pos, itemSize)
//         );
//         if (!hasOverlap) break;
//       } while (attempts < maxAttempts);
//       positions.push(pos);
//     }
//     return positions;
//   };

//   const positions = useMemo(() => generatePositions(items.length, 10), [items]);

//   if (loading) {
//     return;
//     <div className="w-full h-full flex items-center justify-center">
//       <Loadin />
//     </div>;
//   }

//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <div className={clsx("w-full h-full", className)}>
//         {items.map((item, idx) => {
//           const { top, left } = positions[idx];
//           return (
//             <div
//               key={item.id}
//               className="absolute group flex items-center justify-center  z-[100]"
//               style={{ top: `${top}%`, left: `${left}%` }}
//               onMouseEnter={() => setHoveredIndex(item.id)}
//               onMouseLeave={() => setHoveredIndex(null)}
//             >
//               <AnimatePresence mode="popLayout">
//                 {hoveredIndex === item.id && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 20, scale: 0.6 }}
//                     animate={{
//                       opacity: 1,
//                       y: 0,
//                       scale: 1,
//                       transition: {
//                         type: "spring",
//                         stiffness: 290,
//                         damping: 10,
//                       },
//                     }}
//                     exit={{ opacity: 0, y: 20, scale: 0.6 }}
//                     style={{
//                       translateX: translateX,
//                       rotate: rotate,
//                       whiteSpace: "nowrap",
//                     }}
//                     className="absolute -top-[100px] -left-1/2 translate-x-1/2 flex flex-col items-center justify-center rounded-md z-50 shadow-xl px-4 py-2 h-[100px] border-2 border-green-500 bg-black text-xs"
//                   >
//                     <button
//                       className="uppercase font-black text-white relative z-30 text-base w-full h-full"
//                       onClick={(event) => handleLoadData(event, item.name)}
//                     >
//                       {item.name}
//                     </button>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               <Circle
//                 className={`relative animate-pulse z-2 ${
//                   infoCircle?.className || ""
//                 }`}
//               >
//                 <div
//                   className={clsx(
//                     "rounded-full flex items-center justify-center z-2"
//                   )}
//                   onMouseMove={handleMouseMove}
//                 >
//                   {item.image}
//                 </div>
//               </Circle>
//             </div>
//           );
//         })}
//       </div>
//     </Suspense>
//   );
// };

// const Circle = ({
//   className,
//   children,
// }: {
//   className?: string;
//   children: React.ReactNode;
// }) => {
//   return (
//     <div
//       className={clsx(
//         `rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)]
//     shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)] z-2
//     `,
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// };

// const Sparkles = () => {
//   const randomMove = () => Math.random() * 2 - 1;
//   const randomOpacity = () => Math.random();
//   const random = () => Math.random();
//   return (
//     <div className="absolute inset-0">
//       {[...Array(12)].map((_, i) => (
//         <motion.span
//           key={`star-${i}`}
//           animate={{
//             top: `calc(${random() * 100}% + ${randomMove()}px)`,
//             left: `calc(${random() * 100}% + ${randomMove()}px)`,
//             opacity: randomOpacity(),
//             scale: [1, 1.2, 0],
//           }}
//           transition={{
//             duration: random() * 2 + 4,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//           style={{
//             position: "absolute",
//             top: `${random() * 100}%`,
//             left: `${random() * 100}%`,
//             width: `2px`,
//             height: `2px`,
//             borderRadius: "50%",
//             zIndex: 1,
//           }}
//           className="inline-block bg-black dark:bg-white"
//         ></motion.span>
//       ))}
//     </div>
//   );
// };
