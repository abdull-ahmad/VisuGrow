import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading..." }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm z-50"
    >
      <div className="relative">
        {/* Outer circle with gradient */}
        <motion.div 
          className="h-24 w-24 rounded-full border-4 border-transparent"
          style={{ 
            background: "linear-gradient(to right, transparent, transparent 50%, #053252 50%, #053252)",
            backgroundOrigin: "border-box",
            backgroundClip: "border-box",
            maskImage: "linear-gradient(#fff, #fff), linear-gradient(#fff, #fff)",
            maskComposite: "xor",
            maskClip: "content-box, border-box"
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner pulsing circle */}
        <motion.div 
          className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#053252] to-blue-400"
          animate={{ scale: [0.85, 1, 0.85], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Logo or icon in the center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <img 
            src="/Logo.png" 
            alt="VisuGrow" 
            className="object-fit"
          />
        </div>
      </div>
      
      {/* Loading message with typing effect */}
      <motion.p 
        className="mt-6 text-white font-poppins text-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
      
      {/* Animated dots */}
      <div className="flex space-x-1 mt-2">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="h-2 w-2 bg-blue-400 rounded-full"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: dot * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;