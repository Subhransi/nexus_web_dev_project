import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PomodoroTimer from './components/PomodoroTimer';
import StudyLog from './components/StudyLog';
import Analytics from './components/Analytics';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    const pageVariants = {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    };

    const pages = {
      dashboard: <Dashboard setCurrentPage={setCurrentPage} />,
      timer: <PomodoroTimer />,
      log: <StudyLog />,
      analytics: <Analytics />
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {pages[currentPage]}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="flex min-h-screen">
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main className="flex-1 p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
