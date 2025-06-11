import { motion } from "framer-motion";

const title = "JAGUAR";
const colors = ["#ebc23d", "#a3ed95", "#ebc23d", "#a3ed95", "#ebc23d", "#a3ed95"];

const letterVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  }),
};

export const HeroSectionTitle = () => (
  <motion.div className="w-full h-[20%] flex flex-col items-center justify-center">
    <div className="flex">
      {title.split("").map((letter, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          className="xl:text-[130px] md:text-9xl text-5xl text-orange-700 font-title relative"
          whileHover={{
            color: colors[i],
            textShadow: `0 0 10px ${colors[i]}, 0 0 20px ${colors[i]}`,
            transition: { duration: 0.3 },
          }}
          style={{
            color: "white",
            transition: "color 0.3s, text-shadow 0.3s",
          }}
        >
          {letter}
          
        </motion.span>
      ))}
      
    </div>
  </motion.div>
);
