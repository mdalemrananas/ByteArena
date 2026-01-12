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
    FaChevronRight
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { practiceProblemsService } from '../services/practiceProblemsService';
import './User_Dashboard.css';
import './PracticeProblem.css';

const menuItems = [
    { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
    { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
    { key: 'practice', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
    { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
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
const statusOptions = ["All", "Solved", "Unsolved"];

const PracticeProblem = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [active, setActive] = useState('practice');
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
    const navigate = useNavigate();

    const [totalProblems, setTotalProblems] = useState(0);
    const [problemsPerPage] = useState(5);
    const totalPages = Math.ceil(totalProblems / problemsPerPage);

    // Fetch problems from Supabase
    const fetchProblems = async () => {
        setProblemsLoading(true);
        setError('');
        
        const filters = {
            difficulty: selectedDifficulty,
            language: selectedCategory,
            status: selectedStatus,
            search: searchQuery
        };

        // Fetch both problems and count
        const [problemsResult, countResult] = await Promise.all([
            practiceProblemsService.getProblems(filters, currentPage, problemsPerPage),
            practiceProblemsService.getProblemsCount(filters)
        ]);
        
        if (problemsResult.success && countResult.success) {
            setProblems(problemsResult.data);
            setTotalProblems(countResult.count);
        } else {
            setError(problemsResult.error || countResult.error);
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
            setUser(currentUser);
            setLoading(false);
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

    const solveProblem = (problemId) => {
        navigate(`/practice/solve/${problemId}`);
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
            ratingCount: '0', // You can add this field to database if needed
            participants: '0', // You can add this field to database if needed
            successRate: '0%', // You can add this field to database if needed
            reward: problem.points,
            description: problem.problem_description
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
                                        navigate('/dashboard');
                                    } else if (item.key === 'contest') {
                                        navigate('/contest');
                                    } else if (item.key === 'practice') {
                                        navigate('/practice');
                                    } else if (item.key === 'leaderboard') {
                                        navigate('/leaderboard');
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
                        <button
                            className="icon-btn"
                            onClick={() => {
                                console.log('Home button clicked, navigating to /');
                                navigate('/');
                            }}
                            data-tooltip="Home"
                        >
                            <FaHome />
                        </button>
                        <button className="icon-btn" data-tooltip="Notifications">
                            <FaBell />
                            <span className="badge">4</span>
                        </button>
                        <button className="icon-btn" data-tooltip="Messages">
                            <FaCommentAlt />
                            <span className="badge">2</span>
                        </button>
                        <div className="balance" data-tooltip="Reward Coins">
                            <FaCoins className="balance-icon" />
                            <span>1200.00</span>
                        </div>
                        <div className="profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} data-tooltip="Profile">
                            <div className="avatar">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="avatar" />
                                ) : (
                                    <FaUser />
                                )}
                            </div>
                            <span>{user?.displayName || 'User'}</span>
                        </div>
                    </div>
                </header>

                <div className="pp-content">
                    <div className="pp-banner">
                        <img src="/practice-banner.png" alt="Practice Banner" className="pp-banner-image" />
                    </div>

                    <div className="pp-main-layout">
                        {/* Categories on top */}
                        <div className="pp-categories-top">
                            <h3>Categories</h3>
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

                        <div className="pp-content-area">
                            {/* Filters on the side */}
                            <div className="pp-filters-sidebar">
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
                            <div className="pp-problems-area">
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
                                                    
                                                    <div className="problem-stats">
                                                        <div className="stat-item">
                                                            <FaStar className="star-icon" />
                                                            <span>{formattedProblem.rating} ({formattedProblem.ratingCount})</span>
                                                        </div>
                                                        <div className="stat-item">
                                                            <FaUser className="user-icon" />
                                                            <span>{formattedProblem.participants}</span>
                                                        </div>
                                                        <div className="stat-item">
                                                            <span className="success-rate">{formattedProblem.successRate}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="problem-right">
                                                    <div className="problem-reward">
                                                        <FaCoins className="coin-icon" />
                                                        <span>{formattedProblem.reward}</span>
                                                    </div>
                                                    <button className="solve-btn" onClick={() => solveProblem(formattedProblem.id)}>Solve</button>
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
        </div>
    );
};

export default PracticeProblem;
