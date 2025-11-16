import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Target, TrendingUp, Sparkles } from 'lucide-react';
import StatCard from './StatCard';

export default function Dashboard({ setCurrentPage }) {
  const [stats, setStats] = useState({
    totalHours: 0,
    completedPomodoros: 0,
    averageProductivity: 0
  });

  useEffect(() => {
    const sessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
    
    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const completedPomodoros = sessions.filter(s => s.type === 'pomodoro').length;
    const avgProductivity = sessions.length > 0
      ? (sessions.reduce((sum, s) => sum + (s.productivity || 0), 0) / sessions.length).toFixed(1)
      : 0;

    setStats({
      totalHours,
      completedPomodoros,
      averageProductivity: avgProductivity
    });
  }, []);

  const motivationalQuotes = [
    "The secret of getting ahead is getting started.",
    "Focus is the gateway to thinking clearly.",
    "Small progress is still progress.",
    "Your future is created by what you do today.",
    "Success is the sum of small efforts repeated daily."
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-5xl mb-3 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
          Welcome back, ready to focus?
        </h1>
        <p className="text-gray-400 italic opacity-70">
          "{randomQuote}"
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          icon={Clock}
          label="Total Study Hours"
          value={stats.totalHours}
          unit="hrs"
          color="violet"
          delay={0.1}
        />
        <StatCard
          icon={Target}
          label="Completed Pomodoros"
          value={stats.completedPomodoros}
          unit="sessions"
          color="purple"
          delay={0.2}
        />
        <StatCard
          icon={TrendingUp}
          label="Average Productivity"
          value={stats.averageProductivity}
          unit="/ 5"
          color="fuchsia"
          delay={0.3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex justify-center"
      >
        <button
          onClick={() => setCurrentPage('timer')}
          className="group relative px-12 py-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.05 }}
          />
          <div className="relative flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <span className="text-xl">Start Focus Session</span>
          </div>
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)'
            }}
            animate={{
              boxShadow: [
                '0 0 40px rgba(139, 92, 246, 0.6)',
                '0 0 60px rgba(139, 92, 246, 0.8)',
                '0 0 40px rgba(139, 92, 246, 0.6)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </button>
      </motion.div>
    </div>
  );
}
