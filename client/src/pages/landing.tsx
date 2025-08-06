import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import GolfAnimation from "@/components/golf-animation";
import { motion } from "framer-motion";
import { Play, QrCode, Settings } from "lucide-react";

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-cream to-green-100 flex items-center justify-center p-4 relative">
      {/* Admin Toggle Button */}
      <motion.div 
        className="absolute top-4 right-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Button 
          onClick={() => navigate("/admin/login")}
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-sm border-golf-green text-golf-green hover:bg-golf-green hover:text-white transition-all duration-300"
        >
          <Settings className="mr-2 h-4 w-4" />
          Admin
        </Button>
      </motion.div>

      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <GolfAnimation />
        
        {/* Title */}
        <motion.h1 
          className="text-5xl md:text-6xl text-golf-green mb-4 font-bold"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Madras Mini Golf
        </motion.h1>
        
        <motion.p 
          className="text-xl text-golf-dark mb-8 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Welcome to the ultimate mini golf experience! Ready to play?
        </motion.p>
        
        {/* Start Game Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Button 
            onClick={() => navigate("/register")}
            size="lg"
            className="bg-golf-green hover:bg-golf-light text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <Play className="mr-3 h-6 w-6" />
            Start Game
          </Button>
        </motion.div>
        
        {/* QR Code Info */}
        <motion.div 
          className="mt-8 text-sm text-golf-dark opacity-75"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <QrCode className="inline mr-2 h-4 w-4" />
          Scanned from QR Code
        </motion.div>
      </motion.div>
    </div>
  );
}
