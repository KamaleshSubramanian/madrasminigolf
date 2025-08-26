import { motion } from "framer-motion";

export default function GolfAnimation() {
  return (
    <div className="mb-8 relative flex items-center justify-center">
      {/* Golf ball with animation */}
      <motion.div
        className="text-8xl"
        animate={{
          x: [0, 10, 20, 10, 0],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        ⛳
      </motion.div>
      
      {/* Flag with wave animation */}
      <motion.div
        className="text-6xl absolute top-0 right-1/3"
        animate={{
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "bottom left" }}
      >
        🚩
      </motion.div>
    </div>
  );
}
