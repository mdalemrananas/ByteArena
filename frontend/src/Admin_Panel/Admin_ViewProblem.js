import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaBars,
    FaBell,
    FaCode,
    FaCoins,
    FaCommentAlt,
    FaFire,
    FaHome,
    FaListOl,
    FaMedal,
    FaSearch,
    FaSignOutAlt,
    FaStar,
    FaTrophy,
    FaUser,
    FaPlayCircle,
    FaArrowLeft,
    FaBook,
    FaComments,
    FaCheck,
    FaTimes,
    FaTrash
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { 
    getProblemById,
    updateProblem,
    deleteProblem,
    updateProblemStatus,
    createProblem,
    getAllProblems,
    getProblemsByAuthor,
    getProblemsByDifficulty,
    getProblemsByLanguage,
    searchProblems,
    getProblemStatistics,
    duplicateProblem,
    exportProblemData,
    getSolutionByProblemId,
    updateSolution
} from '../services/Admin_View_Problem_Service';
import './Admin_Dashboard.css';
import './Admin_ViewProblem.css';

const menuItems = [
    { key: 'home', name: 'Dashboard', icon: <FaHome className="menu-icon" /> },
    { key: 'users', name: 'User Management', icon: <FaUser className="menu-icon" /> },
    { key: 'contests', name: 'Contests', icon: <FaTrophy className="menu-icon" /> },
    { key: 'problems', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
    { key: 'leaderboard', name: 'Leaderboard', icon: <FaMedal className="menu-icon" /> },
    { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const Admin_ViewProblem = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [active, setActive] = useState('problems');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        problem_id: '',
        problem_title: '',
        problemsetter_name: '',
        difficulty: 'Medium',
        problem_language: 'JavaScript',
        status: 'unsolved',
        problem_description: '',
        problem_input: '',
        problem_output: '',
        sample_input: '',
        sample_output: '',
        problem_rating: 2.5,
        created_at: new Date().toISOString()
    });
    const [solution, setSolution] = useState({
        solution_code: '',
        video_link: '',
        solution_article: ''
    });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [problem, setProblem] = useState(null);
    const [problemLoading, setProblemLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { problemId } = useParams();
    const navigate = useNavigate();

    // Mock problem data for admin view
    const mockProblem = {
        problem_id: problemId,
        problem_title: 'Two Sum Problem',
        problem_description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

**Example 2:**
Input: nums = [3,2,4], target = 6
Output: [1,2]

**Example 3:**
Input: nums = [3,3], target = 6
Output: [0,1]

**Constraints:**
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
        problem_language: 'JavaScript',
        difficulty: 'Medium',
        points: 100,
        problemsetter_name: 'John Doe',
        status: 'Approved',
        problem_rating: 4.5,
        time_limit: '1s',
        memory_limit: '256MB',
        problem_input: `The first line contains an integer n (2 ≤ n ≤ 10^4) - the size of the array.
The second line contains n integers (-10^9 ≤ nums[i] ≤ 10^9) - the array elements.
The third line contains an integer target (-10^9 ≤ target ≤ 10^9) - the target sum.`,
        problem_output: `Print two space-separated integers - the indices of the two numbers that add up to target.
If multiple solutions exist, any valid solution is acceptable.`,
        sample_input: `4
2 7 11 15
9`,
        sample_output: `0 1`
    };

    // Fetch problem data
    const fetchProblem = async () => {
        setProblemLoading(true);
        try {
            console.log('Fetching problem with ID:', problemId);
            const [problemResult, solutionResult] = await Promise.all([
                getProblemById(problemId),
                getSolutionByProblemId(problemId)
            ]);
            
            console.log('Problem result:', problemResult);
            console.log('Solution result:', solutionResult);
            
            if (problemResult.success) {
                setProblem(problemResult.data);
                console.log('Problem set:', problemResult.data);
            } else {
                console.error('Failed to fetch problem:', problemResult.error);
            }
            
            if (solutionResult.success) {
                setSolution(solutionResult.data);
                console.log('Solution set:', solutionResult.data);
            } else {
                console.error('Failed to fetch solution:', solutionResult.error);
                // Set default empty solution if fetch fails
                setSolution({
                    solution_code: '',
                    video_link: '',
                    solution_article: ''
                });
            }
        } catch (error) {
            console.error('Error fetching problem:', error);
        } finally {
            setProblemLoading(false);
        }
    };

    useEffect(() => {
        fetchProblem();
    }, [problemId]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser({
                  displayName: currentUser.displayName || 'Admin',
                  email: currentUser.email,
                  photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'Admin'}&background=random`
                });
                setLoading(false);
            } else {
                navigate('/');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy':
            case 'EASY': return '#10b981';
            case 'Medium':
            case 'MEDIUM': return '#f59e0b';
            case 'Hard':
            case 'HARD': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const openEditModal = () => {
        setEditForm({
            problem_id: problem?.problem_id || '',
            problem_title: problem?.problem_title || '',
            problemsetter_name: problem?.problemsetter_name || '',
            difficulty: problem?.difficulty || 'Medium',
            problem_language: problem?.problem_language || 'JavaScript',
            admin_status: problem?.admin_status || 'pending',
            problem_description: problem?.problem_description || '',
            problem_input: problem?.problem_input || '',
            problem_output: problem?.problem_output || '',
            sample_input: problem?.sample_input || '',
            sample_output: problem?.sample_output || '',
            problem_rating: problem?.problem_rating || 2.5,
            points: problem?.points || 0,
            created_at: problem?.created_at || new Date().toISOString()
        });
        // Set solution data - use current solution state
        setSolution({
            solution_code: solution?.solution_code || '',
            video_link: solution?.video_link || '',
            solution_article: solution?.solution_article || ''
        });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
    };

    const handleEditFormChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveEditForm = async () => {
        try {
            // Update problem
            const problemResult = await updateProblem(problemId, editForm);
            if (problemResult.success) {
                console.log('Problem updated successfully:', problemResult.data);
                // Update the problem state with new data
                setProblem(problemResult.data);
                
                // Update solution
                const solutionResult = await updateSolution(problemId, solution);
                if (solutionResult.success) {
                    console.log('Solution updated successfully:', solutionResult.data);
                    // Update solution state
                    setSolution(solutionResult.data);
                } else {
                    console.error('Failed to update solution:', solutionResult.error);
                    // Don't fail the entire operation if solution update fails
                }
                
                setShowEditModal(false);
            } else {
                console.error('Failed to update problem:', problemResult.error);
                alert('Failed to update problem: ' + problemResult.error);
            }
        } catch (error) {
            console.error('Error updating problem:', error);
            alert('Error updating problem: ' + error.message);
        }
    };

    const handleStatusChange = async (status, problemId) => {
        try {
            const result = await updateProblemStatus(problemId, status);
            if (result.success) {
                console.log('Status updated successfully:', result.data);
                // Update the problem state with new data
                setProblem(prev => ({
                    ...prev,
                    admin_status: status
                }));
            } else {
                console.error('Failed to update status:', result.error);
                alert('Failed to update status: ' + result.error);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status: ' + error.message);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            const result = await deleteProblem(problemId);
            if (result.success) {
                console.log('Problem deleted successfully');
                setShowDeleteDialog(false);
                // Navigate back to problems list after successful deletion
                navigate('/admin_problems');
            } else {
                console.error('Failed to delete problem:', result.error);
                alert('Failed to delete problem: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting problem:', error);
            alert('Error deleting problem: ' + error.message);
        }
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
    };

    if (loading || problemLoading) {
        return (
            <div className="ud-root">
                <aside className="ud-sidebar">
                    <div className="ud-logo">
                        <span className="byte">Byte</span>
                        <span className="arena">Arena</span>
                        <span className="admin-badge">ADMIN</span>
                    </div>
                </aside>
                <main className="ud-main">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>{loading ? 'Loading user...' : 'Loading problem...'}</p>
                    </div>
                </main>
            </div>
        );
    }

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
                            className={`ud-nav-item ${active === item.key ? 'active' : ''} ${item.danger ? 'danger' : ''}`}
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
                            <input type="text" placeholder="Search problems..." />
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

                <div className="admin-sp-content">
                    {/* Problem Navbar */}
                    <div className="admin-sp-navbar">
                        <div className="admin-sp-navbar-left">
                            <button className="admin-sp-nav-btn" onClick={() => {
                                console.log('Navigating to practice');
                                navigate('/admin_problems');
                            }}>
                                Problems
                            </button>
                            <button className="admin-sp-nav-btn" onClick={() => {
                                console.log('Navigating to submissions for problem:', problemId);
                                navigate(`/admin_submissions/${problemId}`);
                            }}>
                                Submissions
                            </button>
                            <button className="admin-sp-nav-btn" onClick={() => {
                                console.log('Navigating to leaderboard for problem:', problemId);
                                navigate(`/admin/leaderboard/${problemId}`);
                            }}>
                                Leaderboard
                            </button>
                        </div>
                    </div>

                    <div className="admin-sp-main-layout">
                        {/* Left Column - Problem Sections */}
                        <div className="admin-sp-problems-column">
                            {/* Problem Title */}
                            <div className="admin-sp-problem-section">
                                <div className="admin-sp-section-header">
                                    <h2>{problem?.problem_title || 'Loading Problem...'}</h2>
                                </div>
                            </div>

                            {/* Problem Description */}
                            <div className="admin-sp-problem-section">
                                <div className="admin-sp-section-header">
                                    <h2>Problem Description</h2>
                                </div>
                                <div className="admin-sp-problem-content">
                                    <div className="admin-sp-problem-statement">
                                        <p>{problem?.problem_description || 'Problem description loading...'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Problem Input Format */}
                            <div className="admin-sp-problem-section">
                                <div className="admin-sp-section-header">
                                    <h2>Input Format</h2>
                                </div>
                                <div className="admin-sp-problem-content">
                                    <div className="admin-sp-input-format">
                                        <p>{problem?.problem_input || 'Input format information loading...'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Problem Output Format */}
                            <div className="admin-sp-problem-section">
                                <div className="admin-sp-section-header">
                                    <h2>Output Format</h2>
                                </div>
                                <div className="admin-sp-problem-content">
                                    <div className="admin-sp-output-format">
                                        <p>{problem?.problem_output || 'Output format information loading...'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sample Input and Output */}
                            <div className="admin-sp-problem-section">
                                <div className="admin-sp-section-header">
                                    <h2>Sample Input & Output</h2>
                                </div>
                                <div className="admin-sp-problem-content">
                                    <div className="admin-sp-samples">
                                        <div className="admin-sp-sample-section">
                                            <h3>Sample Input</h3>
                                            <div className="admin-sp-sample-box">
                                                <pre>{problem?.sample_input || 'Sample input loading...'}</pre>
                                            </div>
                                        </div>
                                        <div className="admin-sp-sample-section">
                                            <h3>Sample Output</h3>
                                            <div className="admin-sp-sample-box">
                                                <pre>{problem?.sample_output || 'Sample output loading...'}</pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Solution Section */}
                            <div className="admin-sp-problem-section">
                                <div className="admin-sp-section-header">
                                    <h2>Solution</h2>
                                </div>
                                <div className="admin-sp-problem-content">
                                    <div className="admin-sp-solution-section">
                                        
                                        {solution?.solution_code && (
                                            <div className="admin-sp-solution-code">
                                                <h4>Solution Code</h4>
                                                <textarea 
                                                    className="admin-sp-code-textarea"
                                                    value={solution.solution_code}
                                                    readOnly
                                                    rows={Math.max(8, solution.solution_code.split('\n').length)}
                                                    style={{ fontFamily: 'Fira Code, Courier New, monospace' }}
                                                />
                                            </div>
                                        )}
                                        
                                        {solution?.video_link && (
                                            <div className="admin-sp-solution-video">
                                                <h4>Video Solution</h4>
                                                <div className="admin-sp-video-link">
                                                    <a href={solution.video_link} target="_blank" rel="noopener noreferrer">
                                                        {solution.video_link}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {solution?.solution_article && (
                                            <div className="admin-sp-solution-article">
                                                <h4>Solution Explanation</h4>
                                                <div className="admin-sp-article-content">
                                                    <pre>{solution.solution_article}</pre>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {!solution?.solution_code && !solution?.video_link && !solution?.solution_article && (
                                            <div className="admin-sp-no-solution">
                                                <p>No solution provided yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Admin Info (instead of code editor) */}
                        <div className="admin-sp-editor-section">
                            <div className="admin-sp-editor-header">
                                <div className="admin-sp-editor-left">
                                    <h3>Problem Information</h3>
                                </div>
                            </div>
                            <div className="admin-sp-editor-content">
                                <div className="admin-info-section">
                                    <div className="info-item">
                                        <label>Problem ID:</label>
                                        <span>{problem?.problem_id || problemId}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Author:</label>
                                        <span>{problem?.problemsetter_name || 'Unknown'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Status:</label>
                                        <span className={`status-badge ${problem?.admin_status?.toLowerCase()}`}>
                                            {problem?.admin_status?.charAt(0).toUpperCase() + problem?.admin_status?.slice(1) || 'Pending'}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <label>Language:</label>
                                        <span>{problem?.problem_language || 'JavaScript'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Difficulty:</label>
                                        <span className={`difficulty-badge ${problem?.difficulty?.toLowerCase()}`} style={{ backgroundColor: getDifficultyColor(problem?.difficulty) }}>
                                            {problem?.difficulty || 'Medium'}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <label>Points:</label>
                                        <span>{problem?.points || 0}</span>
                                    </div>
                                </div>

                                {/* Admin Actions */}
                                <div className="admin-actions-section">
                                    <h4>Admin Actions</h4>
                                    <div className="status-selector">
                                        <label>Status:</label>
                                        <select 
                                            className="status-dropdown" 
                                            value={problem?.admin_status || 'pending'}
                                            onChange={(e) => handleStatusChange(e.target.value, problemId)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <div className="action-buttons">
                                        <button className="edit-btn" onClick={openEditModal}>
                                            <FaBook /> Edit Problem
                                        </button>
                                        <button className="delete-btn" onClick={handleDeleteClick}>
                                            <FaTrash /> Delete Problem
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Problem Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Edit Problem</h2>
                            <button className="modal-close" onClick={closeEditModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Problem ID:</label>
                                    <input
                                        type="text"
                                        value={editForm.problem_id}
                                        onChange={(e) => handleEditFormChange('problem_id', e.target.value)}
                                        placeholder="gen_random_uuid()"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Problem Title *</label>
                                    <input
                                        type="text"
                                        value={editForm.problem_title}
                                        onChange={(e) => handleEditFormChange('problem_title', e.target.value)}
                                        placeholder="Enter problem title"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Problemsetter Name *</label>
                                    <input
                                        type="text"
                                        value={editForm.problemsetter_name}
                                        onChange={(e) => handleEditFormChange('problemsetter_name', e.target.value)}
                                        placeholder="Enter problemsetter name"
                                        required
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Difficulty *</label>
                                    <select
                                        value={editForm.difficulty}
                                        onChange={(e) => handleEditFormChange('difficulty', e.target.value)}
                                        required
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Language *</label>
                                    <select
                                        value={editForm.problem_language}
                                        onChange={(e) => handleEditFormChange('problem_language', e.target.value)}
                                        required
                                    >
                                        <option value="C++">C++</option>
                                        <option value="Python">Python</option>
                                        <option value="Java">Java</option>
                                        <option value="JavaScript">JavaScript</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Problem Description *</label>
                                    <textarea
                                        value={editForm.problem_description}
                                        onChange={(e) => handleEditFormChange('problem_description', e.target.value)}
                                        placeholder="Enter problem description"
                                        rows="6"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Problem Input *</label>
                                    <textarea
                                        value={editForm.problem_input}
                                        onChange={(e) => handleEditFormChange('problem_input', e.target.value)}
                                        placeholder="Enter input format description"
                                        rows="4"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Problem Output *</label>
                                    <textarea
                                        value={editForm.problem_output}
                                        onChange={(e) => handleEditFormChange('problem_output', e.target.value)}
                                        placeholder="Enter output format description"
                                        rows="4"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sample Input</label>
                                    <textarea
                                        value={editForm.sample_input}
                                        onChange={(e) => handleEditFormChange('sample_input', e.target.value)}
                                        placeholder="Enter sample input"
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Sample Output</label>
                                    <textarea
                                        value={editForm.sample_output}
                                        onChange={(e) => handleEditFormChange('sample_output', e.target.value)}
                                        placeholder="Enter sample output"
                                        rows="3"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Created At</label>
                                    <input
                                        type="datetime-local"
                                        value={editForm.created_at.slice(0, 16)}
                                        onChange={(e) => handleEditFormChange('created_at', e.target.value)}
                                        readOnly
                                    />
                                </div>
                            </div>

                            {/* Solution Fields */}
                            <div className="form-section-divider">
                                <h4>Solution (Optional)</h4>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Solution Code</label>
                                    <textarea
                                        value={solution.solution_code}
                                        onChange={(e) => setSolution({...solution, solution_code: e.target.value})}
                                        placeholder="Enter solution code (optional)"
                                        rows="8"
                                        style={{ fontFamily: 'monospace', fontSize: '14px' }}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Video Link</label>
                                    <input
                                        type="url"
                                        value={solution.video_link}
                                        onChange={(e) => setSolution({...solution, video_link: e.target.value})}
                                        placeholder="Enter video solution link (optional)"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Solution Article</label>
                                    <textarea
                                        value={solution.solution_article}
                                        onChange={(e) => setSolution({...solution, solution_article: e.target.value})}
                                        placeholder="Enter detailed solution explanation (optional)"
                                        rows="6"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-cancel" onClick={closeEditModal}>
                                Cancel
                            </button>
                            <button className="modal-save" onClick={saveEditForm}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="delete-dialog-overlay">
                    <div className="delete-dialog">
                        <div className="delete-dialog-header">
                            <h3>Confirm Delete</h3>
                        </div>
                        <div className="delete-dialog-body">
                            <p>Are you sure you want to delete this problem?</p>
                            <p style={{ color: '#ef4444', fontSize: '14px' }}>This action cannot be undone.</p>
                        </div>
                        <div className="delete-dialog-footer">
                            <button className="cancel-btn" onClick={cancelDelete}>
                                Cancel
                            </button>
                            <button className="confirm-delete-btn" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin_ViewProblem;
