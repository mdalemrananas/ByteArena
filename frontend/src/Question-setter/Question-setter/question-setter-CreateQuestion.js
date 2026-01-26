import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaBars, FaBell, FaCode, FaHome, FaListOl, FaSearch, FaSignOutAlt, FaTrophy, FaUser } from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { logoutUser } from '../../services/authService';
import { supabase } from '../../services/supabaseClient';
import problemSolutionsService from '../../services/problemSolutionsService';
import '../../User_panel/User_Dashboard.css';
import '../../User_panel/PracticeProblem.css';
import './question-setter-ExploreQuestions.css';

const menuItems = [
  { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
  { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
  { key: 'practice', name: 'Practice Problems', icon: <FaCode className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
  { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const emptyForm = {
  problem_title: '',
  problemsetter_name: '',
  difficulty: 'Medium',
  problem_language: 'C++',
  problem_description: '',
  problem_input: '',
  problem_output: '',
  sample_input: '',
  sample_output: '',
  problem_rating: 0,
  points: 0,
  solution_code: '',
  video_link: '',
  solution_article: '',
};

const QuestionSetterCreateQuestion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit'); // practice_problem.problem_id

  const [active, setActive] = useState('practice');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  const currentProblemSetterName = useMemo(() => {
    if (!user) return '';
    return user.displayName || user.email?.split('@')[0] || 'Question Setter';
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentProblemSetterName && !editId) {
      setFormData((p) => ({ ...p, problemsetter_name: currentProblemSetterName }));
    }
  }, [currentProblemSetterName, editId]);

  useEffect(() => {
    const loadForEdit = async () => {
      if (!editId) return;
      setError('');
      try {
        const { data: problem, error: pErr } = await supabase
          .from('practice_problem')
          .select('*')
          .eq('problem_id', editId)
          .single();
        if (pErr) throw pErr;

        const solRes = await problemSolutionsService.getSolutionByProblemId(editId);
        if (!solRes.success) throw new Error(solRes.error);

        setFormData({
          ...emptyForm,
          ...problem,
          solution_code: solRes.data?.solution_code || '',
          video_link: solRes.data?.video_link || '',
          solution_article: solRes.data?.solution_article || '',
        });
      } catch (e) {
        console.error('Failed to load problem for edit:', e);
        setError(e?.message || 'Failed to load problem');
      }
    };

    loadForEdit();
  }, [editId]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      if (!formData.problem_title.trim()) throw new Error('Problem title is required');
      if (!formData.problem_description.trim()) throw new Error('Problem description is required');
      if (!formData.problemsetter_name.trim()) throw new Error('Problemsetter name is required');

      const problemPayload = {
        problem_title: formData.problem_title,
        problemsetter_name: formData.problemsetter_name,
        difficulty: formData.difficulty,
        problem_language: formData.problem_language,
        problem_description: formData.problem_description,
        problem_input: formData.problem_input,
        problem_output: formData.problem_output,
        sample_input: formData.sample_input,
        sample_output: formData.sample_output,
        problem_rating: Number(formData.problem_rating) || 0,
        points: Number(formData.points) || 0,
      };

      let problemId = editId;
      if (editId) {
        const { error: updErr } = await supabase
          .from('practice_problem')
          .update(problemPayload)
          .eq('problem_id', editId);
        if (updErr) throw updErr;
      } else {
        const { data: created, error: insErr } = await supabase
          .from('practice_problem')
          .insert(problemPayload)
          .select('*')
          .single();
        if (insErr) throw insErr;
        problemId = created.problem_id;
      }

      const solRes = await problemSolutionsService.upsertSolution({
        problem_id: problemId,
        solution_code: formData.solution_code,
        video_link: formData.video_link,
        solution_article: formData.solution_article,
      });
      if (!solRes.success) throw new Error(solRes.error);

      navigate('/question-setter/explore');
    } catch (e) {
      console.error('Publish failed:', e);
      setError(e?.message || 'Failed to publish');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className={`ud-root ${sidebarOpen ? '' : 'collapsed'}`}>
      <aside className="ud-sidebar">
        <div className="ud-logo">
          <span className="byte">Byte</span>
          <span className="arena">Arena</span>
        </div>
        <nav className="ud-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`ud-nav-item ${active === item.key ? 'active' : ''} ${item.danger ? 'danger' : ''}`}
              onClick={() => {
                if (item.key === 'logout') return handleLogout();
                setActive(item.key);
                if (item.key === 'home') navigate('/question-setter');
                if (item.key === 'contest') navigate('/question-setter/contest');
                if (item.key === 'practice') navigate('/question-setter/explore');
                if (item.key === 'leaderboard') navigate('/question-setter/leaderboard');
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
              <input type="text" placeholder="Search..." />
            </div>
          </div>
          <div className="ud-topbar-right">
            <button className="icon-btn" onClick={() => navigate('/')} data-tooltip="Home">
              <FaHome />
            </button>
            <button className="icon-btn" data-tooltip="Notifications">
              <FaBell />
              <span className="badge">4</span>
            </button>
            <div
              className="profile"
              onClick={() => navigate('/question-setter/profile')}
              style={{ cursor: 'pointer' }}
              data-tooltip="Profile"
            >
              <div className="avatar">{user?.photoURL ? <img src={user.photoURL} alt="avatar" /> : <FaUser />}</div>
              <span>{user?.displayName || 'Question Setter'}</span>
            </div>
          </div>
        </header>

        <div className="pp-content">
          <div className="pp-main-layout">
            <div className="pp-categories-top">
              <h3>{editId ? 'Edit Practice Problem' : 'Create Practice Problem'}</h3>
            </div>

            {error && (
              <div style={{ color: '#ef4444', padding: '10px', textAlign: 'center', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <div className="pp-create-form">
              <div className="pp-create-grid">
                <div className="pp-field">
                  <label>Problem Title</label>
                  <input
                    value={formData.problem_title}
                    onChange={(e) => setFormData((p) => ({ ...p, problem_title: e.target.value }))}
                  />
                </div>

                <div className="pp-field">
                  <label>Problemsetter Name</label>
                  <input
                    value={formData.problemsetter_name}
                    onChange={(e) => setFormData((p) => ({ ...p, problemsetter_name: e.target.value }))}
                  />
                </div>

                <div className="pp-field">
                  <label>Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData((p) => ({ ...p, difficulty: e.target.value }))}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="pp-field">
                  <label>Problem Language</label>
                  <select
                    value={formData.problem_language}
                    onChange={(e) => setFormData((p) => ({ ...p, problem_language: e.target.value }))}
                  >
                    {['C++', 'C', 'Python', 'Java', 'JavaScript'].map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </div>

                <div className="pp-field pp-span-2">
                  <label>Problem Description</label>
                  <textarea
                    rows={6}
                    value={formData.problem_description}
                    onChange={(e) => setFormData((p) => ({ ...p, problem_description: e.target.value }))}
                  />
                </div>

                <div className="pp-field">
                  <label>Problem Input</label>
                  <textarea
                    rows={4}
                    value={formData.problem_input}
                    onChange={(e) => setFormData((p) => ({ ...p, problem_input: e.target.value }))}
                  />
                </div>

                <div className="pp-field">
                  <label>Problem Output</label>
                  <textarea
                    rows={4}
                    value={formData.problem_output}
                    onChange={(e) => setFormData((p) => ({ ...p, problem_output: e.target.value }))}
                  />
                </div>

                <div className="pp-field">
                  <label>Sample Input</label>
                  <textarea
                    rows={3}
                    value={formData.sample_input}
                    onChange={(e) => setFormData((p) => ({ ...p, sample_input: e.target.value }))}
                  />
                </div>

                <div className="pp-field">
                  <label>Sample Output</label>
                  <textarea
                    rows={3}
                    value={formData.sample_output}
                    onChange={(e) => setFormData((p) => ({ ...p, sample_output: e.target.value }))}
                  />
                </div>

                <div className="pp-field">
                  <label>Problem Rating (0–5)</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={formData.problem_rating}
                    onChange={(e) => setFormData((p) => ({ ...p, problem_rating: e.target.value }))}
                  />
                </div>

                <div className="pp-field">
                  <label>Points</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.points}
                    onChange={(e) => setFormData((p) => ({ ...p, points: e.target.value }))}
                  />
                </div>

                <div className="pp-field pp-span-2">
                  <label>Solution Code</label>
                  <textarea
                    rows={6}
                    value={formData.solution_code}
                    onChange={(e) => setFormData((p) => ({ ...p, solution_code: e.target.value }))}
                  />
                </div>

                <div className="pp-field pp-span-2">
                  <label>Video Link</label>
                  <input
                    value={formData.video_link}
                    onChange={(e) => setFormData((p) => ({ ...p, video_link: e.target.value }))}
                  />
                </div>

                <div className="pp-field pp-span-2">
                  <label>Solution Article</label>
                  <textarea
                    rows={5}
                    value={formData.solution_article}
                    onChange={(e) => setFormData((p) => ({ ...p, solution_article: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pp-create-actions">
                <button className="solve-btn" disabled={isSubmitting} onClick={handlePublish}>
                  {isSubmitting ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionSetterCreateQuestion;
