// "use client";
// import clsx from "clsx";
// import React, { useState } from "react";

// type props = {
//     children?: React.ReactNode
//     className: string;
// }
// export const SideBar  = ( { className}:props) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleSidebar = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <div className={clsx(className,"")}>
//       {/* Sidebar */}
//       <div
//         className={`fixed inset-y-0 left-0 transform ${
//           isOpen ? "translate-x-0" : "-translate-x-full"
//         } transition-transform duration-300 ease-in-out bg-gray-800 text-white w-64`}
//       >
//         <div className="p-4">
//           <h2 className="text-2xl font-semibold">Sidebar</h2>
//           <nav className="mt-4">
//             <a
//               href="#"
//               className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
//             >
//               Home
//             </a>
//             <a
//               href="#"
//               className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
//             >
//               About
//             </a>
//             <a
//               href="#"
//               className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
//             >
//               Services
//             </a>
//             <a
//               href="#"
//               className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
//             >
//               Contact
//             </a>
//           </nav>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 min-h-screen bg-gray-100">
//         <header className="p-4 bg-white shadow">
//           <button
//             onClick={toggleSidebar}
//             className="text-gray-800 focus:outline-none"
//           >
//             {isOpen ? "Close Sidebar" : "Open Sidebar"}
//           </button>
//         </header>
//         <main className="p-4">{/* Your main content goes here */}</main>
//       </div>
//     </div>
//   );
// };
