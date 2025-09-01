import { motion } from "framer-motion";
import golfBallImage from "@assets/ball_1756661874929.png";
import golfTeeImage from "@assets/Tpin_1756661874931.png";

interface GolfLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  overlay?: boolean;
}

export default function GolfLoader({ text = "Loading...", size = "md", className = "", overlay = false }: GolfLoaderProps) {
  const containerSize = {
    sm: "w-24 h-20",
    md: "w-40 h-32", 
    lg: "w-48 h-36"
  };

  const ballSize = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-18 h-18"
  };

  const teeSize = {
    sm: "w-14 h-24",
    md: "w-20 h-34",
    lg: "w-24 h-40"
  };

  const textSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  const loaderContent = (
    <div className={`flex flex-col items-center justify-center space-y-6 ${overlay ? 'relative z-50' : ''} ${className}`}>
      {/* Golf Ball Rolling Over Tee Animation */}
      <div className={`relative ${containerSize[size]} flex items-end justify-center`}>
        {/* Golf Tee - Fixed in center */}
        <div 
          className="absolute bottom-0"
          style={{
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <img
            src={golfTeeImage}
            alt="Golf Tee"
            className={`${teeSize[size]} object-contain`}
          />
        </div>
        
        {/* Animated Golf Ball - Dribbling on the tee */}
        <motion.div
          className="absolute"
          animate={{
            y: [0, -4, -8, -12, -8, -4, 0, 2, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            bottom: `${size === 'sm' ? '52px' : size === 'md' ? '76px' : '92px'}`,
            left: '5%',
            transform: 'translateX(-50%)'
          }}
        >
          <motion.img
            src={golfBallImage}
            alt="Golf Ball"
            className={`${ballSize[size]} object-contain mx-auto block`}
            animate={{
              rotate: [0, 15, 0, -15, 0, 10, 0, -10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))"
            }}
          />
        </motion.div>
      </div>

      {/* Loading Text with Golf Theme */}
      <div className="flex items-center space-x-2">
        <motion.span
          className={`${textSize[size]} text-golf-green font-medium`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.span>
        
        {/* Animated Dots */}
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-golf-green rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>

      {/* Golf-themed Progress Indicator */}
      <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-golf-green to-golf-light rounded-full"
          animate={{ width: ["0%", "100%", "0%"] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
}