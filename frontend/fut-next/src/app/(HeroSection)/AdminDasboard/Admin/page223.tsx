// "use client"
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import clsx from 'clsx';
// import { RouteItem } from '@/components/common/types/hookTypeNavigation';

// // Demo image for all boxes
// const demoImage = "https://dxfjdqqppxfoobevbubc.supabase.co/storage/v1/object/public/fut-next-images/CategoriesImages/197a0ef7-6e5d-4ddd-b5fb-3674f3e35391-i7h85tf.jpg";

// // Define admin menu items
// const adminRoutes: RouteItem[] = [
//   { path: "/AdminDasboard/pagosArbitros", title: "Pagos", id: 1 },
//   { path: "/AdminDasboard/arbitros", title: "arbitros", id: 2 },
//   { path: "/AdminDasboard/categorias", title: "categorias", id: 3 },
//   { path: "/AdminDasboard/credentials", title: "Credentials", id: 4 },
//   { path: "/AdminDasboard/debts/players", title: "debts players", id: 5 },
//   { path: "/AdminDasboard/debts/teams", title: "debts teams", id: 6 },
//   { path: "/AdminDasboard/inscriptions", title: "inscriptions", id: 7 },
//   { path: "/AdminDasboard/users", title: "users", id: 8 },
//   { path: "/AdminDasboard/select", title: "torneos", id: 9 },
// ];
// const FloatingBoxes = () => {
//   const router = useRouter();
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [selectedBox, setSelectedBox] = useState<number | null>(null);
  
//   // Different animations for each box to create varied movement with 3D rotation
//   const animations = [
//     'animate-float-1',
//     'animate-float-2',
//     'animate-float-3',
//     'animate-float-4',
//     'animate-float-5',
//     'animate-float-6',
//     'animate-float-7',
//   ];

//   // Different sizes for variety
//   const sizes = [
//     'w-32 h-32 md:w-40 md:h-40',
//     'w-36 h-36 md:w-44 md:h-44',
//     'w-28 h-28 md:w-36 md:h-36',
//     'w-40 h-40 md:w-48 md:h-48',
//     'w-32 h-32 md:w-40 md:h-40',
//     'w-36 h-36 md:w-44 md:h-44',
//     'w-30 h-30 md:w-38 md:h-38',
//   ];

//   // Various colors for each box (for overlay and border)
//   const colors = [
//     'bg-gradient-to-br from-blue-500/70 to-blue-700/70 border-blue-400 dark:border-blue-600',
//     'bg-gradient-to-br from-pink-500/70 to-purple-700/70 border-pink-400 dark:border-pink-600',
//     'bg-gradient-to-br from-yellow-400/70 to-amber-600/70 border-yellow-300 dark:border-yellow-500',
//     'bg-gradient-to-br from-green-500/70 to-emerald-700/70 border-green-400 dark:border-green-600',
//     'bg-gradient-to-br from-purple-500/70 to-indigo-700/70 border-purple-400 dark:border-purple-600',
//     'bg-gradient-to-br from-red-500/70 to-rose-700/70 border-red-400 dark:border-red-600',
//     'bg-gradient-to-br from-indigo-500/70 to-blue-700/70 border-indigo-400 dark:border-indigo-600',
//   ];

//   // Different starting positions
//   const positions = [
//     'top-1/4 left-1/4',
//     'top-1/3 right-1/4',
//     'bottom-1/4 left-1/3',
//     'top-1/2 right-1/3',
//     'bottom-1/3 left-1/4',
//     'bottom-1/2 right-1/5',
//     'top-2/3 left-1/5',
//   ];

//   // Handle box click to navigate
//   const handleBoxClick = (index: number) => {
//     setSelectedBox(index);
//     setTimeout(() => {
//       router.push(adminRoutes[index].path);
//     }, 600);
//   };

//   // Toggle dark/light mode
//   const toggleTheme = () => {
//     setIsDarkMode(!isDarkMode);
//   };

//   // Add the animation keyframes to the document once on mount
//   useEffect(() => {
//     // Create a style element
//     const styleEl = document.createElement('style');
    
