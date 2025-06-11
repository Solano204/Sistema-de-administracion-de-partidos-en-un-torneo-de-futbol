// "use client";
// import React, { useState } from "react";
// import { CheckButton } from "../Metrics-Agend";
// import { IoIosCloseCircle } from "react-icons/io";
// import { Input } from "@/components/ui/Form";
// import clsx from "clsx";
// import { Button } from "./Result.Button";
// type ButtonProps = {
//   className: string;
//   title: string;
// };
// type props = {
//   children: React.ReactNode;
//   className: string;
//   propButton?: ButtonProps;
//   buttonExternal?: boolean;
// };
// export const Pop = ({
//   children,
//   className,
//   buttonExternal,
//   propButton,
// }: props) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const togglePopup = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <div className=" flex items-center justify-center relative w-full h-full overflow-auto">
//       {/* Button to toggle the popup */}

//       {!buttonExternal ? (
//         <div className="dark:border-[0.2px] dark:border-primary-color rounded-[15px]">
//           <CheckButton
//             onClick={togglePopup}
//             className="backdrop-blur-sm dark:backdrop-blur-none dark:bg-[#42383a] w-[100px] h-[30px] text-black dark:text-white"
//             title="Checar"
//           />
//         </div>
//       ) : (
//         <div className="w-full h-full flex items-center justify-center">
//           <Button
//             onClick={togglePopup}
//             className={clsx(propButton?.className, " text-black ")}
//             title="Pagar Arbitro"
//           />
//         </div>
//       )}

//       {/* Popup overlay and content */}
//       {isOpen && (
//         <div
//           className=" w-screen h-screen backdrop-blur-lg shadow-2xl fixed inset-0 flex items-center justify-center z-50 bg-[radial-gradient(circle,_hsla(0,_0%,_100%,_1)_11%,_hsla(0,_0%,_100%,_1)_39%,_hsla(0,_0%,_0%,_1)_62%,_hsla(0,_0%,_100%,_1)_100%)] dark:bg-[radial-gradient(circle,_hsla(111,_19%,_34%,_1)_0%,_hsla(0,_0%,_87%,_1)_0%,_hsla(0,_0%,_53%,_1)_2%,_hsla(0,_0%,_46%,_1)_16%,_hsla(0,_0%,_0%,_1)_78%)]"
//           onClick={togglePopup} // Close popup when clicking outside
//         >
//           <div
//             className=" w-full h-full  rounded-lg  transform transition-all duration-300 ease-in-out scale-95 opacity-0 flex flex-col    relative"
//             style={{
//               transform: isOpen ? "scale(1)" : "scale(0.95)",
//               opacity: isOpen ? 1 : 0,
//             }}
//             onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
//           >
//             <div className="w-full md:h-screen h-[50%]  flex   ">
//               {children}
//             </div>
//             <div className=" absolute top right-0  items-center justify-center w-[150px] h-[40px]  mb-10">
//               <CheckButton
//                 title="Close"
//                 logo={
//                   <IoIosCloseCircle className="icon transition-transform duration-300 ease-in-out group-hover:translate-x-[1.2em] group-hover:scale-110 group-hover:fill-white" />
//                 }
//                 onClick={togglePopup}
//                 className="  bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-center "
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
