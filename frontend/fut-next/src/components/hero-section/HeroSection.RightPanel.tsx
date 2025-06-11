// Hero-section/HeroSection.RightPanel.tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const slideInFromRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", damping: 10 } },
};

const HeroSectionRightPanel = () => {
  return (
    <motion.div
      variants={slideInFromRight}
      className="hidden xl:block w-[50%] h-full relative"
    >
      {/* Text container */}
      <div className="absolute top-20 left-20 w-[500px] h-[100px] z-0">
        <div className="relative p-2 w-full h-full text-black font-bold flex items-center justify-center rounded-2xl dark:text-white">
          ⚽ La Cancha del Fútbol Rápido ⚽ "Aquí se juega rápido, se suda la
          camiseta y se vive cada gol como una final. Turnos ágiles, partidos
          intensos y pura pasión por el balón. ¿Listo para pisar el césped?" 🔥
          Reserva. Juega. Gana. 🔥
          <div className="absolute inset-0 opacity-10 rounded-lg blur-3xl backdrop-blur-3xl" />
        </div>
      </div>

      {/* Circular gradient background */}
      <div
        className="absolute inset-0 z-0"
        // style={{
        //   background: `radial-gradient(circle at 70% 50%,
        //     rgba(235, 194, 61, 0.9) 0%,
        //     rgba(163, 237, 149, 0.7) 20%,
        //     transparent 100%)`,
        //   filter: "blur(20px)",
        // }}
      />

      {/* Image */}
      <motion.div
        variants={fadeIn}
        className="absolute top-0 left-0 w-full h-full z-10"
      >
        <Image
          src="/Images/Hero/player-back.png"
          alt="Player"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
    </motion.div>
  );
};

export default HeroSectionRightPanel;
