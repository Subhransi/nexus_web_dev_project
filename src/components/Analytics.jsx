import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Award, BookOpen, Clock } from 'lucide-react';

export default function Analytics() {
  const [sessions, setSessions] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalHours: 0,
    avgProductivity: 0,
    longestStreak: 0
  });

  useEffect(() => {
    const storedSessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
    setSessions(storedSessions);
    processAnalytics(storedSessions);
  }, []);

  const processAnalytics = (sessions) => {
    // Weekly data for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const weekly = last7Days.map(dateStr => {
      const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
      const daySessions = sessions.filter(s => s.date.split('T')[0] === dateStr);
      const hours = daySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
      const avgProductivity = daySessions.length > 0
        ? daySessions.reduce((sum, s) => sum + (s.productivity || 0), 0) / daySessions.length
        : 0;

      return {
        day: dayName,
        hours: parseFloat(hours.toFixed(2)),
        productivity: parseFloat(avgProductivity.toFixed(2))
      };
    });

    setWeeklyData(weekly);

    // Subject/Topic data
    const subjectMap = {};
    sessions.forEach(session => {
      const topic = session.topic || 'Untitled';
      if (!subjectMap[topic]) {
        subjectMap[topic] = { topic, hours: 0, sessions: 0 };
      }
      subjectMap[topic].hours += session.duration / 60;
      subjectMap[topic].sessions += 1;
    });

    const subjects = Object.values(subjectMap)
      .map(s => ({
        ...s,
        hours: parseFloat(s.hours.toFixed(2))
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    setSubjectData(subjects);

    // Overall stats
    const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    const avgProductivity = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.productivity || 0), 0) / sessions.length
      : 0;

    setStats({
      totalSessions: sessions.length,
      totalHours: parseFloat(totalHours.toFixed(1)),
      avgProductivity: parseFloat(avgProductivity.toFixed(1)),
      longestStreak: calculateStreak(sessions)
    });
  };

  const calculateStreak = (sessions) => {
    if (sessions.length === 0) return 0;

    const dates = [...new Set(sessions.map(s => s.date.split('T')[0]))].sort();
    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-xl border border-violet-500/30 p-4 rounded-xl">
          <p className="text-gray-400 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const COLORS = ['#8b5cf6', '#a78bfa', '#c084fc', '#e879f9', '#06b6d4'];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl mb-2 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-400">Visualize your learning progress</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 backdrop-blur-xl border border-violet-500/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-violet-400" />
            </div>
            <div className="text-sm text-gray-400">Total Sessions</div>
          </div>
          <div className="text-3xl text-white">{stats.totalSessions}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl border border-purple-500/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-sm text-gray-400">Total Hours</div>
          </div>
          <div className="text-3xl text-white">{stats.totalHours}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-600/10 backdrop-blur-xl border border-fuchsia-500/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div className="text-sm text-gray-400">Avg Productivity</div>
          </div>
          <div className="text-3xl text-white">{stats.avgProductivity} / 5</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 backdrop-blur-xl border border-cyan-500/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-sm text-gray-400">Longest Streak</div>
          </div>
          <div className="text-3xl text-white">{stats.longestStreak} days</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/30"
        >
          <h2 className="text-xl mb-6 text-violet-400">Weekly Study Hours</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hours" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/30"
        >
          <h2 className="text-xl mb-6 text-purple-400">Productivity Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 5]} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="productivity"
                stroke="#a78bfa"
                strokeWidth={3}
                dot={{ fill: '#a78bfa', r: 6 }}
                activeDot={{ r: 8 }}
                fill="url(#lineGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/30"
        >
          <h2 className="text-xl mb-6 text-fuchsia-400">Most Studied Topics</h2>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ topic, hours }) => `${topic}: ${hours}h`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No data available
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-6 rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/30"
        >
          <h2 className="text-xl mb-6 text-cyan-400">Top 5 Subjects</h2>
          <div className="space-y-4">
            {subjectData.length > 0 ? (
              subjectData.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white">{subject.topic}</span>
                    <span className="text-gray-400">{subject.hours}h</span>
                  </div>
                  <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(subject.hours / subjectData[0].hours) * 100}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-20">
                Start studying to see your top subjects
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
