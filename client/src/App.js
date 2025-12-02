
import React, { useState, useEffect } from 'react';
import './App.css';
import Timer from './components/Timer';
import Dashboard from './components/Dashboard';
import SessionHistory from './components/SessionHistory';
import SubjectManager from './components/SubjectManager';
import Settings from './components/Settings';
import axios from 'axios';

const API_URL = 'https://nexus-web-dev-project.onrender.com//api';

function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState(null);
  // Add timerLocked state for navigation lock
  const [timerLocked, setTimerLocked] = useState(false);

  useEffect(() => {
    loadSubjects();
    loadSessions();
    loadSettings();
    // eslint-disable-next-line
  }, []);

  // Apply theme based on settings.darkMode
  useEffect(() => {
    if (settings && settings.darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [settings]);

  const loadSubjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/subjects`);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await axios.get(`${API_URL}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const addSubject = async (subject) => {
    try {
      const response = await axios.post(`${API_URL}/subjects`, subject);
      setSubjects([response.data, ...subjects]);
      return response.data;
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error;
    }
  };

  const updateSubject = async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/subjects/${id}`, updates);
      setSubjects(subjects.map(s => s._id === id ? response.data : s));
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  };

  const deleteSubject = async (id) => {
    try {
      await axios.delete(`${API_URL}/subjects/${id}`);
      setSubjects(subjects.filter(s => s._id !== id));
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const addSession = async (session) => {
    try {
      const response = await axios.post(`${API_URL}/sessions`, session);
      setSessions([response.data, ...sessions]);
      loadSessions(); // Reload to update stats
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  };

  const deleteSession = async (id) => {
    try {
      await axios.delete(`${API_URL}/sessions/${id}`);
      setSessions(sessions.filter(s => s._id !== id));
      loadSessions(); // Reload to update stats
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await axios.put(`${API_URL}/settings`, newSettings);
      setSettings(response.data);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'timer':
        return <Timer subjects={subjects} addSubject={addSubject} addSession={addSession} settings={settings} setTimerLocked={setTimerLocked} />;
      case 'dashboard':
        return <Dashboard sessions={sessions} subjects={subjects} />;
      case 'history':
        return <SessionHistory sessions={sessions} subjects={subjects} deleteSession={deleteSession} />;
      case 'subjects':
        return <SubjectManager subjects={subjects} addSubject={addSubject} updateSubject={updateSubject} deleteSubject={deleteSubject} />;
      case 'settings':
        return <Settings settings={settings} updateSettings={updateSettings} />;
      default:
        return <Timer subjects={subjects} addSubject={addSubject} addSession={addSession} settings={settings} setTimerLocked={setTimerLocked} />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header fade-in">
        <h1>Study Sanctuary</h1>
        <p>Your Pomodoro companion</p>
      </header>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveTab('timer')}
        >
          <span className="material-icons">timer</span>
          <span>Timer</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          disabled={timerLocked && activeTab !== 'dashboard'}
        >
          <span className="material-icons">dashboard</span>
          <span>Dashboard</span>
          {timerLocked && activeTab !== 'dashboard' && <span className="material-icons lock-icon">lock</span>}
        </button>
        <button
          className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          disabled={timerLocked && activeTab !== 'history'}
        >
          <span className="material-icons">history</span>
          <span>History</span>
          {timerLocked && activeTab !== 'history' && <span className="material-icons lock-icon">lock</span>}
        </button>
        <button
          className={`nav-tab ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setActiveTab('subjects')}
          disabled={timerLocked && activeTab !== 'subjects'}
        >
          <span className="material-icons">label</span>
          <span>Subjects</span>
          {timerLocked && activeTab !== 'subjects' && <span className="material-icons lock-icon">lock</span>}
        </button>
        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          disabled={timerLocked && activeTab !== 'settings'}
        >
          <span className="material-icons">settings</span>
          <span>Settings</span>
          {timerLocked && activeTab !== 'settings' && <span className="material-icons lock-icon">lock</span>}
        </button>
      </nav>

      <main className="fade-in">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
