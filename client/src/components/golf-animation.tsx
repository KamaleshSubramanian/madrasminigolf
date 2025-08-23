import { motion } from "framer-motion";
import logoImage from "@/assets/madras-mini-golf-logo.png";

export default function GolfAnimation() {
  return (
    <div className="mb-8 relative flex items-center justify-center">
      {/* Logo with subtle animation */}
      <motion.img
        src={logoImage}
        alt="Madras Mini Golf Logo"
        className="w-80 md:w-96 h-auto"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1,
          ease: "easeOut",
        }}
      />
    </div>
  );
}
