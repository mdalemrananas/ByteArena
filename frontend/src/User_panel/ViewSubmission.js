import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBook, FaCode, FaComments, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaBars, FaSearch, FaHome, FaBell, FaCommentAlt, FaCoins, FaUser, FaSignOutAlt, FaHome as FaHomeIcon, FaTrophy, FaCode as FaCodeIcon, FaListOl, FaCopy, FaDownload } from 'react-icons/fa';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './ViewSubmission.css';

const ViewSubmission = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [active, setActive] = useState('practice');
    const [submission, setSubmission] = useState({
        id: 1,
        status: "Accepted",
        time: "2.3s",
        memory: "45.2 MB",
        language: "Python",
        submittedAt: "2024-01-15 10:30:00",
        userId: "user123",
        problemName: "Two Sum",
        problemDescription: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        code: `def two_sum(nums, target):
    """
    Two Sum problem solution
    This function finds two numbers in the array that add up to the target.
    Time complexity: O(n)
    Space complexity: O(n)
    """
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []

# Example usage and test cases
def test_two_sum():
    # Test case 1
    nums = [2, 7, 11, 15]
    target = 9
    result = two_sum(nums, target)
    print(f"Test 1 - Input: {nums}, Target: {target}")
    print(f"Test 1 - Output: {result}")
    print(f"Test 1 - Expected: [0, 1]")
    print(f"Test 1 - Passed: {result == [0, 1]}")
    
    # Test case 2
    nums = [3, 2, 4]
    target = 6
    result = two_sum(nums, target)
    print(f"\\nTest 2 - Input: {nums}, Target: {target}")
    print(f"Test 2 - Output: {result}")
    print(f"Test 2 - Expected: [1, 2]")
    print(f"Test 2 - Passed: {result == [1, 2]}")
    
    # Test case 3
    nums = [3, 3]
    target = 6
    result = two_sum(nums, target)
    print(f"\\nTest 3 - Input: {nums}, Target: {target}")
    print(f"Test 3 - Output: {result}")
    print(f"Test 3 - Expected: [0, 1]")
    print(f"Test 3 - Passed: {result == [0, 1]}")

# Additional helper functions
def validate_input(nums, target):
    """Validate input parameters"""
    if not isinstance(nums, list):
        raise ValueError("nums must be a list")
    if not isinstance(target, (int, float)):
        raise ValueError("target must be a number")
    if len(nums) < 2:
        raise ValueError("nums must contain at least 2 elements")
    return True

def main():
    """Main function to run the solution"""
    try:
        # Example from problem statement
        nums = [2, 7, 11, 15]
        target = 9
        validate_input(nums, target)
        
        result = two_sum(nums, target)
        print(f"Indices: {result}")
        print(f"Numbers: {nums[result[0]]} + {nums[result[1]]} = {target}")
        
        # Run test cases
        test_two_sum()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()`,
        input: "Input: nums = [2,7,11,15], target = 9",
        output: "Output: [0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    });
    const { submissionId } = useParams();
    const navigate = useNavigate();

    const menuItems = [
        { key: 'home', name: 'Home', icon: <FaHomeIcon className="menu-icon" /> },
        { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
        { key: 'practice', name: 'Practice Problem', icon: <FaCodeIcon className="menu-icon" /> },
        { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
        { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
    ];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Accepted':
                return <FaCheckCircle className="status-icon accepted" />;
            case 'Wrong Answer':
                return <FaTimesCircle className="status-icon wrong" />;
            case 'Time Limit Exceeded':
                return <FaClock className="status-icon timeout" />;
            case 'Runtime Error':
                return <FaTimesCircle className="status-icon error" />;
            default:
                return <FaClock className="status-icon pending" />;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Accepted':
                return 'status-accepted';
            case 'Wrong Answer':
                return 'status-wrong';
            case 'Time Limit Exceeded':
                return 'status-timeout';
            case 'Runtime Error':
                return 'status-error';
            default:
                return 'status-pending';
        }
    };

    const handleBack = () => {
        navigate('/submissions');
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(submission.code);
        alert('Code copied to clipboard!');
    };

    const handleDownloadCode = () => {
        const blob = new Blob([submission.code], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `submission_${submission.id}.${submission.language.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
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
                        <p>Loading...</p>
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
                        <p>You need to be logged in to view submissions.</p>
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
                            <input type="text" placeholder="Search problems..." />
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
                            <button className="sp-nav-btn" onClick={handleBack}>
                                Problems
                            </button>
                            <button className="sp-nav-btn" onClick={handleBack}>
                                Submissions
                            </button>
                            <button className="sp-nav-btn active">
                                View Code
                            </button>
                            <button className="sp-nav-btn" onClick={() => navigate('/editorial')}>
                                Editorial
                            </button>
                            <button className="sp-nav-btn" onClick={() => navigate('/individual-leaderboard')}>
                                Leaderboard
                            </button>
                        </div>
                    </div>

                    {/* Minimal Header */}
                    <div className="sp-header">
                        <div className="sp-title-section">
                            <h1 className="sp-title">Submission #{submission.id}</h1>
                        </div>
                    </div>

                    {/* Submission Details */}
                    <div className="submission-view-full-width">
                        <div className="submission-info-card">
                            <div className="submission-header-info">
                                <div className="submission-status-row">
                                    <div className="status-content">
                                        {getStatusIcon(submission.status)}
                                        <span className="status-text">{submission.status}</span>
                                    </div>
                                    <div className="submission-meta">
                                        <span className="submission-language-badge">{submission.language}</span>
                                    </div>
                                </div>
                                <div className="submission-problem-info">
                                    <h3>{submission.problemName}</h3>
                                    <p className="submission-date">Submitted at: {submission.submittedAt}</p>
                                </div>
                            </div>
                        </div>

                        <div className="submission-content-grid">
                            {/* Code Section - Full Width */}
                            <div className="submission-code-section full-width">
                                <div className="code-section-header">
                                    <div className="section-title">
                                        <FaCode />
                                        <h2>Code</h2>
                                    </div>
                                    <div className="code-actions">
                                        <button className="code-action-btn" onClick={handleCopyCode}>
                                            <FaCopy />
                                            Copy
                                        </button>
                                        <button className="code-action-btn" onClick={handleDownloadCode}>
                                            <FaDownload />
                                            Download
                                        </button>
                                    </div>
                                </div>
                                <div className="code-editor-container">
                                    <div className="code-editor">
                                        <div className="code-content">
                                            <pre><code>{submission.code}</code></pre>
                                        </div>
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

export default ViewSubmission;
