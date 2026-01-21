import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { 
  getAllUsers, 
  getUserById,
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus,
  updateUserRole 
} from '../services/User_Management_Service';
import {
  FaBars,
  FaBell,
  FaCode,
  FaChartLine,
  FaHome,
  FaSearch,
  FaSignOutAlt,
  FaStar,
  FaTrophy,
  FaUser,
  FaUsers,
  FaChartBar,
  FaCog,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaUserEdit,
  FaTrash,
  FaMedal,
  FaEye,
  FaBan,
  FaCheckCircle,
} from 'react-icons/fa';
import './UserManagement.css';

const menuItems = [
  { key: 'home', name: 'Dashboard', icon: <FaHome className="menu-icon" /> },
  { key: 'users', name: 'User Management', icon: <FaUsers className="menu-icon" /> },
  { key: 'contests', name: 'Contests', icon: <FaTrophy className="menu-icon" /> },
  { key: 'problems', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaMedal className="menu-icon" /> },
  { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const mockUsers = [
  {
    id: 1,
    username: 'John Doe',
    email: 'john.doe@example.com',
    level: 12,
    problemsSolved: 45,
    status: 'Active',
    avatar: '👨‍💼',
    country: '🇺🇸'
  },
  {
    id: 2,
    username: 'Jane Smith',
    email: 'jane.smith@example.com',
    level: 8,
    problemsSolved: 32,
    status: 'Active',
    avatar: '👩‍💻',
    country: '🇬🇧'
  },
  {
    id: 3,
    username: 'Mike Johnson',
    email: 'mike.j@example.com',
    level: 15,
    problemsSolved: 67,
    status: 'Active',
    avatar: '👨‍🎓',
    country: '🇨🇦'
  },
  {
    id: 4,
    username: 'Sarah Williams',
    email: 'sarah.w@example.com',
    level: 6,
    problemsSolved: 23,
    status: 'Active',
    avatar: '👩‍🎨',
    country: '🇦🇺'
  },
  {
    id: 5,
    username: 'David Brown',
    email: 'david.b@example.com',
    level: 10,
    problemsSolved: 41,
    status: 'Active',
    avatar: '👨‍🔬',
    country: '🇩🇪'
  },
  {
    id: 6,
    username: 'Emma Davis',
    email: 'emma.d@example.com',
    level: 9,
    problemsSolved: 38,
    status: 'Active',
    avatar: '👩‍🏫',
    country: '🇫🇷'
  },
  {
    id: 7,
    username: 'Chris Wilson',
    email: 'chris.w@example.com',
    level: 11,
    problemsSolved: 49,
    status: 'Active',
    avatar: '👨‍🏭',
    country: '🇯🇵'
  },
  {
    id: 8,
    username: 'Lisa Anderson',
    email: 'lisa.a@example.com',
    level: 7,
    problemsSolved: 28,
    status: 'Active',
    avatar: '👩‍⚕️',
    country: '🇧🇷'
  },
  {
    id: 9,
    username: 'Tom Martinez',
    email: 'tom.m@example.com',
    level: 13,
    problemsSolved: 56,
    status: 'Active',
    avatar: '👨‍🎭',
    country: '🇲🇽'
  },
  {
    id: 10,
    username: 'Amy Taylor',
    email: 'amy.t@example.com',
    level: 5,
    problemsSolved: 19,
    status: 'Active',
    avatar: '👩‍🌾',
    country: '🇮🇹'
  },
  {
    id: 11,
    username: 'Robert Lee',
    email: 'robert.l@example.com',
    level: 14,
    problemsSolved: 61,
    status: 'Active',
    avatar: '👨‍🍳',
    country: '🇰🇷'
  },
  {
    id: 12,
    username: 'Nina Patel',
    email: 'nina.p@example.com',
    level: 4,
    problemsSolved: 15,
    status: 'Active',
    avatar: '👩‍🔧',
    country: '🇮🇳'
  },
  {
    id: 13,
    username: 'Kevin White',
    email: 'kevin.w@example.com',
    level: 8,
    problemsSolved: 33,
    status: 'Active',
    avatar: '👨‍🚀',
    country: '🇷🇺'
  },
  {
    id: 14,
    username: 'Olivia Harris',
    email: 'olivia.h@example.com',
    level: 16,
    problemsSolved: 72,
    status: 'Active',
    avatar: '👩‍🎯',
    country: '🇪🇸'
  },
  {
    id: 15,
    username: 'James Clark',
    email: 'james.c@example.com',
    level: 3,
    problemsSolved: 11,
    status: 'Active',
    avatar: '👨‍🎪',
    country: '🇳🇱'
  }
];

function UserManagement() {
  const navigate = useNavigate();
  const [active, setActive] = useState('users');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', email: '', role: 'user' });
  const [error, setError] = useState('');

  // Fetch users from database
  const fetchUsers = async () => {
    setUsersLoading(true);
    setError('');
    try {
      const result = await getAllUsers(currentPage, usersPerPage, searchTerm, filter);
      if (result.success) {
        setUsers(result.data);
        setTotalUsers(result.totalCount);
        setTotalPages(result.totalPages);
      } else {
        setError(result.error);
        console.error('Error fetching users:', result.error);
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, currentPage, searchTerm, filter]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user) {
        setCurrentPage(1); // Reset to first page on search
        fetchUsers();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle filter change
  useEffect(() => {
    if (user) {
      setCurrentPage(1); // Reset to first page on filter change
      fetchUsers();
    }
  }, [filter]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleViewUser = async (userId) => {
    try {
      const result = await getUserById(userId);
      if (result.success) {
        setSelectedUser(result.data);
        setShowViewModal(true);
      } else {
        alert('Error fetching user details: ' + result.error);
      }
    } catch (error) {
      alert('Error fetching user details: ' + error.message);
    }
  };

  const handleEditUser = async (userId) => {
    console.log('Edit user:', userId);
    // For now, just log - you can implement edit modal here
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const result = await toggleUserStatus(userId, !currentStatus);
      if (result.success) {
        fetchUsers(); // Refresh the list
      } else {
        alert('Error toggling user status: ' + result.error);
      }
    } catch (error) {
      alert('Error toggling user status: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const result = await deleteUser(userId);
        if (result.success) {
          fetchUsers(); // Refresh the list
        } else {
          alert('Error deleting user: ' + result.error);
        }
      } catch (error) {
        alert('Error deleting user: ' + error.message);
      }
    }
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      const result = await createUser(newUser);
      if (result.success) {
        // Reset form and close modal
        setNewUser({ username: '', email: '', role: 'user' });
        setShowCreateModal(false);
        fetchUsers(); // Refresh the list
      } else {
        alert('Error creating user: ' + result.error);
      }
    } catch (error) {
      alert('Error creating user: ' + error.message);
    }
  };

  const handleCloseModal = () => {
    setNewUser({ username: '', email: '', role: 'user' });
    setShowCreateModal(false);
  };

  const handleCloseViewModal = () => {
    setSelectedUser(null);
    setShowViewModal(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
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
              <input type="text" placeholder="Search users, contests, problems..." />
            </div>
          </div>
          <div className="ud-topbar-right">
            <button className="icon-btn" data-tooltip="Notifications">
              <FaBell />
              <span className="badge">8</span>
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

        <div className="um-content">
          <div className="um-header">
            <h1>User Management</h1>
            <p>Manage users and their permissions in the system.</p>
          </div>

          {error && (
            <div className="error-message" style={{ 
              backgroundColor: '#fee', 
              color: '#c00', 
              padding: '10px', 
              borderRadius: '5px', 
              marginBottom: '20px' 
            }}>
              {error}
            </div>
          )}

          <div className="um-controls">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filter-dropdown"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
            <button 
              className="create-user-btn"
              onClick={handleCreateUser}
              data-tooltip="Create New User"
            >
              <FaPlus />
              Create User
            </button>
          </div>

          <div className="um-table-container">
            {usersLoading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>Loading users...</div>
            ) : users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>No users found</div>
            ) : (
              <table className="um-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem, index) => (
                    <tr key={userItem.id}>
                      <td>{indexOfFirstUser + index + 1}</td>
                      <td className="username-cell">
                        <div className="user-info">
                          <span className="avatar">{userItem.avatar_url ? <img src={userItem.avatar_url} alt="avatar" style={{ width: '30px', height: '30px', borderRadius: '50%' }} /> : '👤'}</span>
                          <div className="user-details">
                            <span className="username">{userItem.username || userItem.display_name || 'N/A'}</span>
                            <span className="country">{userItem.country || '🌍'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{userItem.email}</td>
                      <td>
                        <span className={`role-badge ${userItem.role}`}>
                          {userItem.role || 'user'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="view-btn"
                            onClick={() => handleViewUser(userItem.id)}
                            data-tooltip="View User"
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditUser(userItem.id)}
                            data-tooltip="Edit User"
                          >
                            <FaUserEdit />
                          </button>
                          <button 
                            className={`status-btn ${userItem.is_active ? 'disable' : 'enable'}`}
                            onClick={() => handleToggleUserStatus(userItem.id, userItem.is_active)}
                            data-tooltip={userItem.is_active ? 'Disable User' : 'Enable User'}
                          >
                            {userItem.is_active ? <FaCheckCircle /> : <FaBan />}
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteUser(userItem.id)}
                            data-tooltip="Delete User"
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

          <div className="um-pagination">
            <div className="pagination-info">
              Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, totalUsers)} of {totalUsers} users
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Create New User</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitUser} className="modal-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="modal-close-btn" onClick={handleCloseViewModal}>
                ×
              </button>
            </div>
            <div className="modal-content">
              {/* User Header */}
              <div className="user-header">
                <div className="user-avatar">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="avatar" />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">
                    {selectedUser.username || selectedUser.display_name || 'N/A'}
                  </div>
                  <div className="user-email">{selectedUser.email}</div>
                  <div className="user-role-badge">
                    {selectedUser.role || 'user'}
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="user-stats">
                <div className="stat-item">
                  <div className="stat-value">{selectedUser.rating || 1000}</div>
                  <div className="stat-label">Rating</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{selectedUser.wins || 0}</div>
                  <div className="stat-label">Wins</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{selectedUser.matches_played || 0}</div>
                  <div className="stat-label">Matches</div>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="user-details-grid">
                <div className="detail-item">
                  <label>User ID</label>
                  <span>{selectedUser.id}</span>
                </div>
                <div className="detail-item">
                  <label>Display Name</label>
                  <span>{selectedUser.display_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Country</label>
                  <span>{selectedUser.country || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status ${selectedUser.is_active ? 'active' : 'inactive'}`}>
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Verification</label>
                  <span className={`status ${selectedUser.is_verified ? 'verified' : 'unverified'}`}>
                    {selectedUser.is_verified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Losses</label>
                  <span>{selectedUser.losses || 0}</span>
                </div>
                <div className="detail-item">
                  <label>Created At</label>
                  <span>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Last Login</label>
                  <span>{new Date(selectedUser.last_login).toLocaleDateString()}</span>
                </div>
                {selectedUser.website && (
                  <div className="detail-item full-width">
                    <label>Website</label>
                    <span>{selectedUser.website}</span>
                  </div>
                )}
                {selectedUser.bio && (
                  <div className="detail-item full-width">
                    <label>Bio</label>
                    <span>{selectedUser.bio}</span>
                  </div>
                )}
                {selectedUser.skills && selectedUser.skills.length > 0 && (
                  <div className="detail-item full-width">
                    <label>Skills</label>
                    <span>{selectedUser.skills.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleCloseViewModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
