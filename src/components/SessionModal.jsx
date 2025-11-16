import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Star } from 'lucide-react';

export default function SessionModal({ sessionData, onClose }) {
  const [topic, setTopic] = useState('');
  const [productivity, setProductivity] = useState(3);

  const handleSave = () => {
    const session = {
      id: Date.now(),
      topic: topic || 'Untitled Session',
      duration: sessionData.duration,
      productivity,
      date: new Date().toISOString(),
      type: sessionData.type
    };

    const sessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
    sessions.push(session);
    localStorage.setItem('studySessions', JSON.stringify(sessions));

    // Trigger confetti effect
    createConfetti();

    onClose();
  };

  const createConfetti = () => {
    const confettiCount = 50;
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = ['#8b5cf6', '#a78bfa', '#c084fc', '#e879f9', '#06b6d4'][Math.floor(Math.random() * 5)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.opacity = '1';
      confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      container.appendChild(confetti);

      const duration = 2000 + Math.random() * 1000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
          confetti.style.top = (progress * 100 + Math.sin(progress * 10) * 5) + '%';
          confetti.style.opacity = 1 - progress;
          requestAnimationFrame(animate);
        } else {
          confetti.remove();
        }
      };

      animate();
    }

    setTimeout(() => {
      container.remove();
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900/90 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-8 max-w-md w-full relative"
        style={{
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl">Session Complete!</h2>
            <p className="text-gray-400 text-sm">Great work focusing 🎉</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              What did you study?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., React Hooks, Mathematics..."
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 focus:border-violet-500/50 focus:outline-none transition-colors text-white placeholder-gray-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-3">
              How productive were you?
            </label>
            <div className="flex gap-3 justify-center">
              {[1, 2, 3, 4, 5].map((rating) => (
                <motion.button
                  key={rating}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setProductivity(rating)}
                  className={`transition-all duration-200 ${
                    rating <= productivity
                      ? 'text-violet-400'
                      : 'text-gray-600'
                  }`}
                >
                  <Star
                    className="w-8 h-8"
                    fill={rating <= productivity ? 'currentColor' : 'none'}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all duration-300"
              style={{
                boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)'
              }}
            >
              Save Session
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
            >
              Skip
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