//     // Define the custom animation keyframes with 3D transforms
//     const keyframes = `
//       @keyframes float-1 {
//         0% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//         33% { transform: translate3d(10px, -15px, 20px) rotateX(10deg) rotateY(5deg) rotateZ(5deg); }
//         66% { transform: translate3d(-10px, 10px, -10px) rotateX(-5deg) rotateY(-10deg) rotateZ(-5deg); }
//         100% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//       }
      
//       @keyframes float-2 {
//         0% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//         25% { transform: translate3d(-15px, -10px, 15px) rotateX(-8deg) rotateY(10deg) rotateZ(-3deg); }
//         75% { transform: translate3d(15px, 10px, -20px) rotateX(12deg) rotateY(-15deg) rotateZ(3deg); }
//         100% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//       }
      
//       @keyframes float-3 {
//         0% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//         20% { transform: translate3d(15px, 5px, 25px) rotateX(15deg) rotateY(10deg) rotateZ(7deg); }
//         80% { transform: translate3d(-5px, -10px, -15px) rotateX(-10deg) rotateY(-5deg) rotateZ(-7deg); }
//         100% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//       }
      
//       @keyframes float-4 {
//         0% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//         30% { transform: translate3d(-10px, -15px, -20px) rotateX(-12deg) rotateY(-8deg) rotateZ(-5deg); }
//         60% { transform: translate3d(10px, 10px, 10px) rotateX(8deg) rotateY(12deg) rotateZ(5deg); }
//         100% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//       }
      
//       @keyframes float-5 {
//         0% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//         40% { transform: translate3d(12px, -8px, 18px) rotateX(5deg) rotateY(10deg) rotateZ(4deg); }
//         70% { transform: translate3d(-12px, 8px, -15px) rotateX(-12deg) rotateY(-5deg) rotateZ(-4deg); }
//         100% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//       }
      
//       @keyframes float-6 {
//         0% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//         35% { transform: translate3d(-14px, -12px, -22px) rotateX(-15deg) rotateY(-10deg) rotateZ(-6deg); }
//         65% { transform: translate3d(14px, 12px, 18px) rotateX(10deg) rotateY(15deg) rotateZ(6deg); }
//         100% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//       }
      
//       @keyframes float-7 {
//         0% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//         50% { transform: translate3d(10px, -10px, 25px) rotateX(15deg) rotateY(12deg) rotateZ(10deg); }
//         90% { transform: translate3d(-10px, 5px, -20px) rotateX(-8deg) rotateY(-15deg) rotateZ(-10deg); }
//         100% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
//       }
      
//       @keyframes pulse-glow {
//         0%, 100% { box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.5); }
//         50% { box-shadow: 0 0 30px 10px rgba(59, 130, 246, 0.7); }
//       }
      
//       .animate-float-1 {
//         animation: float-1 8s ease-in-out infinite;
//       }
      
//       .animate-float-2 {
//         animation: float-2 10s ease-in-out infinite;
//       }
      
//       .animate-float-3 {
//         animation: float-3 7s ease-in-out infinite;
//       }
      
//       .animate-float-4 {
//         animation: float-4 9s ease-in-out infinite;
//       }
      
//       .animate-float-5 {
//         animation: float-5 11s ease-in-out infinite;
//       }
      
//       .animate-float-6 {
//         animation: float-6 8.5s ease-in-out infinite;
//       }
      
//       .animate-float-7 {
//         animation: float-7 9.5s ease-in-out infinite;
//       }
      
//       .animate-pulse-glow {
//         animation: pulse-glow 2s ease-in-out infinite;
//       }
//     `;
    
//     styleEl.innerHTML = keyframes;
//     document.head.appendChild(styleEl);
    
//     // Clean up on unmount
//     return () => {
//       document.head.removeChild(styleEl);
//     };
//   }, []);

