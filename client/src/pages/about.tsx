import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import logoImage from "@assets/madrasminigolf_mainlogo_1756276456473.png";
import { motion } from "framer-motion";
import { Play, Instagram, MapPin, ExternalLink, Settings } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

export default function About() {
  const [, navigate] = useLocation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Preload the logo image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = logoImage;
  }, []);

  // Update carousel selected index
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const instagramReels = [
    {
      id: "DPJXIIYj6Ii",
      embedUrl: "https://www.instagram.com/p/DPJXIIYj6Ii/embed/"
    },
    {
      id: "DPYM92niBR2",
      embedUrl: "https://www.instagram.com/p/DPYM92niBR2/embed/"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-cream to-green-100">
      {/* Admin Button */}
      <motion.div 
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Button 
          onClick={() => navigate("/admin")}
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-sm border-golf-green text-golf-green hover:bg-golf-green hover:text-white transition-all duration-300"
          data-testid="button-admin"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-32 lg:pb-20">
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center mb-6 md:mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {!imageLoaded && !imageError ? (
            <div className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-gradient-to-br from-golf-green/20 to-golf-light/20 rounded-lg animate-pulse flex items-center justify-center">
              <div className="text-golf-green/60 font-bold text-lg">Loading...</div>
            </div>
          ) : imageError ? (
            <div className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-gradient-to-br from-golf-green to-golf-light rounded-lg flex items-center justify-center">
              <div className="text-white font-bold text-2xl md:text-3xl text-center leading-tight">
                MADRAS<br />MINI GOLF
              </div>
            </div>
          ) : (
            <img 
              src={logoImage} 
              alt="Madras Mini Golf" 
              className={`w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain transition-opacity duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="eager"
              decoding="async"
            />
          )}
        </motion.div>

        {/* Description Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="mb-6 md:mb-8 shadow-lg">
            <CardContent className="p-6 md:p-8 lg:p-10">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-golf-green mb-4 md:mb-6 text-center">
                Welcome to Madras Mini Golf!
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
                Madras Mini Golf brings fun, laughter, and a touch of challenge right to the heart of Chennai! 
                Whether you're with friends, family, or on a casual date, our 7-hole course is designed for all 
                ages to enjoy. Located in Besant Nagar, we offer a vibrant mix of entertainment, friendly 
                competition, and unforgettable memories. Come swing, score, and smile – your perfect leisure 
                spot awaits at Madras Mini Golf!
              </p>
              
              {/* Location */}
              <div className="mt-6 md:mt-8 flex items-center justify-center text-golf-green">
                <MapPin className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                <span className="font-medium text-base md:text-lg">Besant Nagar, Chennai</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Instagram Profile Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-6 md:mb-8 max-w-2xl mx-auto"
        >
          <a 
            href="https://www.instagram.com/mmg.madras?igsh=MW04eWtlb2hna29lZg=="
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-instagram-profile"
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500">
              <CardContent className="p-4 md:p-5 flex items-center justify-between">
                <div className="flex items-center text-white">
                  <Instagram className="h-6 w-6 md:h-7 md:w-7 mr-3" />
                  <div>
                    <p className="font-bold text-lg md:text-xl">Follow us on Instagram</p>
                    <p className="text-sm md:text-base opacity-90">@mmg.madras</p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </CardContent>
            </Card>
          </a>
        </motion.div>

        {/* Instagram Reels - Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-8 max-w-3xl mx-auto"
        >
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-golf-green mb-6 md:mb-8 text-center">
            Watch Our Latest Reels
          </h2>
          
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {instagramReels.map((reel, index) => (
                  <div 
                    key={reel.id} 
                    className="flex-[0_0_100%] min-w-0 px-4"
                    data-testid={`instagram-reel-${index + 1}`}
                  >
                    <Card className="shadow-lg overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative w-full" style={{ paddingBottom: '125%' }}>
                          <iframe
                            src={reel.embedUrl}
                            className="absolute top-0 left-0 w-full h-full border-0"
                            scrolling="no"
                            allow="encrypted-media"
                            title={`Instagram Reel ${index + 1}`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {instagramReels.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    selectedIndex === index 
                      ? 'bg-golf-green w-6' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  data-testid={`carousel-dot-${index + 1}`}
                  aria-label={`Go to reel ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Start Game Button */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-40"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="max-w-2xl mx-auto">
          <Button 
            onClick={() => {
              sessionStorage.removeItem("registrationFormData");
              navigate("/game");
            }}
            size="lg"
            className="w-full md:w-auto md:min-w-[400px] md:mx-auto md:flex bg-golf-green hover:bg-golf-light text-white font-bold py-6 md:py-7 px-8 md:px-12 rounded-full text-xl md:text-2xl shadow-lg transform hover:scale-105 transition-all duration-300"
            data-testid="button-start-game"
          >
            <Play className="mr-3 h-6 w-6 md:h-7 md:w-7" />
            Start Game
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
