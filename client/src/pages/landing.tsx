import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import logoImage from "@assets/madrasminigolf_1755968122358_1755977982502.png";
import { motion } from "framer-motion";
import { Play, QrCode, Settings } from "lucide-react";
import { useState, useEffect } from "react";

export default function Landing() {
  const [, navigate] = useLocation();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload the logo image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = logoImage;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-cream to-green-100 flex items-center justify-center p-4 relative">
      {/* Admin Toggle Button */}
      {/* <motion.div
        className="absolute top-4 right-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Button
          onClick={() => navigate("/admin")}
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-sm border-golf-green text-golf-green hover:bg-golf-green hover:text-white transition-all duration-300"
        >
          <Settings className="mr-2 h-4 w-4" />
          Admin
        </Button>
      </motion.div> */}

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="mb-8 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: imageLoaded ? 1 : 0.3, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {!imageLoaded && (
            <div className="w-64 h-64 bg-golf-cream rounded-lg flex items-center justify-center animate-pulse">
              <div className="text-golf-green text-lg font-semibold">
                Loading...
              </div>
            </div>
          )}
          <img
            src={logoImage}
            alt="Madras Mini Golf"
            className={`w-64 h-64 object-contain transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0 absolute"
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>

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
