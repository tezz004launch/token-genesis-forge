
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onFinished: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinished }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(onFinished, 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-black to-crypto-dark overflow-hidden"
      animate={{ opacity: isLoading ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Stars background */}
      <div className="absolute inset-0">
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.2, 1],
            opacity: 1,
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 1.5,
            times: [0, 0.4, 0.8, 1],
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1
          }}
          className="w-32 h-32 mb-6"
        >
          <div className="relative w-full h-full">
            {/* Enhanced glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-crypto-purple via-crypto-blue to-crypto-green opacity-60 blur-lg animate-pulse-glow"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-crypto-purple via-crypto-blue to-crypto-green opacity-30 blur-xl animate-pulse"></div>
            
            {/* Logo container with glass effect */}
            <div className="relative w-full h-full flex items-center justify-center rounded-full bg-crypto-dark/80 backdrop-blur-sm border-2 border-crypto-purple animate-float">
              <span className="text-5xl font-bold infinity-gradient-text drop-shadow-[0_0_10px_rgba(153,69,255,0.5)]">∞</span>
            </div>
          </div>
        </motion.div>

        {/* Title with enhanced animation */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-crypto-purple via-crypto-blue to-crypto-green mb-8"
        >
          Infinity Launch
        </motion.h1>

        {/* Enhanced progress bar */}
        <div className="relative w-48">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: isLoading ? ["0%", "100%"] : "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-1 bg-gradient-to-r from-crypto-purple via-crypto-blue to-crypto-green rounded-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-crypto-purple via-crypto-blue to-crypto-green opacity-20 blur-sm rounded-full" />
        </div>

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-4 text-crypto-light text-sm"
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
