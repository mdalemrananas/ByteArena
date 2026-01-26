import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaBell,
  FaChevronDown,
  FaChevronRight,
  FaCode,
  FaEye,
  FaEdit,
  FaHome,
  FaListOl,
  FaSearch,
  FaSignOutAlt,
  FaStar,
  FaTrash,
  FaTrophy,
  FaUser,
} from 'react-icons/fa';
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
  { key: 'practice', name: 'Practice Problems', icon: <FaCode className="menu-icon" /> },
  { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
  { key: 'profile', name: 'Profile', icon: <FaUser className="menu-icon" /> },
  { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const categories = ['All Categories', 'C', 'C++', 'Python', 'Java', 'JavaScript'];
const difficulties = ['All Levels', 'Easy', 'Medium', 'Hard'];
const statusOptions = ['All', 'Solved', 'Unsolved'];

const emptyForm = {
  // practice_problem
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
  // problem_solution
  solution_code: '',
  video_link: '',
  solution_article: '',
};

const QuestionSetterExploreQuestions = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState('practice');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Practice Problems list state
  const [problemsLoading, setProblemsLoading] = useState(true);
  const [problems, setProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [expandedFilters, setExpandedFilters] = useState({ difficulty: true, status: true });
  const [error, setError] = useState('');

  // Tabs: All Problems vs My Problems
  const [problemView, setProblemView] = useState('All Problems'); // 'All Problems' | 'My Problems'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);
  const problemsPerPage = 5;
  const totalPages = Math.ceil(totalProblems / problemsPerPage);

  // Action dropdown
  const [openDropdown, setOpenDropdown] = useState(null);

  // Delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDeleteProblemId, setPendingDeleteProblemId] = useState(null);

  // Create/edit form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const currentProblemSetterName = useMemo(() => {
    if (!user) return '';
    return user.displayName || user.email?.split('@')[0] || 'Question Setter';
  }, [user]);

  // Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // ensure default setter name on open
    if (currentProblemSetterName && !editingProblemId) {
      setFormData((prev) => ({ ...prev, problemsetter_name: currentProblemSetterName }));
    }
  }, [currentProblemSetterName, editingProblemId]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleFilter = (filterName) => {
    setExpandedFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
      case 'EASY':
        return '#10b981';
      case 'Medium':
      case 'MEDIUM':
        return '#f59e0b';
      case 'Hard':
      case 'HARD':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'C++':
        return '#00599c';
      case 'Python':
        return '#3776ab';
      case 'Java':
        return '#007396';
      case 'JavaScript':
        return '#f7df1e';
      case 'C':
        return '#00599c';
      default:
        return '#6b7280';
    }
  };

  const buildProblemsQuery = (forCount = false) => {
    let query = supabase.from('practice_problem').select(forCount ? '*' : '*', {
      count: forCount ? 'exact' : undefined,
      head: forCount ? true : undefined,
    });

    // My Problems filter
    if (problemView === 'My Problems' && currentProblemSetterName) {
      query = query.eq('problemsetter_name', currentProblemSetterName);
    }

    // Difficulty filter
    if (selectedDifficulty && selectedDifficulty !== 'All Levels') {
      query = query.eq('difficulty', selectedDifficulty);
    }

    // Language filter
    if (selectedCategory && selectedCategory !== 'All Categories') {
      query = query.eq('problem_language', selectedCategory);
    }

    // Status filter (if your table has status values)
    if (selectedStatus && selectedStatus !== 'All') {
      if (selectedStatus === 'Solved') query = query.or('status.eq.solved,status.eq.SOLVED');
      if (selectedStatus === 'Unsolved') query = query.or('status.eq.unsolved,status.eq.UNSOLVED');
    }

    // Search filter
    if (searchQuery) {
      query = query.or(`problem_title.ilike.%${searchQuery}%,problemsetter_name.ilike.%${searchQuery}%`);
    }

    return query;
  };

  const fetchProblems = async () => {
    setProblemsLoading(true);
    setError('');

    try {
      const from = (currentPage - 1) * problemsPerPage;
      const to = from + problemsPerPage - 1;

      const [listRes, countRes] = await Promise.all([
        buildProblemsQuery(false).order('created_at', { ascending: false }).range(from, to),
        buildProblemsQuery(true),
      ]);

      if (listRes.error) throw listRes.error;
      if (countRes.error) throw countRes.error;

      setProblems(listRes.data || []);
      setTotalProblems(countRes.count || 0);
    } catch (e) {
      console.error('Failed to fetch problems:', e);
      setError(e?.message || 'Failed to load problems');
      setProblems([]);
      setTotalProblems(0);
    } finally {
      setProblemsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedDifficulty, selectedStatus, searchQuery, currentPage, problemView, currentProblemSetterName]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedDifficulty, selectedStatus, searchQuery, problemView]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.qs-action-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOwner = (problem) => {
    if (!problem || !currentProblemSetterName) return false;
    return problem.problemsetter_name === currentProblemSetterName;
  };

  const openCreate = () => {
    setEditingProblemId(null);
    setFormData({ ...emptyForm, problemsetter_name: currentProblemSetterName });
    setShowCreateForm(true);
  };

  const openEdit = async (problemId) => {
    setOpenDropdown(null);
    setIsSubmitting(false);
    setShowCreateForm(true);
    setEditingProblemId(problemId);

    try {
      const { data: problem, error: pErr } = await supabase
        .from('practice_problem')
        .select('*')
        .eq('problem_id', problemId)
        .single();
      if (pErr) throw pErr;

      const solRes = await problemSolutionsService.getSolutionByProblemId(problemId);
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
      setError(e?.message || 'Failed to load problem for edit');
      setShowCreateForm(false);
      setEditingProblemId(null);
    }
  };

  const handleViewNavigate = (problemId) => {
    setOpenDropdown(null);
    navigate(`/question-setter/question/${problemId}`);
  };

  const requestDelete = (problemId) => {
    setOpenDropdown(null);
    setPendingDeleteProblemId(problemId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const problemId = pendingDeleteProblemId;
    if (!problemId) return;

    // Close modal immediately
    setDeleteModalOpen(false);
    setPendingDeleteProblemId(null);

    const prev = problems;
    setProblems((p) => p.filter((x) => x.problem_id !== problemId));

    try {
      // best effort: delete solution explicitly (DB may already have ON DELETE CASCADE)
      await problemSolutionsService.deleteSolution(problemId);

      const { error: delErr } = await supabase.from('practice_problem').delete().eq('problem_id', problemId);
      if (delErr) throw delErr;

      // Refresh counts/pages
      await fetchProblems();
    } catch (e) {
      console.error('Failed to delete problem:', e);
      setProblems(prev);
      setError(e?.message || 'Failed to delete problem');
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      if (!formData.problem_title.trim()) throw new Error('Problem title is required');
      if (!formData.problem_description.trim()) throw new Error('Problem description is required');
      if (!formData.problemsetter_name.trim()) throw new Error('Problem setter name is required');

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

      let problemId = editingProblemId;

      if (editingProblemId) {
        const { error: updErr } = await supabase
          .from('practice_problem')
          .update(problemPayload)
          .eq('problem_id', editingProblemId);
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

      const solPayload = {
        problem_id: problemId,
        solution_code: formData.solution_code,
        video_link: formData.video_link,
        solution_article: formData.solution_article,
      };

      const solRes = await problemSolutionsService.upsertSolution(solPayload);
      if (!solRes.success) throw new Error(solRes.error);

      setShowCreateForm(false);
      setEditingProblemId(null);
      setFormData({ ...emptyForm, problemsetter_name: currentProblemSetterName });
      await fetchProblems();
    } catch (e) {
      console.error('Publish failed:', e);
      setError(e?.message || 'Failed to publish problem');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatProblemData = (problem) => {
    return {
      ...problem,
      id: problem.problem_id,
      title: problem.problem_title,
      category: problem.problem_language,
      difficulty: problem.difficulty,
      author: problem.problemsetter_name,
      rating: problem.problem_rating?.toFixed?.(1) || '0.0',
      ratingCount: '0',
      participants: '0',
      successRate: '0%',
      description: problem.problem_description,
    };
  };

  if (loading || problemsLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {loading ? 'Loading user...' : 'Loading problems...'}
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
              className={`ud-nav-item ${active === item.key ? 'active' : ''} ${
                item.danger ? 'danger' : ''
              }`}
              onClick={() => {
                if (item.key === 'logout') {
                  handleLogout();
                } else {
                  setActive(item.key);
                  if (item.key === 'home') {
                    navigate('/question-setter');
                  } else if (item.key === 'contest') {
                    navigate('/question-setter/contest');
                  } else if (item.key === 'practice') {
                    navigate('/question-setter/explore');
                  } else if (item.key === 'leaderboard') {
                    navigate('/question-setter/leaderboard');
                  } else if (item.key === 'profile') {
                    navigate('/question-setter/profile');
                  }
                }
              }}
            >
              <span className="icon" style={{ marginRight: '12px' }}>
                {item.icon}
              </span>
              <span className="label" style={{ textAlign: 'left', flex: 1 }}>
                {item.name}
              </span>
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
              <input
                type="text"
                placeholder="Search problems by title, category, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
            {/* balance UI intentionally excluded */}
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
          <div className="pp-banner">
            <img src="/practice-banner.png" alt="Practice Banner" className="pp-banner-image" />
            <button className="pp-create-question-btn" onClick={openCreate}>
              Create Question
            </button>
          </div>

          {showCreateForm && (
            <div className="pp-create-form">
              <div className="pp-create-form-head">
                <h3 style={{ margin: 0 }}>{editingProblemId ? 'Edit Question' : 'Create Question'}</h3>
                <button
                  className="pp-create-close"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingProblemId(null);
                    setFormData({ ...emptyForm, problemsetter_name: currentProblemSetterName });
                  }}
                >
                  Close
                </button>
              </div>

              <div className="pp-create-grid">
                <div className="pp-field">
                  <label>Problem Title</label>
                  <input
                    value={formData.problem_title}
                    onChange={(e) => setFormData((p) => ({ ...p, problem_title: e.target.value }))}
                    placeholder="Enter problem title"
                  />
                </div>

                <div className="pp-field">
                  <label>Problemsetter Name</label>
                  <input
                    value={formData.problemsetter_name}
                    onChange={(e) => setFormData((p) => ({ ...p, problemsetter_name: e.target.value }))}
                    placeholder="Your name"
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
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pp-field pp-span-2">
                  <label>Problem Description</label>
                  <textarea
                    rows={6}
                    value={formData.problem_description}
                    onChange={(e) => setFormData((p) => ({ ...p, problem_description: e.target.value }))}
                    placeholder="Write the problem statement..."
                  />
                </div>

                <div className="pp-field">
                  <label>Problem Input</label>
                  <textarea
                    rows={4}
                    value={formData.problem_input}
                    onChange={(e) => setFormData((p) => ({ ...p, problem_input: e.target.value }))}
                    placeholder="Input format"
                  />
                </div>

                <div className="pp-field">
                  <label>Problem Output</label>
                  <textarea
                    rows={4}
                    value={formData.problem_output}
                    onChange={(e) => setFormData((p) => ({ ...p, problem_output: e.target.value }))}
                    placeholder="Output format"
                  />
                </div>

                <div className="pp-field">
                  <label>Sample Input</label>
                  <textarea
                    rows={3}
                    value={formData.sample_input}
                    onChange={(e) => setFormData((p) => ({ ...p, sample_input: e.target.value }))}
                    placeholder="Sample input"
                  />
                </div>

                <div className="pp-field">
                  <label>Sample Output</label>
                  <textarea
                    rows={3}
                    value={formData.sample_output}
                    onChange={(e) => setFormData((p) => ({ ...p, sample_output: e.target.value }))}
                    placeholder="Sample output"
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
                    placeholder="Paste solution code..."
                  />
                </div>

                <div className="pp-field pp-span-2">
                  <label>Video Link</label>
                  <input
                    value={formData.video_link}
                    onChange={(e) => setFormData((p) => ({ ...p, video_link: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div className="pp-field pp-span-2">
                  <label>Solution Article</label>
                  <textarea
                    rows={5}
                    value={formData.solution_article}
                    onChange={(e) => setFormData((p) => ({ ...p, solution_article: e.target.value }))}
                    placeholder="Write editorial/solution explanation..."
                  />
                </div>
              </div>

              <div className="pp-create-actions">
                <button className="solve-btn" disabled={isSubmitting} onClick={handlePublish}>
                  {isSubmitting ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          )}

          <div className="pp-main-layout">
            {/* Categories + All/My tabs */}
            <div className="pp-categories-top">
              <div className="pp-view-tabs">
                <button
                  className={`pp-view-tab ${problemView === 'All Problems' ? 'active' : ''}`}
                  onClick={() => setProblemView('All Problems')}
                >
                  All Problems
                </button>
                <button
                  className={`pp-view-tab ${problemView === 'My Problems' ? 'active' : ''}`}
                  onClick={() => setProblemView('My Problems')}
                >
                  My Problems
                </button>
              </div>

              <h3>Categories</h3>
              <div className="categories-list">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="pp-content-area">
              {/* Filters on the side */}
              <div className="pp-filters-sidebar">
                <h3>Filters</h3>

                <div className="filter-group">
                  <div className="filter-group-header" onClick={() => toggleFilter('difficulty')}>
                    <h4>Difficulty</h4>
                    <FaChevronRight
                      className={`dropdown-icon ${expandedFilters.difficulty ? 'rotated' : ''}`}
                    />
                  </div>
                  {expandedFilters.difficulty &&
                    difficulties.map((difficulty) => (
                      <button
                        key={difficulty}
                        className={`filter-btn ${selectedDifficulty === difficulty ? 'active' : ''}`}
                        onClick={() => setSelectedDifficulty(difficulty)}
                      >
                        {difficulty}
                      </button>
                    ))}
                </div>

                <div className="filter-group">
                  <div className="filter-group-header" onClick={() => toggleFilter('status')}>
                    <h4>Status</h4>
                    <FaChevronRight
                      className={`dropdown-icon ${expandedFilters.status ? 'rotated' : ''}`}
                    />
                  </div>
                  {expandedFilters.status &&
                    statusOptions.map((status) => (
                      <button
                        key={status}
                        className={`filter-btn ${selectedStatus === status ? 'active' : ''}`}
                        onClick={() => setSelectedStatus(status)}
                      >
                        {status}
                      </button>
                    ))}
                </div>
              </div>

              {/* Problem list */}
              <div className="pp-problems-area">
                {error && (
                  <div
                    className="error-message"
                    style={{
                      color: '#ef4444',
                      padding: '10px',
                      textAlign: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    {error}
                  </div>
                )}

                {problems.length === 0 && !problemsLoading ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#6b7280',
                    }}
                  >
                    <FaCode style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <h3>No problems found</h3>
                    <p>Try adjusting your filters or search query</p>
                  </div>
                ) : (
                  problems.map((problem) => {
                    const formatted = formatProblemData(problem);
                    const owner = isOwner(problem);

                    return (
                      <div key={formatted.id} className="problem-card-wide">
                        <div className="problem-left">
                          <div className="problem-header">
                            <div
                              className="problem-difficulty"
                              style={{ color: getDifficultyColor(formatted.difficulty) }}
                            >
                              {formatted.difficulty}
                            </div>
                          </div>

                          <div
                            className="problem-category"
                            style={{ color: getCategoryColor(formatted.category) }}
                          >
                            {formatted.category}
                          </div>

                          <h3 className="problem-title">{formatted.title}</h3>
                          <p className="problem-author">by {formatted.author}</p>

                          <div className="problem-stats">
                            <div className="stat-item">
                              <FaStar className="star-icon" />
                              <span>
                                {formatted.rating} ({formatted.ratingCount})
                              </span>
                            </div>
                            <div className="stat-item">
                              <FaUser className="user-icon" />
                              <span>{formatted.participants}</span>
                            </div>
                            <div className="stat-item">
                              <span className="success-rate">{formatted.successRate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="problem-right">
                          <div
                            className={`qs-action-dropdown ${openDropdown === formatted.id ? 'active' : ''}`}
                          >
                            <button
                              className="solve-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdown(openDropdown === formatted.id ? null : formatted.id);
                              }}
                            >
                              Action <FaChevronDown className="qs-action-chevron" />
                            </button>
                            {openDropdown === formatted.id && (
                              <div className="qs-dropdown-menu">
                                <button onClick={() => handleViewNavigate(formatted.id)}>
                                  <FaEye /> View
                                </button>
                                {owner && (
                                  <button onClick={() => openEdit(formatted.id)}>
                                    <FaEdit /> Edit
                                  </button>
                                )}
                                {owner && (
                                  <button
                                    onClick={() => requestDelete(formatted.id)}
                                    className="qs-delete-btn"
                                  >
                                    <FaTrash /> Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Pagination */}
                <div className="pp-pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      pageNumber === currentPage ||
                      pageNumber === currentPage - 1 ||
                      pageNumber === currentPage + 1
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                      return (
                        <span key={pageNumber} style={{ padding: '0 8px' }}>
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {deleteModalOpen && (
          <div className="pp-confirm-overlay" onClick={() => setDeleteModalOpen(false)}>
            <div className="pp-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pp-confirm-title">Are you sure you want to delete this problem?</div>
              <div className="pp-confirm-actions">
                <button
                  className="pp-confirm-btn pp-confirm-no"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setPendingDeleteProblemId(null);
                  }}
                >
                  No
                </button>
                <button className="pp-confirm-btn pp-confirm-yes" onClick={confirmDelete}>
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestionSetterExploreQuestions;
