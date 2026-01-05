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
import './User_Dashboard.css';
import './PracticeProblem.css';

const menuItems = [
    { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
    { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
    { key: 'practice', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
    { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
    { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const mockProblems = [
    {
        id: 1,
        title: "Maximum Subarray Sum With Length Divisible by K",
        category: "C++",
        difficulty: "Hard",
        author: "GeoExplorer",
        rating: "4.8",
        ratingCount: "124 K",
        participants: "285 K",
        successRate: "70%",
        reward: 50,
        description: "Find the maximum sum of any subarray whose length is divisible by K"
    },
    {
        id: 2,
        title: "Binary Tree Zigzag Level Order Traversal",
        category: "Python",
        difficulty: "Medium",
        author: "CodeMaster",
        rating: "4.6",
        ratingCount: "89 K",
        participants: "156 K",
        successRate: "65%",
        reward: 30,
        description: "Traverse binary tree in zigzag order and return list of lists"
    },
    {
        id: 3,
        title: "Longest Palindromic Substring",
        category: "Java",
        difficulty: "Medium",
        author: "AlgoExpert",
        rating: "4.7",
        ratingCount: "203 K",
        participants: "412 K",
        successRate: "72%",
        reward: 35,
        description: "Find the longest palindromic substring in the given string"
    },
    {
        id: 4,
        title: "Two Sum Problem",
        category: "JavaScript",
        difficulty: "Easy",
        author: "BeginnerFriendly",
        rating: "4.5",
        ratingCount: "567 K",
        participants: "892 K",
        successRate: "85%",
        reward: 15,
        description: "Find two numbers that add up to a specific target"
    },
    {
        id: 5,
        title: "Merge K Sorted Lists",
        category: "C++",
        difficulty: "Hard",
        author: "DataStructures",
        rating: "4.9",
        ratingCount: "78 K",
        participants: "134 K",
        successRate: "58%",
        reward: 55,
        description: "Merge k sorted linked lists into one sorted linked list"
    },
    {
        id: 6,
        title: "Valid Parentheses",
        category: "Python",
        difficulty: "Easy",
        author: "StackMaster",
        rating: "4.4",
        ratingCount: "234 K",
        participants: "456 K",
        successRate: "90%",
        reward: 10,
        description: "Check if parentheses are valid and properly nested"
    }
];

const categories = [
    "All Categories",
    "C/C++",
    "Java", 
    "PHP",
    "HTML, CSS",
    "JavaScript",
    "Python"
];

const difficulties = ["All Levels", "Easy", "Medium", "Hard"];
const sortByOptions = ["Most Popular", "Newest", "Highest Rated", "Highest Reward"];
const statusOptions = ["All", "Solved", "Unsolved", "Attempted"];

const PracticeProblem = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [active, setActive] = useState('practice');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
    const [selectedSort, setSelectedSort] = useState("Most Popular");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedFilters, setExpandedFilters] = useState({
        difficulty: true,
        sortBy: true,
        status: true,
        availability: true
    });
    const navigate = useNavigate();

    const problemsPerPage = 6;
    const indexOfLastProblem = currentPage * problemsPerPage;
    const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
    const currentProblems = mockProblems.slice(indexOfFirstProblem, indexOfLastProblem);
    const totalPages = Math.ceil(mockProblems.length / problemsPerPage);

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
            case 'Easy': return '#10b981';
            case 'Medium': return '#f59e0b';
            case 'Hard': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'C++': return '#00599c';
            case 'Python': return '#3776ab';
            case 'Java': return '#007396';
            case 'JavaScript': return '#f7df1e';
            case 'C/C++': return '#00599c';
            default: return '#6b7280';
        }
    };

    const solveProblem = (problemId) => {
        navigate(`/practice/solve/${problemId}`);
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontFamily: 'Arial, sans-serif'
            }}>
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
                                    <div className="filter-group-header" onClick={() => toggleFilter('sortBy')}>
                                        <h4>Sort By</h4>
                                        <FaChevronRight className={`dropdown-icon ${expandedFilters.sortBy ? 'rotated' : ''}`} />
                                    </div>
                                    {expandedFilters.sortBy && sortByOptions.map(option => (
                                        <button
                                            key={option}
                                            className={`filter-btn ${selectedSort === option ? 'active' : ''}`}
                                            onClick={() => setSelectedSort(option)}
                                        >
                                            {option}
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

                                <div className="filter-group">
                                    <div className="filter-group-header" onClick={() => toggleFilter('availability')}>
                                        <h4>Availability</h4>
                                        <FaChevronRight className={`dropdown-icon ${expandedFilters.availability ? 'rotated' : ''}`} />
                                    </div>
                                    {expandedFilters.availability && (
                                        <>
                                            <button className="filter-btn active">Available Now</button>
                                            <button className="filter-btn">Upcoming</button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Problem list */}
                            <div className="pp-problems-area">
                                {currentProblems.map(problem => (
                                    <div key={problem.id} className="problem-card-wide">
                                        <div className="problem-left">
                                            <div className="problem-header">
                                                <div className="problem-badge">COMPETITIVE PROGRAMMING CHALLENGE</div>
                                                <div className="problem-difficulty" style={{ color: getDifficultyColor(problem.difficulty) }}>
                                                    {problem.difficulty}
                                                </div>
                                            </div>
                                            
                                            <div className="problem-category" style={{ color: getCategoryColor(problem.category) }}>
                                                {problem.category}
                                            </div>
                                            
                                            <h3 className="problem-title">{problem.title}</h3>
                                            <p className="problem-author">by {problem.author}</p>
                                            
                                            <div className="problem-stats">
                                                <div className="stat-item">
                                                    <FaStar className="star-icon" />
                                                    <span>{problem.rating} ({problem.ratingCount})</span>
                                                </div>
                                                <div className="stat-item">
                                                    <FaUser className="user-icon" />
                                                    <span>{problem.participants}</span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="success-rate">{problem.successRate}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="problem-right">
                                            <div className="problem-reward">
                                                <FaCoins className="coin-icon" />
                                                <span>{problem.reward}</span>
                                            </div>
                                            <button className="solve-btn" onClick={() => solveProblem(problem.id)}>Solve</button>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                <div className="pp-pagination">
                                    <button 
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index + 1}
                                            className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    <button 
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
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
