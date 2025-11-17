import React, { useState, useEffect, useRef } from 'react';
import './Timer.css';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const Timer = ({ subjects, addSubject, addSession, settings }) => {
  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessionInProgress, setSessionInProgress] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [lastPauseTime, setLastPauseTime] = useState(null);

  // Session form
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [showNewSubjectForm, setShowNewSubjectForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#FF6B9D');

  // Todos
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [customTopicMode, setCustomTopicMode] = useState(false);

  // Rating popup
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [pendingRating, setPendingRating] = useState(3);

  const audioRef = useRef(null);

  // Update timer duration when mode/settings change
  useEffect(() => {
    if (settings && !isActive) {
      const duration = mode === 'work'
        ? settings.workDuration
        : mode === 'shortBreak'
        ? settings.shortBreakDuration
        : settings.longBreakDuration;
      setTimeLeft(duration * 60);
    }
  }, [settings, mode, isActive]);

  // Load todos
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const res = await axios.get(`${API_URL}/todos?completed=false`);
        setTodos(res.data || []);
      } catch (err) {
        console.error('Error loading todos:', err);
      }
    };
    loadTodos();
  }, []);

  // Timer complete logic
  const handleTimerComplete = React.useCallback(() => {
    if (settings && settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    if (mode === 'work') {
      // A work period finished. Increment completed count, stop the timer,
      // and show the productivity rating popup so the user can save the session.
      const newCompleted = completedSessions + 1;
      setCompletedSessions(newCompleted);
      // stop the timer and ask for rating immediately (restore previous UX)
      setIsActive(false);
      setShowRatingPopup(true);
      return; // don't auto-advance to break — wait for the user's rating/save
    } else {
      setMode('work');
    }

    const nextDuration = mode === 'work'
      ? (settings && (completedSessions + 1) % settings.sessionsBeforeLongBreak === 0 ? settings.longBreakDuration : settings.shortBreakDuration)
      : settings?.workDuration || 25;

    setTimeLeft((nextDuration || 25) * 60);
  }, [mode, completedSessions, settings]);

  // Countdown
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, handleTimerComplete]);

  const startTimer = () => {
    if (!selectedSubject || !topic.trim()) return alert('Please select a subject and enter a topic before starting!');
    setIsActive(true);
    setSessionInProgress(true);
    if (!studyStartTime) setStudyStartTime(Date.now());
  };

  const pauseTimer = () => { setIsActive(false); setLastPauseTime(Date.now()); };
  const resumeTimer = () => { setIsActive(true); if (lastPauseTime) { setTotalPausedTime(p => p + (Date.now() - lastPauseTime)); setLastPauseTime(null); } };

  const resetTimer = () => {
    setIsActive(false);
    setSessionInProgress(false);
    setCompletedSessions(0);
    setMode('work');
    setStudyStartTime(null);
    setTotalPausedTime(0);
    setLastPauseTime(null);
    setTimeLeft((settings?.workDuration || 25) * 60);
  };

  const stopAndRate = () => { if (completedSessions > 0) { setIsActive(false); setShowRatingPopup(true); } else resetTimer(); };

  const handleRatingSubmit = async () => {
    if (selectedSubject && topic.trim() && completedSessions > 0 && studyStartTime) {
      const totalTimeMs = Date.now() - studyStartTime - totalPausedTime;
      const totalMinutes = Math.round(totalTimeMs / 60000);
      try {
        await addSession({ subject: selectedSubject, topic: topic.trim(), todo: selectedTodoId || null, duration: totalMinutes, workSessions: completedSessions, productivityRating: pendingRating, notes: '' });
        if (selectedTodoId) {
          try { await markTodoCompleted(selectedTodoId); } catch (err) { console.error('Failed to mark todo after save', err); }
        }
      } catch (err) {
        console.error('Error saving session:', err);
      }
    }
    setShowRatingPopup(false); setPendingRating(3); resetTimer(); setSelectedTodoId(null);
  };

  const handleRatingCancel = () => { setShowRatingPopup(false); setPendingRating(3); resetTimer(); };

  const formatTime = (s) => { const m = Math.floor(s/60); const sec = s%60; return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`; };

  const handleAddNewSubject = async () => { if (!newSubjectName.trim()) return; try { const ns = await addSubject({ name: newSubjectName, color: newSubjectColor }); setSelectedSubject(ns._id); setNewSubjectName(''); setShowNewSubjectForm(false); } catch { alert('Error adding subject'); } };

  const addTodo = async () => { const text = newTodoText.trim(); if (!text) return; try { const res = await axios.post(`${API_URL}/todos`, { text }); setTodos([res.data, ...todos]); setNewTodoText(''); } catch (err) { console.error(err); alert('Could not add todo'); } };

  const markTodoCompleted = async (todoId) => { try { const res = await axios.put(`${API_URL}/todos/${todoId}`, { completed: true }); setTodos(todos.map(t => t._id === todoId ? res.data : t)); } catch (err) { console.error('Error marking todo', err); } };

  const handleSelectSuggestion = (todo) => { setTopic(todo.text); setSelectedTodoId(todo._id); setCustomTopicMode(false); };

  const progressPercentage = settings ? ((settings[mode === 'work' ? 'workDuration' : mode === 'shortBreak' ? 'shortBreakDuration' : 'longBreakDuration'] * 60 - timeLeft) / (settings[mode === 'work' ? 'workDuration' : mode === 'shortBreak' ? 'shortBreakDuration' : 'longBreakDuration'] * 60)) * 100 : 0;

  return (
    <div className="timer-container">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      <div className="paper-card timer-card">
        <div className="mode-indicator">
          <h3 className="current-mode">
            {mode === 'work' && <><span className="material-icons">work</span> Work Session</>}
            {mode === 'shortBreak' && <><span className="material-icons">coffee</span> Short Break</>}
            {mode === 'longBreak' && <><span className="material-icons">spa</span> Long Break</>}
          </h3>
        </div>

        <div className="timer-display">
          <div className="timer-circle" style={{ background: `conic-gradient(#FF6B9D ${progressPercentage}%, #F5E6D3 ${progressPercentage}%)` }}>
            <div className="timer-inner"><h2 className="time-text">{formatTime(timeLeft)}</h2></div>
          </div>
        </div>

        <div className="timer-info"><p className="sessions-count">Work sessions completed: {completedSessions}</p></div>

        <div className="timer-controls">
          {!sessionInProgress ? (
            <button className="btn btn-primary" onClick={startTimer} disabled={!selectedSubject || !topic.trim()}>
              <span className="material-icons">play_arrow</span><span>Start Session</span>
            </button>
          ) : (
            <>
              <button className={`btn ${isActive ? 'btn-warning' : 'btn-primary'}`} onClick={isActive ? pauseTimer : resumeTimer}>
                <span className="material-icons">{isActive ? 'pause' : 'play_arrow'}</span><span>{isActive ? 'Pause' : 'Resume'}</span>
              </button>
              <button className="btn btn-danger" onClick={stopAndRate}><span className="material-icons">stop</span><span>Stop & Reset</span></button>
            </>
          )}
        </div>
      </div>

      {!sessionInProgress && (
        <div className="paper-card session-form">
          <h3 className="section-title">Setup Your Study Session</h3>

          <div className="form-group">
            <label>Subject</label>
            {!showNewSubjectForm ? (
              <div className="subject-selector">
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                  <option value="">Select a subject...</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <button className="btn btn-secondary" onClick={() => setShowNewSubjectForm(true)} style={{ marginTop: '10px', width: '100%' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>add</span><span>Add New Subject</span>
                </button>
              </div>
            ) : (
              <div className="new-subject-form">
                <input type="text" placeholder="Subject name (e.g., Mathematics)" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} />
                <div className="color-picker-group"><label>Color</label><input type="color" value={newSubjectColor} onChange={e => setNewSubjectColor(e.target.value)} className="color-picker" /></div>
                <div className="button-group"><button className="btn btn-primary" onClick={handleAddNewSubject}>Save Subject</button><button className="btn btn-secondary" onClick={() => setShowNewSubjectForm(false)}>Cancel</button></div>
              </div>
            )}
          </div>

          {!showNewSubjectForm && (
            <>
              <div className="form-group">
                <label>Topic</label>
                <select value={selectedTodoId || (customTopicMode ? '__other__' : '__none__')} onChange={(e) => {
                  const v = e.target.value;
                  if (v === '__other__') { setCustomTopicMode(true); setTopic(''); setSelectedTodoId(null); }
                  else if (v === '__none__') { setCustomTopicMode(false); setTopic(''); setSelectedTodoId(null); }
                  else { const todo = todos.find(t => t._id === v); if (todo) { setTopic(todo.text); setSelectedTodoId(todo._id); setCustomTopicMode(false); } }
                }}>
                  <option value="__none__">Select a todo (or choose Other...)</option>
                  {todos.filter(t => !t.completed).slice(0,50).map(todo => <option key={todo._id} value={todo._id}>{todo.text}</option>)}
                  <option value="__other__">Other (type your topic)</option>
                </select>

                <input type="text" placeholder="What did you study? (e.g., Calculus - Integration)" value={topic} onChange={e => { setTopic(e.target.value); setSelectedTodoId(null); setCustomTopicMode(false); }} style={{ marginTop: '8px' }} />
              </div>

              <div className="ready-message"><p>Ready to start? Click "Start Session" above once you've entered your subject and topic.</p></div>

              <div className="paper-card todo-add-card" style={{ marginTop: '16px' }}>
                <h4 style={{ marginBottom: '8px' }}>Quick Todos</h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="text" placeholder="Add a quick todo (e.g., Finish exercise 3)" value={newTodoText} onChange={e => setNewTodoText(e.target.value)} style={{ flex: 1 }} />
                  <button className="btn btn-primary" onClick={addTodo}>Add</button>
                </div>

                {todos.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <strong>Suggestions:</strong>
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {todos.slice(0,6).map(t => (
                        <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: t.completed ? '#888' : undefined }}>{t.text}</span>
                          {!t.completed && <button className="btn btn-secondary small" onClick={() => markTodoCompleted(t._id)}>Done</button>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {showRatingPopup && (
        <div className="modal-overlay">
          <div className="modal-content paper-card">
            <h3 className="section-title">Rate Your Productivity</h3>
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>You completed {completedSessions} work session{completedSessions > 1 ? 's' : ''}!</p>

            <div className="rating-selector">
              <p style={{ marginBottom: '15px', textAlign: 'center' }}>How productive were you?</p>
              <div className="star-rating">
                {[1,2,3,4,5].map(star => (
                  <span key={star} className={`material-icons star ${pendingRating >= star ? 'filled' : ''}`} onClick={() => setPendingRating(star)} style={{ cursor: 'pointer', fontSize: '40px' }}>{pendingRating >= star ? 'star' : 'star_border'}</span>
                ))}
              </div>
              <p style={{ textAlign: 'center', marginTop: '10px', color: '#8B7765' }}>{pendingRating}/5</p>
            </div>

            <div className="button-group" style={{ marginTop: '30px' }}>
              <button className="btn btn-primary" onClick={handleRatingSubmit}>Submit Rating</button>
              <button className="btn btn-secondary" onClick={handleRatingCancel}>Skip</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Timer;

