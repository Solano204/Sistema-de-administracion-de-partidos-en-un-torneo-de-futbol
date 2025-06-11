"use client";

import { motion } from "framer-motion";
import { HeroSectionTitle } from "./HeroSection.Title";
import { HeroSectionDescription } from "./HeroSection.Description";
import { HeroSectionImageStack } from "./HeroSection.ImageStack";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
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
};


export const HeroSectionContainer = () => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={containerVariants}
    className="relative xl:w-[50%] w-full h-screen overflow-hidden"
  >
    {/* Background Gradient */}
    <motion.div
      className="absolute inset-0 w-full h-full  z-0"
      // style={{
      //   background:
      //     "radial-gradient(circle at 70% 30%, rgba(163, 237, 149, 0.1) 0%, rgba(235, 194, 61, 0.05) 50%, rgba(0,0,0,1) 100%)",
      // }}
    />

    {/* Main Content */}
    <div className="relative z-10 w-full h-full p-6 flex">
      <motion.div className="w-full h-full  overflow-hidden  flex  ">
        {/* Gradient applied only at the bottom for medium screens and larger */}
        <div
          className="absolute left-0 right-0 bottom-0 top-1/2 transform -translate-y-1/2 z-0  md:block xl:hidden"
          // style={{
          //   background: `radial-gradient(circle at 50% 50%, 
          // rgba(235, 194, 61, 0.9) 0%, 
          // rgba(163, 237, 149, 0.7) 30%, 
          // transparent 100%)`,
          //   filter: "blur(20px)",
          //   backgroundPosition: "center bottom", // Center the gradient at the bottom
          //   backgroundSize: "cover", // Ensure the gradient covers the whole area
          // }}
        />

        {/* Left Section */}
        <motion.div className="flex-1 px-12 h-full w-full  relative xl:mt-20">
          <div className="w-full h-full flex flex-col mt-20  overflow-hidden">
            <HeroSectionTitle />
            <HeroSectionDescription />
          </div>
        </motion.div>
      </motion.div>
    </div>
  </motion.div>
);
