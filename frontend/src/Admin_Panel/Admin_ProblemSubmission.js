import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBook, FaCode, FaComments, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaBars, FaSearch, FaHome, FaBell, FaCommentAlt, FaCoins, FaUser, FaSignOutAlt, FaHome as FaHomeIcon, FaTrophy, FaCode as FaCodeIcon, FaListOl, FaTrash, FaEdit } from 'react-icons/fa';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
    getSubmissionsByProblemId,
    getSubmissionById,
    updateSubmissionStatus,
    deleteSubmission,
    getAllSubmissions,
    searchSubmissions,
    getSubmissionStatistics,
    bulkUpdateSubmissionsStatus,
    bulkDeleteSubmissions
} from '../services/Admin_Problem_Submission_Service';
import { logoutUser } from '../services/authService';
import './Admin_Dashboard.css';
import './Admin_ProblemSubmission.css';

const Admin_ProblemSubmission = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [active, setActive] = useState('problems');
    const [submissions, setSubmissions] = useState([]);
    const [error, setError] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [submissionToDelete, setSubmissionToDelete] = useState(null);
    const { problemId } = useParams();
    const navigate = useNavigate();

    const menuItems = [
        { key: 'home', name: 'Dashboard', icon: <FaHomeIcon className="menu-icon" /> },
        { key: 'users', name: 'User Management', icon: <FaUser className="menu-icon" /> },
        { key: 'contests', name: 'Contests', icon: <FaTrophy className="menu-icon" /> },
        { key: 'problems', name: 'Practice Problem', icon: <FaCodeIcon className="menu-icon" /> },
        { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
        { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
    ];

    // Fetch submissions data
    const fetchSubmissions = async () => {
        try {
            setError(null);
            // Get all submissions for this problem
            const result = await getSubmissionsByProblemId(problemId, 1, 100); // Get up to 100 submissions
            
            if (result.success) {
                setSubmissions(result.data || []);
            } else {
                setError(result.error);
                console.error('Error fetching submissions:', result.error);
            }
        } catch (error) {
            setError('Failed to load submissions');
            console.error('Unexpected error:', error);
        }
    };

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

    useEffect(() => {
        if (user) {
            fetchSubmissions();
        }
    }, [user, problemId]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Accepted':
                return <FaCheckCircle className="admin-status-icon accepted" />;
            case 'Wrong Answer':
                return <FaTimesCircle className="admin-status-icon wrong" />;
            case 'Time Limit Exceeded':
                return <FaClock className="admin-status-icon timeout" />;
            case 'Runtime Error':
                return <FaTimesCircle className="admin-status-icon error" />;
            default:
                return <FaClock className="admin-status-icon pending" />;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Accepted':
                return 'admin-status-accepted';
            case 'Wrong Answer':
                return 'admin-status-wrong';
            case 'Time Limit Exceeded':
                return 'admin-status-timeout';
            case 'Runtime Error':
                return 'admin-status-error';
            default:
                return 'admin-status-pending';
        }
    };

    const handleViewCode = (submissionId) => {
        navigate(`/admin/submissions/view/${submissionId}`);
    };

    const handleBack = () => {
        navigate('/admin_problems');
    };

    const handleDeleteSubmission = async (submissionId) => {
        // Show custom delete dialog
        setSubmissionToDelete(submissionId);
        setShowDeleteDialog(true);
    };

    const confirmDeleteSubmission = async () => {
        if (submissionToDelete) {
            try {
                const result = await deleteSubmission(submissionToDelete);
                if (result.success) {
                    setSubmissions(prev => prev.filter(sub => sub.submission_id !== submissionToDelete));
                    setShowDeleteDialog(false);
                    setSubmissionToDelete(null);
                } else {
                    alert('Failed to delete submission: ' + result.error);
                }
            } catch (error) {
                console.error('Error deleting submission:', error);
                alert('Error deleting submission: ' + error.message);
            }
        }
    };

    const cancelDeleteSubmission = () => {
        setShowDeleteDialog(false);
        setSubmissionToDelete(null);
    };

    if (loading) {
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
                        <p>Loading...</p>
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
                            <input type="text" placeholder="Search submissions..." />
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
                                navigate(`/admin_problems/${problemId}`);
                            }}>
                                Problems
                            </button>
                            <button className="admin-sp-nav-btn active">
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

                    {/* Minimal Header */}
                    <div className="admin-sp-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <div className="admin-sp-title-section" style={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <h1 className="admin-sp-title" style={{ margin: 0 }}>
                                Problem Submissions
                            </h1>
                        </div>
                    </div>

                    {/* Submissions Table Only */}
                    <div className="admin-submissions-full-width">
                        {error && (
                            <div className="admin-sp-error" style={{
                                backgroundColor: '#fee',
                                color: '#dc2626',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                border: '1px solid #fecaca'
                            }}>
                                <strong>Error:</strong> {error}
                                <button 
                                    onClick={fetchSubmissions}
                                    style={{
                                        marginLeft: '10px',
                                        padding: '4px 8px',
                                        backgroundColor: '#dc2626',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                        
                        <div className="admin-submissions-table-wrapper">
                            {submissions.length === 0 && !error ? (
                                <div className="admin-sp-empty" style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    color: '#64748b',
                                    fontSize: '16px'
                                }}>
                                    <FaBook style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }} />
                                    <div>No submissions found</div>
                                    <div style={{ fontSize: '14px', marginTop: '8px' }}>
                                        Users haven't submitted any solutions for this problem yet.
                                    </div>
                                </div>
                            ) : (
                                <table className="admin-submissions-table">
                                    <thead>
                                        <tr>
                                            <th>Submission ID</th>
                                            <th>User</th>
                                            <th>Status</th>
                                            <th>Language</th>
                                            <th>Submitted At</th>
                                            <th>Points</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map((submission) => (
                                            <tr key={submission.submission_id} className={`admin-submission-row ${getStatusClass(submission.submission_status)}`}>
                                                <td className="admin-submission-id">#{submission.submission_id?.slice(0, 8) || submission.id}</td>
                                                <td className="admin-submission-user">
                                                    <div className="admin-user-info">
                                                        <div className="admin-user-name">{submission.problem_solver_name || 'Unknown User'}</div>
                                                    </div>
                                                </td>
                                                <td className="admin-submission-status">
                                                    <div className="admin-status-content">
                                                        {getStatusIcon(submission.submission_status)}
                                                        <span>{submission.submission_status}</span>
                                                    </div>
                                                </td>
                                                <td className="admin-submission-language">{submission.language}</td>
                                                <td className="admin-submission-date">
                                                    {new Date(submission.submitted_at).toLocaleString()}
                                                </td>
                                                <td className="admin-submission-points">
                                                    {submission.submission_status === 'Accepted' ? `+${submission.points || 100}` : '0'}
                                                </td>
                                                <td className="admin-submission-actions">
                                                    <div className="admin-action-buttons">
                                                        <button 
                                                            className="admin-view-code-btn"
                                                            onClick={() => handleViewCode(submission.submission_id)}
                                                            title="View Code"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        <button 
                                                            className="admin-delete-btn"
                                                            onClick={() => handleDeleteSubmission(submission.submission_id)}
                                                            title="Delete Submission"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="delete-dialog-overlay">
                    <div className="delete-dialog">
                        <div className="delete-dialog-header">
                            <h3>Confirm Delete</h3>
                        </div>
                        <div className="delete-dialog-body">
                            <p>Are you sure you want to delete this submission?</p>
                            <p style={{ color: '#ef4444', fontSize: '14px' }}>This action cannot be undone.</p>
                        </div>
                        <div className="delete-dialog-footer">
                            <button className="cancel-btn" onClick={cancelDeleteSubmission}>
                                Cancel
                            </button>
                            <button className="confirm-delete-btn" onClick={confirmDeleteSubmission}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin_ProblemSubmission;
