import React from 'react';
import { motion } from 'motion/react';
import { Home, Timer, BookOpen, BarChart3 } from 'lucide-react';

export default function Navigation({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'timer', icon: Timer, label: 'Focus' },
    { id: 'log', icon: BookOpen, label: 'Study Log' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' }
  ];

  return (
    <nav className="w-20 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 flex flex-col items-center py-8 gap-8">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Timer className="w-6 h-6 text-white" />
        </div>
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className="relative group"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isActive
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Icon className="w-6 h-6" />
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 rounded-xl bg-violet-500/20 border-2 border-violet-500/50"
                  style={{
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
            <div className="absolute left-full ml-4 px-3 py-1 bg-gray-800 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
              {item.label}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
