'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Briefcase } from 'lucide-react'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated Rings */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -inset-8 rounded-full bg-primary/20 blur-xl"
          />
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="h-20 w-20 rounded-full border-t-2 border-r-2 border-primary/40 border-l-2 border-l-transparent border-b-2 border-b-transparent"
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-primary/10 p-3 rounded-2xl text-primary"
            >
              <Briefcase className="h-8 w-8" />
            </motion.div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-1 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-black tracking-tight text-foreground"
          >
            Preparando tu experiencia
          </motion.p>
          <motion.div 
            className="flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
