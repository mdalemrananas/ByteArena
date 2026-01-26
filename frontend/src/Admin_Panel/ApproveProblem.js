import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    FaFilter,
    FaChevronDown,
    FaChevronUp,
    FaChevronRight,
    FaCheck,
    FaTimes,
    FaEye,
    FaTrash,
    FaCaretDown,
    FaPlus,
    FaExclamationTriangle,
    FaCheckCircle
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { 
    getAllProblems, 
    getProblemById,
    approveProblem as approveProblemService, 
    rejectProblem as rejectProblemService, 
    deleteProblem as deleteProblemService,
    updateProblemStatus,
    searchProblems,
    getProblemsCountByStatus,
    getProblemsStatistics,
    createProblem as createProblemService
} from '../services/Approve_Problem_Service';
import './Admin_Dashboard.css';
import './ApproveProblem.css';

const menuItems = [
    { key: 'home', name: 'Dashboard', icon: <FaHome className="menu-icon" /> },
    { key: 'users', name: 'User Management', icon: <FaUser className="menu-icon" /> },
    { key: 'contests', name: 'Contests', icon: <FaTrophy className="menu-icon" /> },
    { key: 'problems', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
    { key: 'leaderboard', name: 'Leaderboard', icon: <FaMedal className="menu-icon" /> },
    { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const categories = [
    "All Categories",
    "C",
    "C++",
    "Python", 
    "Java",
    "JavaScript",
];

const difficulties = ["All Levels", "Easy", "Medium", "Hard"];
const statusOptions = ["All", "Pending", "Approved", "Rejected"];

const ApproveProblem = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [active, setActive] = useState('problems');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [problemsLoading, setProblemsLoading] = useState(true);
    const [problems, setProblems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedFilters, setExpandedFilters] = useState({
        difficulty: true,
        status: true
    });
    const [error, setError] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [problemToDelete, setProblemToDelete] = useState(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [newProblem, setNewProblem] = useState({
        problem_title: '',
        problemsetter_name: '',
        difficulty: 'Easy',
        problem_language: 'C++',
        problem_description: '',
        problem_input: '',
        problem_output: '',
        sample_input: '',
        sample_output: '',
        points: 0,
        solution_code: '',
        video_link: '',
        solution_article: ''
    });
    const navigate = useNavigate();

    const [totalProblems, setTotalProblems] = useState(0);
    const [problemsPerPage] = useState(5);
    const totalPages = Math.ceil(totalProblems / problemsPerPage);

    // Fetch problems from database
    const fetchProblems = async () => {
        setProblemsLoading(true);
        setError('');
        
        const filters = {
            difficulty: selectedDifficulty,
            language: selectedCategory,
            status: selectedStatus
        };

        try {
            const result = await getAllProblems(currentPage, problemsPerPage, searchQuery, filters);
            if (result.success) {
                setProblems(result.data);
                setTotalProblems(result.total);
            } else {
                setError(result.error);
                setProblems([]);
                setTotalProblems(0);
            }
        } catch (error) {
            setError('Failed to fetch problems');
            setProblems([]);
            setTotalProblems(0);
        }
        
        setProblemsLoading(false);
    };

    // Fetch problems when filters or page changes
    useEffect(() => {
        fetchProblems();
    }, [selectedCategory, selectedDifficulty, selectedStatus, searchQuery, currentPage]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedDifficulty, selectedStatus, searchQuery]);

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
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleFilter = (filterName) => {
        setExpandedFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }));
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

    const getCategoryColor = (category) => {
        switch (category) {
            case 'C++': return '#00599c';
            case 'Python': return '#3776ab';
            case 'Java': return '#007396';
            case 'JavaScript': return '#f7df1e';
            case 'C': return '#00599c';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return '#10b981';
            case 'Rejected': return '#ef4444';
            case 'Pending': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const viewProblem = (problemId) => {
        navigate(`/admin_problems/${problemId}`);
    };

    const approveProblem = async (problemId) => {
        try {
            const result = await approveProblemService(problemId);
            if (result.success) {
                await fetchProblems(); // Refresh the list
            } else {
                setError('Failed to approve problem: ' + result.error);
            }
        } catch (error) {
            setError('Failed to approve problem: ' + error.message);
        }
    };

    const rejectProblem = async (problemId) => {
        try {
            const result = await rejectProblemService(problemId);
            if (result.success) {
                await fetchProblems(); // Refresh the list
            } else {
                setError('Failed to reject problem: ' + result.error);
            }
        } catch (error) {
            setError('Failed to reject problem: ' + error.message);
        }
    };

    const deleteProblem = async (problemId) => {
        try {
            const result = await deleteProblemService(problemId);
            if (result.success) {
                await fetchProblems(); // Refresh the list
            } else {
                setError('Failed to delete problem: ' + result.error);
            }
        } catch (error) {
            setError('Failed to delete problem: ' + error.message);
        }
    };

    const toggleDropdown = (problemId) => {
        setActiveDropdown(activeDropdown === problemId ? null : problemId);
    };

    const handleAction = async (action, problemId) => {
        setActiveDropdown(null);
        if (action === 'approve') {
            await approveProblem(problemId);
        } else if (action === 'reject') {
            await rejectProblem(problemId);
        } else if (action === 'delete') {
            // Show custom delete dialog
            setProblemToDelete(problemId);
            setShowDeleteDialog(true);
        }
    };

    const confirmDelete = async () => {
        if (problemToDelete) {
            await deleteProblem(problemToDelete);
            setShowDeleteDialog(false);
            setProblemToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
        setProblemToDelete(null);
    };

    const handleCreateProblem = () => {
        setShowCreateDialog(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProblem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const createProblem = async () => {
        try {
            // Validate required fields
            if (!newProblem.problem_title || !newProblem.problemsetter_name || 
                !newProblem.problem_description || !newProblem.problem_input || 
                !newProblem.problem_output || !newProblem.sample_input || 
                !newProblem.sample_output) {
                showWarning('Please fill in all required fields');
                return;
            }

            // Call service to create problem
            const result = await createProblemService(newProblem);

            if (result.success) {
                await fetchProblems(); // Refresh the list
                setShowCreateDialog(false);
                setNewProblem({
                    problem_title: '',
                    problemsetter_name: '',
                    difficulty: 'Easy',
                    problem_language: 'C++',
                    problem_description: '',
                    problem_input: '',
                    problem_output: '',
                    sample_input: '',
                    sample_output: '',
                    points: 0,
                    solution_code: '',
                    video_link: '',
                    solution_article: ''
                });
                setError('');
                showSuccess('Problem created successfully!');
            } else {
                showWarning('Failed to create problem: ' + result.error);
            }
        } catch (error) {
            showWarning('Failed to create problem: ' + error.message);
        }
    };

    const cancelCreate = () => {
        setShowCreateDialog(false);
        setNewProblem({
            problem_title: '',
            problemsetter_name: '',
            difficulty: 'Easy',
            problem_language: 'C++',
            problem_description: '',
            problem_input: '',
            problem_output: '',
            sample_input: '',
            sample_output: '',
            points: 0,
            solution_code: '',
            video_link: '',
            solution_article: ''
        });
    };

    const showWarning = (message) => {
        setWarningMessage(message);
        setShowWarningDialog(true);
    };

    const closeWarning = () => {
        setShowWarningDialog(false);
        setWarningMessage('');
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessDialog(true);
    };

    const closeSuccess = () => {
        setShowSuccessDialog(false);
        setSuccessMessage('');
    };

    const handleStatusChange = async (status, problemId) => {
        try {
            const result = await updateProblemStatus(problemId, status);
            if (result.success) {
                await fetchProblems(); // Refresh the list
            } else {
                setError('Failed to update status: ' + result.error);
            }
        } catch (error) {
            setError('Failed to update status: ' + error.message);
        }
    };

    const formatProblemData = (problem) => {
        return {
            ...problem,
            // Map database fields to component expectations
            id: problem.problem_id,
            title: problem.problem_title,
            category: problem.problem_language,
            difficulty: problem.difficulty,
            author: problem.problemsetter_name,
            rating: problem.problem_rating?.toFixed(1) || '0.0',
            reward: problem.points,
            description: problem.problem_description,
            status: problem.admin_status.charAt(0).toUpperCase() + problem.admin_status.slice(1) || 'Pending'
        };
    };

    if (loading || problemsLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontFamily: 'Arial, sans-serif'
            }}>
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

                <div className="admin-pp-content">
                    <div className="admin-pp-main-layout">
                        {/* Categories on top */}
                        <div className="admin-pp-categories-top">
                            <div className="categories-header">
                                <h3>Categories</h3>
                                <button className="create-problem-btn" onClick={handleCreateProblem}>
                                    <FaPlus />
                                    Create Problem
                                </button>
                            </div>
                            <div className="categories-list">
                                {categories.map(category => (
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

                        <div className="admin-pp-content-area">
                            {/* Filters on side */}
                            <div className="admin-pp-filters-sidebar">
                                <h3>Filters</h3>
                                
                                <div className="filter-group">
                                    <div className="filter-group-header" onClick={() => toggleFilter('difficulty')}>
                                        <h4>Difficulty</h4>
                                        <FaChevronRight className={`dropdown-icon ${expandedFilters.difficulty ? 'rotated' : ''}`} />
                                    </div>
                                    {expandedFilters.difficulty && difficulties.map(difficulty => (
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
                                        <FaChevronRight className={`dropdown-icon ${expandedFilters.status ? 'rotated' : ''}`} />
                                    </div>
                                    {expandedFilters.status && statusOptions.map(status => (
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
                            <div className="admin-pp-problems-area">
                                {error && (
                                    <div className="error-message" style={{ 
                                        color: '#ef4444', 
                                        padding: '10px', 
                                        textAlign: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        {error}
                                    </div>
                                )}
                                
                                {problems.length === 0 && !problemsLoading ? (
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '40px',
                                        color: '#6b7280'
                                    }}>
                                        <FaCode style={{ fontSize: '48px', marginBottom: '16px' }} />
                                        <h3>No problems found</h3>
                                        <p>Try adjusting your filters or search query</p>
                                    </div>
                                ) : (
                                    problems.map(problem => {
                                        const formattedProblem = formatProblemData(problem);
                                        return (
                                            <div key={formattedProblem.id} className="problem-card-wide">
                                                <div className="problem-left">
                                                    <div className="problem-header">
                                                        <div className="problem-difficulty" style={{ color: getDifficultyColor(formattedProblem.difficulty) }}>
                                                            {formattedProblem.difficulty}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="problem-category" style={{ color: getCategoryColor(formattedProblem.category) }}>
                                                        {formattedProblem.category}
                                                    </div>
                                                    
                                                    <h3 className="problem-title">{formattedProblem.title}</h3>
                                                    <p className="problem-author">by {formattedProblem.author}</p>
                                                </div>
                                                
                                                <div className="problem-right">
                                                    <div className="problem-reward">
                                                        <FaCoins className="coin-icon" />
                                                        <span>{formattedProblem.reward}</span>
                                                    </div>
                                                    <div className="problem-actions">
                                                        <button className="view-btn" onClick={() => viewProblem(formattedProblem.id)}>
                                                            <FaEye />
                                                            View
                                                        </button>
                                                        <div className="status-row">
                                                            <select 
                                                                className="status-select"
                                                                value={formattedProblem.status || 'Pending'}
                                                                onChange={(e) => handleStatusChange(e.target.value, formattedProblem.id)}
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="Approved">Approved</option>
                                                                <option value="Rejected">Rejected</option>
                                                            </select>
                                                            <button className="delete-btn" onClick={() => handleAction('delete', formattedProblem.id)}>
                                                                <FaTrash />
                                                            </button>
                                                        </div>
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
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    
                                    {/* Show page numbers */}
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        // Show current page, first, last, and pages around current
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
                                        // Show ellipsis for gaps
                                        if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                            return <span key={pageNumber} style={{ padding: '0 8px' }}>...</span>;
                                        }
                                        return null;
                                    })}
                                    
                                    <button 
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Custom Delete Confirmation Dialog */}
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

            {/* Create Problem Dialog */}
            {showCreateDialog && (
                <div className="create-dialog-overlay">
                    <div className="create-dialog">
                        <div className="create-dialog-header">
                            <h3>Create New Problem</h3>
                            <button className="close-btn" onClick={cancelCreate}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="create-dialog-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Problem Title *</label>
                                    <input
                                        type="text"
                                        name="problem_title"
                                        value={newProblem.problem_title}
                                        onChange={handleInputChange}
                                        placeholder="Enter problem title"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Problem Setter Name *</label>
                                    <input
                                        type="text"
                                        name="problemsetter_name"
                                        value={newProblem.problemsetter_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Difficulty</label>
                                    <select
                                        name="difficulty"
                                        value={newProblem.difficulty}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Language</label>
                                    <select
                                        name="problem_language"
                                        value={newProblem.problem_language}
                                        onChange={handleInputChange}
                                    >
                                        <option value="C">C</option>
                                        <option value="C++">C++</option>
                                        <option value="Python">Python</option>
                                        <option value="Java">Java</option>
                                        <option value="JavaScript">JavaScript</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Problem Description *</label>
                                <textarea
                                    name="problem_description"
                                    value={newProblem.problem_description}
                                    onChange={handleInputChange}
                                    placeholder="Enter problem description"
                                    rows="4"
                                />
                            </div>

                            <div className="form-group">
                                <label>Problem Input *</label>
                                <textarea
                                    name="problem_input"
                                    value={newProblem.problem_input}
                                    onChange={handleInputChange}
                                    placeholder="Enter input format and constraints"
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Problem Output *</label>
                                <textarea
                                    name="problem_output"
                                    value={newProblem.problem_output}
                                    onChange={handleInputChange}
                                    placeholder="Enter output format"
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sample Input *</label>
                                    <textarea
                                        name="sample_input"
                                        value={newProblem.sample_input}
                                        onChange={handleInputChange}
                                        placeholder="Enter sample input"
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Sample Output *</label>
                                    <textarea
                                        name="sample_output"
                                        value={newProblem.sample_output}
                                        onChange={handleInputChange}
                                        placeholder="Enter sample output"
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Points</label>
                                <input
                                    type="number"
                                    name="points"
                                    value={newProblem.points}
                                    onChange={handleInputChange}
                                    placeholder="Enter points"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Solution Code</label>
                                <textarea
                                    name="solution_code"
                                    value={newProblem.solution_code}
                                    onChange={handleInputChange}
                                    placeholder="Enter solution code (optional)"
                                    rows="8"
                                    style={{ fontFamily: 'monospace', fontSize: '14px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Video Link</label>
                                <input
                                    type="url"
                                    name="video_link"
                                    value={newProblem.video_link}
                                    onChange={handleInputChange}
                                    placeholder="Enter video solution link (optional)"
                                />
                            </div>

                            <div className="form-group">
                                <label>Solution Article</label>
                                <textarea
                                    name="solution_article"
                                    value={newProblem.solution_article}
                                    onChange={handleInputChange}
                                    placeholder="Enter detailed solution explanation (optional)"
                                    rows="6"
                                />
                            </div>
                        </div>
                        <div className="create-dialog-footer">
                            <button className="cancel-btn" onClick={cancelCreate}>
                                Cancel
                            </button>
                            <button className="create-btn" onClick={createProblem}>
                                Create Problem
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning Dialog */}
            {showWarningDialog && (
                <div className="warning-dialog-overlay">
                    <div className="warning-dialog">
                        <div className="warning-dialog-header">
                            <h3>Warning</h3>
                            <button className="close-btn" onClick={closeWarning}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="warning-dialog-body">
                            <div className="warning-icon">
                                <FaExclamationTriangle />
                            </div>
                            <p>{warningMessage}</p>
                        </div>
                        <div className="warning-dialog-footer">
                            <button className="warning-ok-btn" onClick={closeWarning}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Dialog */}
            {showSuccessDialog && (
                <div className="success-dialog-overlay">
                    <div className="success-dialog">
                        <div className="success-dialog-header">
                            <h3>Success</h3>
                            <button className="close-btn" onClick={closeSuccess}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="success-dialog-body">
                            <div className="success-icon">
                                <FaCheckCircle />
                            </div>
                            <p>{successMessage}</p>
                        </div>
                        <div className="success-dialog-footer">
                            <button className="success-ok-btn" onClick={closeSuccess}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApproveProblem;
