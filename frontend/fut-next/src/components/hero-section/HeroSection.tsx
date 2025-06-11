"use client";
// hero-section/HeroSection.tsx

import { HeroSectionContainer, HeroSectionRightPanel } from './index';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, scale: 1 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: 1.5,
            ease: [0.16, 1, 0.3, 1],
            staggerChildren: 0.2,
            delayChildren: 0.3,
          },
        },
      }}
      className="relative w-screen h-screen  bg-transparent  "
    >
      {/* Background with subtle gradient */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.8 } },
        }}
        className="absolute w-screen h-screen z-0 bg-transparent"
        // style={{
        //   background:
        //     "radial-gradient(circle at 70% 30%, rgba(163, 237, 149, 0.1) 0%, rgba(235, 194, 61, 0.05) 50%, rgba(0,0,0,1) 100%)",
        // }}
      />

      <div className="relative z-10 w-full h-full p-6 flex">
        {/* Main card container */}
        <HeroSectionContainer />
        {/* Right panel */}
        <HeroSectionRightPanel />
      </div>
    </motion.div>
  );
};

export default HeroSection;
