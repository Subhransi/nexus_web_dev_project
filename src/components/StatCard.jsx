import React from 'react';
import { motion } from 'motion/react';

export default function StatCard({ icon: Icon, label, value, unit, color, delay }) {
  const colorClasses = {
    violet: {
      bg: 'from-violet-500/20 to-violet-600/10',
      border: 'border-violet-500/30',
      text: 'text-violet-400',
      shadow: 'rgba(139, 92, 246, 0.2)'
    },
    purple: {
      bg: 'from-purple-500/20 to-purple-600/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      shadow: 'rgba(168, 85, 247, 0.2)'
    },
    fuchsia: {
      bg: 'from-fuchsia-500/20 to-fuchsia-600/10',
      border: 'border-fuchsia-500/30',
      text: 'text-fuchsia-400',
      shadow: 'rgba(217, 70, 239, 0.2)'
    }
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`relative p-6 rounded-2xl bg-gradient-to-br ${colors.bg} backdrop-blur-xl border ${colors.border} overflow-hidden group`}
      style={{
        boxShadow: `0 10px 40px ${colors.shadow}`
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center mb-4 ${colors.text}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="mb-2 text-gray-400 text-sm">
          {label}
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-4xl text-white">
            {value}
          </span>
          <span className={`text-sm ${colors.text}`}>
            {unit}
          </span>
        </div>
      </div>

      <motion.div
        className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, ${colors.shadow} 0%, transparent 70%)`
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
}
