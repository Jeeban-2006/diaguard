import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center"
        >
          <Heart className="w-10 h-10 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
          DiaGuard AI
        </h2>
        
        <p className="text-gray-600">Loading 3D Environment...</p>
        
        <div className="mt-6 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
