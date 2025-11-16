import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';
import SessionModal from './SessionModal';

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const [showModal, setShowModal] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const intervalRef = useRef(null);

  const settings = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    setIsActive(false);
    
    if (mode === 'focus') {
      setSessionData({
        duration: settings.focus / 60,
        type: 'pomodoro'
      });
      setShowModal(true);
      setMode('break');
      setTimeLeft(settings.shortBreak);
    } else {
      setMode('focus');
      setTimeLeft(settings.focus);
    }

    // Play completion sound (optional)
    playNotificationSound();
  };

  const playNotificationSound = () => {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? settings.focus : settings.shortBreak);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? settings.focus : settings.shortBreak);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus' 
    ? 1 - (timeLeft / settings.focus)
    : 1 - (timeLeft / settings.shortBreak);

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);

  const modeColors = {
    focus: {
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      ring: 'stroke-violet-500',
      glow: 'rgba(139, 92, 246, 0.6)',
      text: 'text-violet-400'
    },
    break: {
      gradient: 'from-cyan-500 via-teal-500 to-emerald-500',
      ring: 'stroke-cyan-500',
      glow: 'rgba(6, 182, 212, 0.6)',
      text: 'text-cyan-400'
    }
  };

  const colors = modeColors[mode];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl mb-4 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
          Focus Session
        </h1>
        
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => switchMode('focus')}
            className={`px-6 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
              mode === 'focus'
                ? 'bg-violet-500/20 text-violet-400 border-2 border-violet-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:text-white border-2 border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Focus
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`px-6 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
              mode === 'break'
                ? 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:text-white border-2 border-transparent'
            }`}
          >
            <Coffee className="w-4 h-4" />
            Break
          </button>
        </div>
      </motion.div>

      <div className="flex justify-center items-center mb-12">
        <motion.div
          className="relative"
          animate={isActive ? {
            scale: [1, 1.02, 1]
          } : {}}
          transition={{
            duration: 2,
            repeat: isActive ? Infinity : 0,
            ease: 'easeInOut'
          }}
        >
          <svg width="320" height="320" className="transform -rotate-90">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={mode === 'focus' ? 'text-violet-500' : 'text-cyan-500'} stopColor="currentColor" />
                <stop offset="50%" className={mode === 'focus' ? 'text-purple-500' : 'text-teal-500'} stopColor="currentColor" />
                <stop offset="100%" className={mode === 'focus' ? 'text-fuchsia-500' : 'text-emerald-500'} stopColor="currentColor" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="12"
              fill="none"
            />
            
            <motion.circle
              cx="160"
              cy="160"
              r="140"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              filter="url(#glow)"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className={`text-6xl mb-2 ${colors.text}`}
              animate={isActive ? {
                scale: [1, 1.05, 1]
              } : {}}
              transition={{
                duration: 1,
                repeat: isActive ? Infinity : 0
              }}
            >
              {formatTime(timeLeft)}
            </motion.div>
            <div className="text-gray-400 text-sm uppercase tracking-wider">
              {mode === 'focus' ? 'Focus Time' : 'Break Time'}
            </div>
          </div>

          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: `0 0 60px ${colors.glow}`
              }}
              animate={{
                boxShadow: [
                  `0 0 60px ${colors.glow}`,
                  `0 0 80px ${colors.glow}`,
                  `0 0 60px ${colors.glow}`
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}
        </motion.div>
      </div>

      <div className="flex justify-center gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTimer}
          className={`px-8 py-4 rounded-xl bg-gradient-to-r ${colors.gradient} flex items-center gap-3 group relative overflow-hidden`}
          style={{
            boxShadow: `0 10px 40px ${colors.glow}`
          }}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isActive ? 'Pause' : 'Start'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetTimer}
          className="px-8 py-4 rounded-xl bg-gray-800/50 backdrop-blur-xl border-2 border-gray-700/50 flex items-center gap-3 hover:border-gray-600/50 transition-colors duration-300"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showModal && (
          <SessionModal
            sessionData={sessionData}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