//   return (
//     <div 
//       className={clsx(
//         "relative w-full h-screen overflow-hidden perspective-1000 transition-colors duration-700",
//         isDarkMode 
//           ? "bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900" 
//           : "bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100"
//       )}
//     >
//       {/* Animated background particles */}
//       <div className="absolute inset-0 w-full h-full">
//         {[...Array(20)].map((_, i) => (
//           <div 
//             key={i}
//             className={clsx(
//               "absolute rounded-full opacity-20",
//               "animate-pulse-glow",
//               isDarkMode ? "bg-blue-500" : "bg-blue-300"
//             )}
//             style={{
//               width: `${Math.random() * 10 + 5}px`,
//               height: `${Math.random() * 10 + 5}px`,
//               top: `${Math.random() * 100}%`,
//               left: `${Math.random() * 100}%`,
//               animationDelay: `${Math.random() * 2}s`,
//               animationDuration: `${Math.random() * 4 + 3}s`
//             }}
//           />
//         ))}
//       </div>

//       {/* Theme toggle button */}
//       <button 
//         onClick={toggleTheme}
//         className={clsx(
//           "absolute top-4 right-4 z-30 p-3 rounded-full transition-all duration-300",
//           "backdrop-blur-md shadow-lg",
//           isDarkMode 
//             ? "bg-gray-800/60 text-white hover:bg-gray-700/60" 
//             : "bg-white/60 text-gray-800 hover:bg-gray-100/60"
//         )}
//       >
//         {isDarkMode ? (
//           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
//           </svg>
//         ) : (
//           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
//           </svg>
//         )}
//       </button>

//       {/* Responsive container with the floating boxes */}
//       <div className="relative w-full h-full max-w-7xl mx-auto px-4">
//         {/* Title overlay */}
//         <div className={clsx(
//           "relative z-10 flex flex-col h-[200px] items-center justify-center text-center",
//           "mb-8 backdrop-blur-sm rounded-xl p-6",
//           isDarkMode 
//             ? "text-white bg-slate-800/20" 
//             : "text-gray-800 bg-white/20"
//         )}>
//           <h1 className={clsx(
//             "text-4xl md:text-5xl font-bold mb-4",
//             "bg-clip-text text-transparent bg-gradient-to-r",
//             isDarkMode 
//               ? "from-blue-400 to-purple-400" 
//               : "from-blue-600 to-purple-600"
//           )}>
//             Admin Dashboard
//           </h1>
//           <p className={clsx(
//             "text-xl",
//             isDarkMode ? "text-blue-200" : "text-blue-700"
//           )}>
//             Select a module to manage
//           </p>
//         </div>

//         {/* Render the 7 boxes */}
//         {adminRoutes.map((route, index) => (
//           <div
//             key={index}
//             className={clsx(
//               "absolute rounded-xl backdrop-blur-sm",
//               sizes[index], 
//               positions[index], 
//               animations[index],
//               "transform transition-all duration-500 preserve-3d overflow-hidden",
//               "shadow-xl hover:shadow-2xl",
//               "border-2",
//               selectedBox === index 
//                 ? "scale-125 z-30" 
//                 : "hover:scale-110 hover:z-20",
//               selectedBox !== null && selectedBox !== index 
//                 ? "opacity-30 scale-90" 
//                 : "opacity-100",
//               "cursor-pointer"
//             )}
//             style={{ transformStyle: 'preserve-3d' }}
//             onClick={() => handleBoxClick(index)}
//           >
//             {/* Image as background */}
//             <div className="absolute inset-0 w-full h-full">
//               <img 
//                 src={demoImage} 
//                 alt={route.path}
//                 className="w-full h-full object-cover"
//               />
//             </div>
            
//             {/* Colored overlay with text */}
//             <div className={clsx(
//               "absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4",
//               "transition-all duration-300",
//               colors[index].includes('from') ? colors[index] : `${colors[index].split(' ')[0]}`
//             )}>
//               {/* <div className="text-3xl sm:text-4xl mb-2">{route.icon}</div> */}
//               <div className={clsx(
//                 "font-bold text-base sm:text-lg text-center mb-1",
//                 isDarkMode ? "text-white" : "text-white"
//               )}>
//                 {route.title}
//               </div>
//               <div className={clsx(
//                 "text-xs sm:text-sm text-center opacity-80",
//                 isDarkMode ? "text-blue-100" : "text-white"
//               )}>
//                 {/* {route.} */}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default FloatingBoxes;