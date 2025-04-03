
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onFinished: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinished }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time and then trigger the onFinished callback
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(onFinished, 1000); // Give animation time to complete before removing
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      animate={{ opacity: isLoading ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex flex-col items-center">
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
            ease: "easeInOut" 
          }}
          className="w-32 h-32 mb-6"
        >
          <div className="relative w-full h-full">
            {/* Token logo with glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-crypto-purple via-crypto-blue to-crypto-green opacity-60 blur-lg animate-pulse-glow"></div>
            <div className="relative w-full h-full flex items-center justify-center rounded-full bg-crypto-dark border-2 border-crypto-purple">
              <span className="text-5xl font-bold infinity-gradient-text">∞</span>
            </div>
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl md:text-2xl font-bold text-white"
        >
          Infinity Launch
        </motion.h1>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: isLoading ? ["0%", "100%"] : "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-crypto-purple via-crypto-blue to-crypto-green rounded-full mt-4 w-48"
        ></motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
