import { motion } from "framer-motion";
import { HeroSectionImageStack } from "./HeroSection.ImageStack";
import { FaFacebook, FaWhatsapp } from "react-icons/fa";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

export const HeroSectionDescription = () => (
  <motion.div className="w-full h-full lg:h-[20%] flex flex-col lg:flex-row items-center sm:items-start gap-10">
    <motion.div
      variants={itemVariants}
      className="p-9 lg:w-[70%] w-full h-[40%] lg:h-full font-stretch-condensed  flex flex-col items-center text-black text-[10px]  dark:text-white sm:text-3xl font-bold  justify-center gap-10 p relative  "
    >
      Contactanos
      <div className="absolute inset-0 opacity-10 rounded-lg blur-3xl backdrop-blur-3xl"/>
      <div className="flex  gap-2">
        <div className="backdrop-blur-sm hover:shadow-lg ">
          <FaWhatsapp />
        </div>
        <div>
          <FaFacebook />
        </div>
      </div>
    </motion.div>
    <motion.div
      variants={itemVariants}
      className="p-9 lg:w-[70%] w-full h-[40%] lg:h-full font-doc1 flex flex-col items-center justify-center"
    >
      <HeroSectionImageStack />
    </motion.div>
  </motion.div>
);
