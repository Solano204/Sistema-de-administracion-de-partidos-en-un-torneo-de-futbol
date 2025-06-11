// styles.js
export const formContainer = `
  flex dark:bg-main-dark bg-main-light flex-col items-center justify-center w-full min-h-screen p-4 gap-9
`;

export const formCard = `
  w-[80%] h-[600px] min-h-[400px] flex flex-col bg-card-light dark:bg-transparent rounded-lg p-4 md:p-6 relative shadow-lg border-2
`;

export const formHeader = `
  text-xl md:text-2xl font-bold dark:text-neutral-400 text-bg-semicard-light
`;

export const labelStyles = `
  block text-xs md:text-sm font-medium dark:text-neutral-400 text-bg-semicard-light mb-1 md:mb-2
`;

export const inputBaseStyles = `
  block w-full px-3 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-xl md:rounded-2xl 
  dark:text-zinc-200 text-zinc-700 backdrop-blur-lg 
  bg-gradient-to-tr from-transparent via-[rgba(121,121,121,0.16)] to-transparent 
  shadow hover:shadow-[#000000] duration-700 focus:ring-0 focus:outline-none 
  border border-gray-500 dark:border-gray-600
`;

export const buttonBaseStyles = `
  flex items-center px-3 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-xl md:rounded-2xl 
  backdrop-blur-lg bg-gradient-to-tr from-transparent via-[rgba(121,121,121,0.16)] to-transparent 
  shadow hover:shadow-zinc-400 dark:hover:shadow-zinc-700 duration-300 focus:ring-0 focus:outline-none
  transition-all transform hover:scale-[1.02] active:scale-[0.98]
  border border-zinc-300/50 dark:border-zinc-600/50
  relative overflow-hidden
`;
export const buttonBaseStylesCustom = `
    flex items-center px-3 py-1 md:px-4 md:py-2 text-sm md:text-base  duration-300  
  transition-all transform hover:scale-[1.02] active:scale-[0.98]
  relative overflow-hidden w-full h-full
`;

export const cancelButtonStyles = `
  ${buttonBaseStyles} 
  text-zinc-700 dark:text-zinc-200 
  hover:text-zinc-200 dark:hover:text-zinc-900
  hover:bg-gradient-to-tr hover:from-red-500/20 hover:to-red-600/40
  dark:hover:bg-gradient-to-tr dark:hover:from-red-700/30 dark:hover:to-red-800/50
  after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8),_transparent] 
  after:opacity-0 hover:after:opacity-10 after:transition-opacity after:duration-300
`;

export const submitButtonStyles = `
  ${buttonBaseStyles} 
  text-[#5cb300] dark:text-[#92dd0d] 
  hover:text-[#4a8f00] dark:hover:text-[#8ee80e]
 dark:hover:to-green-800/50
  after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8),_transparent] 
  after:opacity-0 hover:after:opacity-10 after:transition-opacity after:duration-300
`;
export const moreButtonStyles = `
  ${buttonBaseStyles} 

  text-[#5cb300] dark:text-[#92dd0d] 
  hover:text-[#4a8f00] dark:hover:text-[#8ee80e]
 dark:hover:to-green-800/50
  after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8),_transparent] 
  after:opacity-0 hover:after:opacity-10 after:transition-opacity after:duration-300
`;

// Example usage:
export const formGrid = `
  grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4
`;

export const scrollContainer = `
  flex-grow pr-1 md:pr-2
`;

export const formContent = `
  space-y-3 md:space-y-4
`;
