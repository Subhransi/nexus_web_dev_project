import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Star, Trash2, BookOpen, Coffee } from 'lucide-react';

export default function StudyLog() {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'pomodoro', 'break'

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const storedSessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
    setSessions(storedSessions.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const deleteSession = (id) => {
    const updatedSessions = sessions.filter(s => s.id !== id);
    localStorage.setItem('studySessions', JSON.stringify(updatedSessions));
    setSessions(updatedSessions);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredSessions = filter === 'all' 
    ? sessions 
    : sessions.filter(s => s.type === filter);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl mb-2 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
          Study Log
        </h1>
        <p className="text-gray-400">Track your learning journey</p>
      </motion.div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-xl transition-all duration-300 ${
            filter === 'all'
              ? 'bg-violet-500/20 text-violet-400 border-2 border-violet-500/50'
              : 'bg-gray-800/50 text-gray-400 hover:text-white border-2 border-transparent'
          }`}
        >
          All Sessions
        </button>
        <button
          onClick={() => setFilter('pomodoro')}
          className={`px-6 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
            filter === 'pomodoro'
              ? 'bg-violet-500/20 text-violet-400 border-2 border-violet-500/50'
              : 'bg-gray-800/50 text-gray-400 hover:text-white border-2 border-transparent'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Focus Sessions
        </button>
      </div>

      {filteredSessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl text-gray-400 mb-2">No sessions yet</h3>
          <p className="text-gray-500">Complete a focus session to see it here</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/30 hover:border-violet-500/30 transition-all duration-300"
                style={{
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        session.type === 'pomodoro'
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {session.type === 'pomodoro' ? (
                          <BookOpen className="w-5 h-5" />
                        ) : (
                          <Coffee className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg text-white">
                          {session.topic}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(session.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(session.date)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 ml-13">
                      <div className="text-sm">
                        <span className="text-gray-400">Duration: </span>
                        <span className="text-violet-400">{session.duration} min</span>
                      </div>
                      
                      {session.productivity && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">Productivity:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= session.productivity
                                    ? 'text-violet-400 fill-violet-400'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteSession(session.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors duration-300 p-2 rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>

                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-b-2xl"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 rounded-2xl bg-gray-800/30 backdrop-blur-xl border border-gray-700/30"
        >
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl text-violet-400 mb-1">
                {filteredSessions.length}
              </div>
              <div className="text-sm text-gray-400">Total Sessions</div>
            </div>
            <div>
              <div className="text-3xl text-purple-400 mb-1">
                {(filteredSessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">Hours Studied</div>
            </div>
            <div>
              <div className="text-3xl text-fuchsia-400 mb-1">
                {filteredSessions.length > 0
                  ? (filteredSessions.reduce((sum, s) => sum + (s.productivity || 0), 0) / filteredSessions.length).toFixed(1)
                  : 0}
              </div>
              <div className="text-sm text-gray-400">Avg Productivity</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
