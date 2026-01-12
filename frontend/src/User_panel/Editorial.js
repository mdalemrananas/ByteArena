import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHome, FaTrophy, FaListOl, FaSignOutAlt, FaCode, FaFileAlt, FaVideo, FaCopy, FaUser, FaBars, FaBell, FaCommentAlt, FaCoins, FaSearch, FaEye, FaPlayCircle } from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import problemSolutionsService from '../services/problemSolutionsService';
import { practiceProblemsService } from '../services/practiceProblemsService';
import './Editorial.css';

const Editorial = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [active, setActive] = useState('practice');
    const [solution, setSolution] = useState(null);
    const [solutionLoading, setSolutionLoading] = useState(true);
    const [problem, setProblem] = useState(null);
    const [currentProblemId, setCurrentProblemId] = useState(null);
    const { problemId } = useParams();
    const navigate = useNavigate();
    const location = window.location;

    // Debug: Log URL and params
    console.log('Editorial page loaded');
    console.log('Current URL:', location.href);
    console.log('URL pathname:', location.pathname);
    console.log('URL search:', location.search);
    console.log('URL hash:', location.hash);
    console.log('problemId from useParams:', problemId);
    console.log('URL params:', new URLSearchParams(location.search).toString());
    
    // Try different ways to extract problemId
    let extractedProblemId = problemId;
    console.log('Initial problemId:', extractedProblemId);
    
    // Method 1: From useParams (already tried)
    if (!extractedProblemId) {
        console.log('useParams failed, trying other methods...');
        
        // Method 2: From URL pathname like /editorial/123
        const pathParts = location.pathname.split('/');
        console.log('Path parts:', pathParts);
        
        const editorialIndex = pathParts.indexOf('editorial');
        if (editorialIndex !== -1 && pathParts[editorialIndex + 1]) {
            extractedProblemId = pathParts[editorialIndex + 1];
            console.log('Extracted from pathname method 1:', extractedProblemId);
        }
        
        // Method 3: From URL like /practice/editorial/123
        const practiceIndex = pathParts.indexOf('practice');
        if (practiceIndex !== -1 && pathParts[practiceIndex + 1] === 'editorial' && pathParts[practiceIndex + 2]) {
            extractedProblemId = pathParts[practiceIndex + 2];
            console.log('Extracted from pathname method 2:', extractedProblemId);
        }
        
        // Method 4: From query parameters like ?problemId=123
        const urlParams = new URLSearchParams(location.search);
        const queryProblemId = urlParams.get('problemId') || urlParams.get('id');
        if (queryProblemId) {
            extractedProblemId = queryProblemId;
            console.log('Extracted from query params:', extractedProblemId);
        }
        
        // Method 5: Try to get from localStorage or sessionStorage
        const storedProblemId = localStorage.getItem('currentProblemId') || sessionStorage.getItem('currentProblemId');
        if (storedProblemId) {
            extractedProblemId = storedProblemId;
            console.log('Extracted from storage:', extractedProblemId);
        }
    }
    
    console.log('Final extracted problemId:', extractedProblemId);

    const menuItems = [
        { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
        { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
        { key: 'practice', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
        { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
        { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
    ];

    // Fetch problem data to get title
    const fetchProblem = async (problemIdToFetch) => {
        console.log('Fetching problem for ID:', problemIdToFetch);
        try {
            const result = await practiceProblemsService.getProblemById(problemIdToFetch);
            if (result.success) {
                setProblem(result.data);
                console.log('Problem data loaded:', result.data);
            } else {
                console.error('Error fetching problem:', result.error);
            }
        } catch (error) {
            console.error('Error fetching problem:', error);
        }
    };

    // Fetch solution data
    const fetchSolution = async (problemIdToFetch) => {
        console.log('Fetching solution for problemId:', problemIdToFetch);
        setSolutionLoading(true);
        
        if (!problemIdToFetch) {
            console.error('No problemId provided');
            setSolutionLoading(false);
            return;
        }
        
        const result = await problemSolutionsService.getSolutionByProblemId(problemIdToFetch);
        
        console.log('Solution fetch result:', result);
        
        if (result.success) {
            setSolution(result.data);
            console.log('Solution data loaded:', result.data);
        } else {
            console.error('Error fetching solution:', result.error);
            setSolution(null);
        }
        setSolutionLoading(false);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Extract problemId from URL pathname
        const pathParts = location.pathname.split('/');
        console.log('Path parts:', pathParts);
        
        let extractedProblemId = problemId;
        
        // Try to extract from URL like /practice/editorial/[problemId]
        const practiceIndex = pathParts.indexOf('practice');
        if (practiceIndex !== -1 && pathParts[practiceIndex + 1] === 'editorial' && pathParts[practiceIndex + 2]) {
            extractedProblemId = pathParts[practiceIndex + 2];
            console.log('Extracted problemId from URL:', extractedProblemId);
        }
        
        // Also try direct /editorial/[problemId]
        const editorialIndex = pathParts.indexOf('editorial');
        if (editorialIndex !== -1 && pathParts[editorialIndex + 1]) {
            extractedProblemId = pathParts[editorialIndex + 1];
            console.log('Extracted problemId from direct URL:', extractedProblemId);
        }
        
        // Store the extracted problemId for use in navigation
        if (extractedProblemId) {
            console.log('Final problemId to use:', extractedProblemId);
            setCurrentProblemId(extractedProblemId); // Store for navigation
            fetchProblem(extractedProblemId); // Fetch problem data for title
            fetchSolution(extractedProblemId); // Fetch solution data
        } else {
            console.warn('No problemId found in URL');
            setSolutionLoading(false);
            setSolution(null);
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleBack = () => {
        navigate('/practice/solve/1');
    };

    if (loading || solutionLoading) {
        return (
            <div className="ud-root">
                <aside className="ud-sidebar">
                    <div className="ud-logo">
                        <span className="byte">Byte</span>
                        <span className="arena">Arena</span>
                    </div>
                </aside>
                <main className="ud-main">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>{loading ? 'Loading user...' : 'Loading editorial...'}</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="ud-root">
                <aside className="ud-sidebar">
                    <div className="ud-logo">
                        <span className="byte">Byte</span>
                        <span className="arena">Arena</span>
                    </div>
                </aside>
                <main className="ud-main">
                    <div className="auth-container">
                        <h2>Please Login</h2>
                        <p>You need to be logged in to view editorial.</p>
                        <button onClick={() => navigate('/login')} className="login-btn">
                            Login
                        </button>
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
                                id="search-problems"
                                name="searchProblems"
                                placeholder="Search problems..." 
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

                <div className="sp-content">
                    {/* Problem Navbar */}
                    <div className="sp-navbar">
                        <div className="sp-navbar-left">
                            <button className="sp-nav-btn" onClick={() => navigate(`/practice/solve/${currentProblemId}`)}>
                                Problems
                            </button>
                            <button className="sp-nav-btn" onClick={() => {
                                console.log('Navigating to submissions for problem:', currentProblemId);
                                navigate(`/practice/submissions/${currentProblemId}`);
                            }}>
                                Submissions
                            </button>
                            <button className="sp-nav-btn active">
                                Editorial
                            </button>
                            <button className="sp-nav-btn" onClick={() => {
                                console.log('Navigating to leaderboard for problem:', currentProblemId);
                                navigate(`/practice/leaderboard/${currentProblemId}`);
                            }}>
                                Leaderboard
                            </button>
                        </div>
                    </div>

                    {/* Minimal Header */}
                    <div className="sp-header">
                        <div className="sp-title-section">
                            <h1 className="sp-title">Editorial - {problem?.problem_title || 'Loading Problem...'}</h1>
                        </div>
                    </div>

                    {/* Editorial Content */}
                    <div className="editorial-full-width">
                        {/* Problem Info Header - Full Width */}
                        <div className="problem-info-header">
                            <h2>{problem?.problem_title || 'Loading Problem...'}</h2>
                            <div className="problem-meta">
                                <span className={`difficulty-badge ${problem?.difficulty?.toLowerCase()}`}>
                                    {problem?.difficulty || 'Easy'}
                                </span>
                                <span className="points-badge">+{problem?.points || 100} points</span>
                                <span className="rating-badge">Rating: {problem?.problem_rating || '0.0'}/5.0</span>
                            </div>
                        </div>

                        {/* Editorial Content Grid - Two Columns Below Title */}
                        <div className="editorial-content-grid">
                            {/* Left Column - Editorial Sections */}
                            <div className="editorial-left-column">
                                {/* Editorial Sections */}
                                <div className="editorial-sections">
                                    {/* Solution Article */}
                                    <div className="editorial-section">
                                        <div className="section-header">
                                            <FaFileAlt />
                                            <h3>Solution Article</h3>
                                        </div>
                                        <div className="section-content">
                                            {solution?.solution_article ? (
                                                <div 
                                                    className="solution-article"
                                                    dangerouslySetInnerHTML={{ __html: solution.solution_article }}
                                                />
                                            ) : (
                                                <p className="no-content">Solution article not available for this problem.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Video Solution */}
                                    <div className="editorial-section">
                                        <div className="section-header">
                                            <FaVideo />
                                            <h3>Video Solution</h3>
                                        </div>
                                        <div className="section-content">
                                            {solution.video_link ? (
                                                <div className="video-container">
                                                    {(() => {
                                                        const videoUrl = solution.video_link;
                                                        const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
                                                        const isGoogleDrive = videoUrl.includes('drive.google.com');
                                                        
                                                        if (isYouTube) {
                                                            // Extract YouTube video ID
                                                            let videoId = '';
                                                            if (videoUrl.includes('youtu.be')) {
                                                                videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                                                            } else if (videoUrl.includes('youtube.com/watch')) {
                                                                videoId = videoUrl.split('v=')[1]?.split('&')[0];
                                                            } else if (videoUrl.includes('youtube.com/embed')) {
                                                                videoId = videoUrl.split('embed/')[1]?.split('?')[0];
                                                            }
                                                            
                                                            console.log('YouTube video ID:', videoId);
                                                            
                                                            return (
                                                                <div className="youtube-embed-container">
                                                                    <iframe
                                                                        src={`https://www.youtube.com/embed/${videoId}`}
                                                                        title="YouTube video player"
                                                                        frameBorder="0"
                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                        allowFullScreen
                                                                        className="youtube-iframe"
                                                                        onLoad={() => console.log('YouTube iframe loaded')}
                                                                    />
                                                                    <div style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                                                                        <p style={{ fontSize: '12px', margin: '0', color: '#666' }}>
                                                                            YouTube Video: <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>Open in YouTube</a>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        } else if (isGoogleDrive) {
                                                            // Handle Google Drive video with embed format
                                                            const fileId = videoUrl.match(/[-\w]{25,}/)?.[0];
                                                            const embedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : videoUrl;
                                                            
                                                            console.log('Google Drive file ID:', fileId);
                                                            console.log('Google Drive embed URL:', embedUrl);
                                                            
                                                            return (
                                                                <div className="google-drive-container">
                                                                    <iframe
                                                                        src={embedUrl}
                                                                        title="Google Drive video player"
                                                                        frameBorder="0"
                                                                        allow="autoplay; encrypted-media; picture-in-picture"
                                                                        allowFullScreen
                                                                        className="google-drive-iframe"
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '400px',
                                                                            border: 'none',
                                                                            borderRadius: '8px'
                                                                        }}
                                                                        onLoad={() => console.log('Google Drive iframe loaded')}
                                                                    />
                                                                    <div style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                                                                        <p style={{ fontSize: '12px', margin: '0', color: '#666' }}>
                                                                            Google Drive Video: <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>Open in Google Drive</a>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        } else {
                                                            // Regular video player for non-YouTube videos
                                                            return (
                                                                <>
                                                                    <video 
                                                                        controls 
                                                                        className="solution-video"
                                                                        preload="metadata"
                                                                        playsInline
                                                                        crossOrigin="anonymous"
                                                                        onError={(e) => {
                                                                            console.error('Video error:', e);
                                                                            console.error('Video error details:', e.target.error);
                                                                        }}
                                                                        onLoadStart={() => console.log('Video loading started:', videoUrl)}
                                                                        onCanPlay={() => console.log('Video can play')}
                                                                        onLoadedData={() => console.log('Video data loaded')}
                                                                        style={{ 
                                                                            width: '100%', 
                                                                            height: 'auto',
                                                                            maxHeight: '400px',
                                                                            backgroundColor: '#000'
                                                                        }}
                                                                    >
                                                                        <source src={videoUrl} type="video/mp4" />
                                                                        <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
                                                                        <source src={videoUrl.replace('.mp4', '.ogg')} type="video/ogg" />
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                    <div style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                                                                        <p style={{ fontSize: '12px', margin: '0', color: '#666' }}>
                                                                            Video URL: <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>{videoUrl}</a>
                                                                        </p>
                                                                    </div>
                                                                </>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                            ) : (
                                                <p className="no-content">Video solution not available for this problem.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Reference Implementation */}
                            <div className="editorial-right-column">
                                <div className="reference-implementation">
                                    <div className="section-header">
                                        <FaCode />
                                        <h3>Reference Implementation</h3>
                                    </div>
                                    <div className="section-content">
                                        {solution?.solution_code ? (
                                            <div className="code-blocks">
                                                <div className="code-block active">
                                                    <div className="code-header">
                                                        <span>Solution Code</span>
                                                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(solution.solution_code)}>
                                                            <FaCopy />
                                                            Copy
                                                        </button>
                                                    </div>
                                                    <pre><code>{solution.solution_code}</code></pre>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="no-content">Solution code not available for this problem.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Editorial;
