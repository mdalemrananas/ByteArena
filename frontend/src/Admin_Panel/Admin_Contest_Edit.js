import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaBars, FaHome, FaSearch, FaBell, FaCode, FaUserCircle,
  FaSignOutAlt, FaUpload, FaTrophy, FaListOl, FaTimes, FaUser, FaPlus, FaTrash, FaUsers, FaMedal
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import { getUserByFirebaseUid } from '../services/userService';
import './Admin_Dashboard.css';
import './Admin_Contest_Create.css';

const menuItems = [
  { key: 'home', name: 'Dashboard', icon: <FaHome className="menu-icon" /> },
  { key: 'users', name: 'User Management', icon: <FaUsers className="menu-icon" /> },
  { key: 'contests', name: 'Contests', icon: <FaTrophy className="menu-icon" /> },
  { key: 'problems', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaMedal className="menu-icon" /> },
  { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const AdminContestEdit = () => {
  const navigate = useNavigate();
  const { contestId } = useParams();
  const editContestId = contestId;

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState('contests');
  const isEditMode = Boolean(editContestId);

  const [formData, setFormData] = useState({
    title: '',
    title_description: '',
    description: '',
    rules: '',
    cover_image: '',
    registration_start: '',
    registration_end: '',
    prize_money: '',
    question_problem: '',
    contest_difficulty: 'medium',
    time_limit_qs: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const emptyQuestion = () => ({
    question_title: '',
    question_description: '',
    question_input: '',
    question_output: '',
    question_sample_input: '',
    question_sample_output: '',
  });
  const [contestQuestions, setContestQuestions] = useState([emptyQuestion()]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          displayName: currentUser.displayName || 'Admin',
          email: currentUser.email,
          photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'Admin'}&background=random`
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load contest data from Supabase if editing
  useEffect(() => {
    const loadContest = async () => {
      if (!editContestId) return;
      setLoading(true);
      setLoadError('');
      try {
        const { data, error } = await supabase
          .from('contests')
          .select('*')
          .eq('id', editContestId)
          .single();

        if (error) throw error;

        // datetime-local expects "YYYY-MM-DDTHH:mm"
        const toDateTimeLocal = (iso) => {
          if (!iso) return '';
          const d = new Date(iso);
          const pad = (n) => String(n).padStart(2, '0');
          const yyyy = d.getFullYear();
          const mm = pad(d.getMonth() + 1);
          const dd = pad(d.getDate());
          const hh = pad(d.getHours());
          const mi = pad(d.getMinutes());
          return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
        };

        setFormData({
          title: data.title || '',
          title_description: data.title_description || '',
          description: data.description || '',
          rules: data.rules || '',
          cover_image: data.cover_image || '',
          registration_start: toDateTimeLocal(data.registration_start),
          registration_end: toDateTimeLocal(data.registration_end),
          prize_money: data.prize_money === null || data.prize_money === undefined ? '' : String(data.prize_money),
          question_problem:
            data.question_problem === null || data.question_problem === undefined ? '' : String(data.question_problem),
          contest_difficulty: (data.contest_difficulty || 'medium').toLowerCase(),
          time_limit_qs:
            data.time_limit_qs === null || data.time_limit_qs === undefined ? '' : String(data.time_limit_qs),
        });

        const { data: questionsData, error: questionsError } = await supabase
          .from('contest_questions')
          .select('question_title, question_description, question_input, question_output, question_sample_input, question_sample_output')
          .eq('contest_id', editContestId)
          .order('question_created_at', { ascending: true });

        if (!questionsError && questionsData && questionsData.length > 0) {
          setContestQuestions(questionsData.map((q) => ({
            question_title: q.question_title || '',
            question_description: q.question_description || '',
            question_input: q.question_input || '',
            question_output: q.question_output || '',
            question_sample_input: q.question_sample_input || '',
            question_sample_output: q.question_sample_output || '',
          })));
        } else {
          setContestQuestions([emptyQuestion()]);
        }
      } catch (e) {
        console.error('Failed to load contest:', e);
        setLoadError(e?.message || 'Failed to load contest');
      } finally {
        setLoading(false);
      }
    };

    loadContest();
  }, [editContestId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleQuestionChange = (index, field, value) => {
    setContestQuestions((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addQuestion = () => {
    setContestQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (index) => {
    setContestQuestions((prev) => {
      if (prev.length <= 1) return [emptyQuestion()];
      return prev.filter((_, i) => i !== index);
    });
  };

  const parsedValues = useMemo(() => {
    const registrationStart = formData.registration_start ? new Date(formData.registration_start) : null;
    const registrationEnd = formData.registration_end ? new Date(formData.registration_end) : null;

    const prizeMoney = formData.prize_money === '' ? null : Number(formData.prize_money);
    const questionProblem = formData.question_problem === '' ? null : Number(formData.question_problem);
    const timeLimit = formData.time_limit_qs === '' ? null : Number(formData.time_limit_qs);

    return { registrationStart, registrationEnd, prizeMoney, questionProblem, timeLimit };
  }, [formData]);

  const validate = () => {
    const nextErrors = {};

    const requiredText = ['title', 'title_description', 'description', 'registration_start', 'registration_end'];
    requiredText.forEach((k) => {
      if (!String(formData[k] || '').trim()) nextErrors[k] = 'Required';
    });

    // DB constraints from provided schema
    if (String(formData.title || '').trim().length > 100) nextErrors.title = 'Max 100 characters';
    if (String(formData.title_description || '').trim().length > 50)
      nextErrors.title_description = 'Max 50 characters';

    if (!formData.contest_difficulty) nextErrors.contest_difficulty = 'Required';

    if (parsedValues.questionProblem === null || Number.isNaN(parsedValues.questionProblem)) {
      nextErrors.question_problem = 'Required';
    } else if (parsedValues.questionProblem <= 0) {
      nextErrors.question_problem = 'Must be a positive number';
    }

    if (parsedValues.timeLimit === null || Number.isNaN(parsedValues.timeLimit)) {
      nextErrors.time_limit_qs = 'Required';
    } else if (parsedValues.timeLimit <= 0) {
      nextErrors.time_limit_qs = 'Must be a positive number';
    }

    if (parsedValues.prizeMoney !== null) {
      if (Number.isNaN(parsedValues.prizeMoney)) nextErrors.prize_money = 'Must be a number';
      else if (parsedValues.prizeMoney < 0) nextErrors.prize_money = 'Must be 0 or more';
    }

    if (parsedValues.registrationStart && parsedValues.registrationEnd) {
      if (parsedValues.registrationEnd <= parsedValues.registrationStart) {
        nextErrors.registration_end = 'End must be after start';
      }
    }

    if (formData.cover_image && !/^https?:\/\//i.test(formData.cover_image.trim())) {
      nextErrors.cover_image = 'Must be a valid URL (http/https)';
    }

    contestQuestions.forEach((q, i) => {
      const hasAny = [q.question_title, q.question_description, q.question_input, q.question_output].some((s) => String(s || '').trim());
      if (hasAny) {
        if (!String(q.question_title || '').trim()) nextErrors[`q${i}_question_title`] = `Question ${i + 1}: Title required`;
        else if (String(q.question_title).trim().length > 150) nextErrors[`q${i}_question_title`] = `Question ${i + 1}: Max 150 characters`;
        if (!String(q.question_description || '').trim()) nextErrors[`q${i}_question_description`] = `Question ${i + 1}: Description required`;
        if (!String(q.question_input || '').trim()) nextErrors[`q${i}_question_input`] = `Question ${i + 1}: Input required`;
        if (!String(q.question_output || '').trim()) nextErrors[`q${i}_question_output`] = `Question ${i + 1}: Output required`;
      }
    });

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const ensureUserExists = async (firebaseUser) => {
    // First try to get user
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', firebaseUser.uid)
      .single();
    
    if (!fetchError && existingUser) {
      return existingUser.id;
    }
    
    // User doesn't exist, create them
    if (fetchError?.code === 'PGRST116') {
      const userProfile = {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        display_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Question Setter',
        auth_provider: 'email',
        last_login: new Date().toISOString()
      };
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([userProfile])
        .select('id')
        .single();
      
      if (!insertError && newUser) {
        console.log('Created new user in database:', newUser.id);
        return newUser.id;
      } else {
        console.error('Error creating user:', insertError);
        return null;
      }
    }
    
    return null;
  };

  const tryInsertWithOwnerFallback = async (payload) => {
    // Get user UUID from users table using Firebase UID
    if (!user?.uid) {
      return { error: { message: 'User not authenticated' } };
    }

    try {
      // Ensure user exists and get their UUID
      const userId = await ensureUserExists(user);
      
      if (!userId) {
        console.error('Failed to get or create user UUID');
        return { error: { message: 'Failed to get user information' } };
      }

      console.log('Inserting contest with created_by:', userId);

      // Use created_by with users.id (UUID) - this is the correct column name in the contests table
      const { data: insertedData, error } = await supabase
        .from('contests')
        .insert({ ...payload, created_by: userId })
        .select();

      if (error) {
        console.error('Error inserting contest:', error);
        return { error };
      }

      console.log('Contest inserted successfully:', insertedData);
      const newContest = Array.isArray(insertedData) ? insertedData[0] : insertedData;
      return { error: null, data: newContest };
    } catch (e) {
      console.error('Exception in tryInsertWithOwnerFallback:', e);
      return { error: e };
    }
  };

  const tryUpdateWithOwnerFallback = async (id, payload) => {
    // Update the record with contest_updated_at
    const updatePayload = {
      ...payload,
      contest_updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('contests').update(updatePayload).eq('id', id);
    return { error };
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setLoadError('');

    try {
      const payload = {
        title: formData.title.trim(),
        title_description: formData.title_description.trim(),
        description: formData.description.trim(),
        rules: formData.rules ? formData.rules.trim() : null,
        cover_image: formData.cover_image ? formData.cover_image.trim() : null,
        registration_start: new Date(formData.registration_start).toISOString(),
        registration_end: new Date(formData.registration_end).toISOString(),
        prize_money: parsedValues.prizeMoney,
        question_problem: Number(parsedValues.questionProblem),
        contest_difficulty: (formData.contest_difficulty || 'medium').toLowerCase(),
        time_limit_qs: Number(parsedValues.timeLimit),
      };

      if (!isEditMode) {
        payload.total_register = 0;
        payload.status = 'pending';
      }

      let contestId = isEditMode ? editContestId : null;

      if (isEditMode) {
        const { error } = await tryUpdateWithOwnerFallback(editContestId, payload);
        if (error) throw error;
      } else {
        const result = await tryInsertWithOwnerFallback(payload);
        if (result.error) {
          console.error('Error inserting contest:', result.error);
          throw result.error;
        }
        if (result.data?.id) contestId = result.data.id;
        console.log('Contest created successfully with created_by field');
      }

      const toInsert = contestQuestions.filter(
        (q) =>
          String(q.question_title || '').trim() &&
          String(q.question_description || '').trim() &&
          String(q.question_input || '').trim() &&
          String(q.question_output || '').trim()
      ).map((q) => ({
        contest_id: contestId,
        question_title: String(q.question_title).trim().slice(0, 150),
        question_description: String(q.question_description).trim(),
        question_input: String(q.question_input).trim(),
        question_output: String(q.question_output).trim(),
        question_sample_input: String(q.question_sample_input || '').trim() || null,
        question_sample_output: String(q.question_sample_output || '').trim() || null,
      }));

      if (toInsert.length > 0 && contestId) {
        if (isEditMode) {
          const { error: delErr } = await supabase.from('contest_questions').delete().eq('contest_id', contestId);
          if (delErr) console.warn('Delete existing contest_questions:', delErr);
        }
        const { error: insErr } = await supabase.from('contest_questions').insert(toInsert);
        if (insErr) throw insErr;
      }

      setSuccessMessage(isEditMode ? 'Contest updated successfully!' : 'Contest created successfully!');

      // Show success message for 2 seconds before navigating
      setTimeout(() => {
        navigate('/admin_contests', { state: { refresh: Date.now() } });
      }, 2000);
    } catch (e) {
      console.error('Error saving contest:', e);
      setLoadError(e?.message || 'Failed to save contest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`ud-root ${sidebarOpen ? '' : 'collapsed'}`}>
      <aside className="ud-sidebar">
        <div className="ud-logo">
          <span className="byte">Byte</span>
          <span className="arena">Arena</span>
          <span className="admin-badge">ADMIN</span>
        </div>
        <nav className="ud-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`ud-nav-item ${active === item.key ? 'active' : ''} ${item.danger ? 'danger' : ''
                }`}
              onClick={() => {
                if (item.key === 'logout') {
                  handleLogout();
                } else {
                  setActive(item.key);
                  if (item.key === 'home') {
                    navigate('/admin_dashboard');
                  } else if (item.key === 'users') {
                    navigate('/admin_users');
                  } else if (item.key === 'contests') {
                    navigate('/admin_contests');
                  } else if (item.key === 'problems') {
                    navigate('/admin_problems');
                  } else if (item.key === 'leaderboard') {
                    navigate('/admin_leaderboard');
                  }
                }
              }}
            >
              <span className="icon" style={{ marginRight: '12px' }}>{item.icon}</span>
              <span className="label" style={{ textAlign: 'left', flex: 1 }}>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="ud-main">
        <header className="ud-topbar">
          <div className="ud-topbar-left">
            <button
              className="ud-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <FaBars />
            </button>
            <div className="search">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search users, contests, problems..." />
            </div>
          </div>
          <div className="ud-topbar-right">
            <button className="icon-btn" onClick={() => navigate('/')} data-tooltip="Home">
              <FaHome />
            </button>
            <div className="profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} data-tooltip="Profile">
              <div className="avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="avatar" />
                ) : (
                  <FaUser />
                )}
              </div>
              <span>{user?.displayName || 'Admin'}</span>
            </div>
          </div>
        </header>

        <div className="qs-content-area" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 className="qs-page-title" style={{ margin: 0 }}>{isEditMode ? 'Edit Contest' : 'Create Contest'}</h1>
            <button
              onClick={() => navigate('/admin_contests')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#64748b',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#1e293b';
                e.target.style.backgroundColor = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#64748b';
                e.target.style.backgroundColor = 'transparent';
              }}
              title="Close"
            >
              <FaTimes />
            </button>
          </div>

          <div className="qs-create-form">
            {loading && (
              <div style={{ marginBottom: 16, color: '#64748b' }}>Loading contest...</div>
            )}
            {loadError && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 8,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                }}
              >
                {loadError}
              </div>
            )}
            {successMessage && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 8,
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  color: '#166534',
                }}
              >
                {successMessage}
              </div>
            )}

            {/* Contest Information Section */}
            <div className="qs-form-section">
              <h2 className="qs-section-title">Contest Information</h2>
            
              <div className="qs-form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter contest title"
                />
                {fieldErrors.title && <div className="qs-field-error">{fieldErrors.title}</div>}
              </div>

              <div className="qs-form-group">
                <label htmlFor="title_description">Title Description *</label>
                <input
                  type="text"
                  id="title_description"
                  name="title_description"
                  value={formData.title_description}
                  onChange={handleChange}
                  placeholder="Short subtitle (max ~50 chars)"
                />
                {fieldErrors.title_description && (
                  <div className="qs-field-error">{fieldErrors.title_description}</div>
                )}
              </div>

              <div className="qs-form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter contest description"
                  rows="6"
                />
                {fieldErrors.description && <div className="qs-field-error">{fieldErrors.description}</div>}
              </div>

              <div className="qs-form-row">
                <div className="qs-form-group">
                  <label htmlFor="registration_start">Registration Start *</label>
                  <input
                    type="datetime-local"
                    id="registration_start"
                    name="registration_start"
                    value={formData.registration_start}
                    onChange={handleChange}
                  />
                  {fieldErrors.registration_start && (
                    <div className="qs-field-error">{fieldErrors.registration_start}</div>
                  )}
                </div>

                <div className="qs-form-group">
                  <label htmlFor="registration_end">Registration End *</label>
                  <input
                    type="datetime-local"
                    id="registration_end"
                    name="registration_end"
                    value={formData.registration_end}
                    onChange={handleChange}
                  />
                  {fieldErrors.registration_end && (
                    <div className="qs-field-error">{fieldErrors.registration_end}</div>
                  )}
                </div>
              </div>

              <div className="qs-form-row">
                <div className="qs-form-group">
                  <label htmlFor="prize_money">Prize Money</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    id="prize_money"
                    name="prize_money"
                    value={formData.prize_money}
                    onChange={handleChange}
                    placeholder="e.g. 500.00"
                    min="0"
                  />
                  {fieldErrors.prize_money && <div className="qs-field-error">{fieldErrors.prize_money}</div>}
                </div>

                <div className="qs-form-group">
                  <label htmlFor="contest_difficulty">Difficulty *</label>
                  <select
                    id="contest_difficulty"
                    name="contest_difficulty"
                    value={formData.contest_difficulty}
                    onChange={handleChange}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  {fieldErrors.contest_difficulty && (
                    <div className="qs-field-error">{fieldErrors.contest_difficulty}</div>
                  )}
                </div>
              </div>

              <div className="qs-form-row">
                <div className="qs-form-group">
                  <label htmlFor="question_problem">Number of Questions *</label>
                  <input
                    type="number"
                    id="question_problem"
                    name="question_problem"
                    value={formData.question_problem}
                    onChange={handleChange}
                    min="1"
                    placeholder="e.g. 10"
                  />
                  {fieldErrors.question_problem && (
                    <div className="qs-field-error">{fieldErrors.question_problem}</div>
                  )}
                </div>

                <div className="qs-form-group">
                  <label htmlFor="time_limit_qs">Time Limit per Question (seconds) *</label>
                  <input
                    type="number"
                    id="time_limit_qs"
                    name="time_limit_qs"
                    value={formData.time_limit_qs}
                    onChange={handleChange}
                    min="1"
                    placeholder="e.g. 60"
                  />
                  {fieldErrors.time_limit_qs && (
                    <div className="qs-field-error">{fieldErrors.time_limit_qs}</div>
                  )}
                </div>
              </div>

              <div className="qs-form-group">
                <label htmlFor="rules">Rules</label>
                <textarea
                  id="rules"
                  name="rules"
                  value={formData.rules}
                  onChange={handleChange}
                  placeholder="Optional contest rules"
                  rows="5"
                />
              </div>

              <div className="qs-form-group">
                <label htmlFor="cover_image">Cover Image URL</label>
                <input
                  type="url"
                  id="cover_image"
                  name="cover_image"
                  value={formData.cover_image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                {fieldErrors.cover_image && <div className="qs-field-error">{fieldErrors.cover_image}</div>}
              </div>
            </div>

            {/* Contest Questions Section */}
            <div className="qs-form-section" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className="qs-section-title">Contest Questions</h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: '#635BFF',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <FaPlus /> Add question
                </button>
              </div>
              {contestQuestions.map((q, index) => (
                <div
                  key={index}
                  className="qs-question-block"
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    background: '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>Question {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px',
                      }}
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                  <div className="qs-form-group">
                    <label>Question title *</label>
                    <input
                      type="text"
                      value={q.question_title}
                      onChange={(e) => handleQuestionChange(index, 'question_title', e.target.value)}
                      placeholder="Max 150 characters"
                      maxLength={150}
                    />
                    {fieldErrors[`q${index}_question_title`] && (
                      <div className="qs-field-error">{fieldErrors[`q${index}_question_title`]}</div>
                    )}
                  </div>
                  <div className="qs-form-group">
                    <label>Question description *</label>
                    <textarea
                      value={q.question_description}
                      onChange={(e) => handleQuestionChange(index, 'question_description', e.target.value)}
                      placeholder="Full problem description"
                      rows={4}
                    />
                    {fieldErrors[`q${index}_question_description`] && (
                      <div className="qs-field-error">{fieldErrors[`q${index}_question_description`]}</div>
                    )}
                  </div>
                  <div className="qs-form-group">
                    <label>Input *</label>
                    <textarea
                      value={q.question_input}
                      onChange={(e) => handleQuestionChange(index, 'question_input', e.target.value)}
                      placeholder="Expected input format"
                      rows={2}
                    />
                    {fieldErrors[`q${index}_question_input`] && (
                      <div className="qs-field-error">{fieldErrors[`q${index}_question_input`]}</div>
                    )}
                  </div>
                  <div className="qs-form-group">
                    <label>Output *</label>
                    <textarea
                      value={q.question_output}
                      onChange={(e) => handleQuestionChange(index, 'question_output', e.target.value)}
                      placeholder="Expected output format"
                      rows={2}
                    />
                    {fieldErrors[`q${index}_question_output`] && (
                      <div className="qs-field-error">{fieldErrors[`q${index}_question_output`]}</div>
                    )}
                  </div>
                  <div className="qs-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="qs-form-group">
                      <label>Sample input (optional)</label>
                      <textarea
                        value={q.question_sample_input}
                        onChange={(e) => handleQuestionChange(index, 'question_sample_input', e.target.value)}
                        placeholder="Sample input"
                        rows={2}
                      />
                    </div>
                    <div className="qs-form-group">
                      <label>Sample output (optional)</label>
                      <textarea
                        value={q.question_sample_output}
                        onChange={(e) => handleQuestionChange(index, 'question_sample_output', e.target.value)}
                        placeholder="Sample output"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="qs-form-actions">
              <button
                type="button"
                className="qs-publish-btn"
                onClick={handleSave}
                disabled={isSubmitting}
              >
                <FaUpload /> {isEditMode ? 'Publish (Update)' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminContestEdit;

