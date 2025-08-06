import { motion } from "framer-motion";

interface GolfLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function GolfLoader({ text = "Loading...", size = "md", className = "" }: GolfLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const ballSize = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  const textSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Golf Ball Animation */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Golf Course/Hole */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-2 bg-golf-green rounded-full opacity-60"></div>
          <div className="w-3 h-3 bg-gray-800 rounded-full mx-auto -mt-1"></div>
        </div>
        
        {/* Animated Golf Ball */}
        <motion.div
          className={`${ballSize[size]} bg-white border-2 border-gray-300 rounded-full absolute shadow-sm`}
          style={{
            background: "radial-gradient(circle at 30% 30%, #ffffff, #f0f0f0)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1), inset -1px -1px 2px rgba(0,0,0,0.1)"
          }}
          animate={{
            x: [-20, -10, 0, 10, 20, 10, 0, -10, -20],
            y: [0, -8, -16, -8, 0, -6, -12, -6, 0],
            rotate: [0, -90, -180, -270, -360, -450, -540, -630, -720]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Golf Club Animation */}
        <motion.div
          className="absolute -right-6 bottom-2 origin-bottom-right"
          animate={{
            rotate: [-15, 25, -15]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.3, 1]
          }}
        >
          <div className="w-0.5 h-8 bg-amber-700 rounded"></div>
          <div className="w-3 h-1.5 bg-gray-400 rounded-sm -mt-0.5 ml-0.5 shadow-sm"></div>
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
}