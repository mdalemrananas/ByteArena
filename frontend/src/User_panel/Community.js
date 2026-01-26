import React, { useState } from 'react';
import {
    FaSearch, FaFire, FaTrophy, FaUsers, FaComments, FaHeart, FaRegHeart,
    FaComment, FaShare, FaBookmark, FaRegBookmark, FaUserCircle, FaClock,
    FaChevronRight, FaFilter, FaSortAmountDown, FaPlus, FaEye, FaCode,
    FaLightbulb, FaQuestionCircle, FaNewspaper
} from 'react-icons/fa';
import Navbar from '../components/Header';
import Footer from '../components/Footer';

const Community = ({ onSignInClick, onGetStartedClick }) => {
    const [activeTab, setActiveTab] = useState('discussions');
    const [selectedFilter, setSelectedFilter] = useState('trending');
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    const discussions = [
        {
            id: 1,
            author: 'Fatima Rahman',
            avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
            title: 'Dynamic Programming: Mastering the Knapsack Problem',
            content: 'After struggling with DP for months, I finally cracked the knapsack problem! Here\'s my approach and some tips that helped me understand it better...',
            category: 'Algorithm',
            tags: ['Dynamic Programming', 'Interview Prep', 'Beginner'],
            likes: 234,
            comments: 45,
            views: 1230,
            timeAgo: '2 hours ago',
            trending: true
        },
        {
            id: 2,
            author: 'Mohammad Hassan',
            avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
            title: 'My Journey from Beginner to Google SWE',
            content: 'Sharing my 18-month journey of learning data structures and algorithms. What worked, what didn\'t, and resources that made a difference...',
            category: 'Career',
            tags: ['Career Advice', 'FAANG', 'Success Story'],
            likes: 567,
            comments: 89,
            views: 3450,
            timeAgo: '5 hours ago',
            trending: true
        },
        {
            id: 3,
            author: 'Ayesha Siddiqui',
            avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
            title: 'Graph Algorithms Cheat Sheet',
            content: 'Created a comprehensive cheat sheet for common graph algorithms including BFS, DFS, Dijkstra, and more. Hope this helps!',
            category: 'Resource',
            tags: ['Graphs', 'Cheat Sheet', 'Reference'],
            likes: 892,
            comments: 123,
            views: 5670,
            timeAgo: '1 day ago',
            trending: true
        },
        {
            id: 4,
            author: 'Abdul Karim',
            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            title: 'Tips for Optimizing Your Code for Competitive Programming',
            content: 'Speed matters in competitions! Here are some C++ optimization techniques that have helped me reduce runtime significantly...',
            category: 'Tips & Tricks',
            tags: ['C++', 'Optimization', 'Competition'],
            likes: 456,
            comments: 67,
            views: 2340,
            timeAgo: '3 days ago',
            trending: false
        },
        {
            id: 5,
            author: 'Nusrat Jahan',
            avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
            title: 'Study Group: LeetCode Weekly Contest Discussion',
            content: 'Let\'s discuss this week\'s contest problems! What approaches did you use? Share your solutions and learn from each other...',
            category: 'Discussion',
            tags: ['LeetCode', 'Contest', 'Study Group'],
            likes: 178,
            comments: 92,
            views: 890,
            timeAgo: '6 hours ago',
            trending: false
        }
    ];

    const trendingTopics = [
        { name: 'Dynamic Programming', count: 1234, trend: '+12%' },
        { name: 'System Design', count: 892, trend: '+8%' },
        { name: 'Graph Algorithms', count: 756, trend: '+15%' },
        { name: 'Interview Prep', count: 645, trend: '+5%' },
        { name: 'Competitive Programming', count: 534, trend: '+20%' }
    ];

    const upcomingEvents = [
        {
            id: 1,
            title: 'Weekly Coding Contest',
            date: 'Jan 28, 2026',
            time: '8:00 PM EST',
            participants: 1234,
            type: 'Contest'
        },
        {
            id: 2,
            title: 'Webinar: Advanced Graph Theory',
            date: 'Jan 30, 2026',
            time: '6:00 PM EST',
            participants: 567,
            type: 'Webinar'
        },
        {
            id: 3,
            title: 'Mock Interview Sessions',
            date: 'Feb 2, 2026',
            time: '7:00 PM EST',
            participants: 234,
            type: 'Workshop'
        }
    ];

    const toggleLike = (postId) => {
        const newLiked = new Set(likedPosts);
        if (newLiked.has(postId)) {
            newLiked.delete(postId);
        } else {
            newLiked.add(postId);
        }
        setLikedPosts(newLiked);
    };

    const toggleBookmark = (postId) => {
        const newBookmarked = new Set(bookmarkedPosts);
        if (newBookmarked.has(postId)) {
            newBookmarked.delete(postId);
        } else {
            newBookmarked.add(postId);
        }
        setBookmarkedPosts(newBookmarked);
    };

    const styles = {
        community: {
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            fontFamily: 'Helvetica, Arial, sans-serif'
        },
        heroSection: {
            background: `linear-gradient(rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8)), url('https://images.prismic.io/turing/652ebbd4fbd9a45bcec8180a_Using_Python_for_competitive_coding_11zon_1_a3583180f7.webp?auto=format%2Ccompress&fit=max&w=3840')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            padding: '120px 20px 80px',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        },
        heroContent: {
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 2
        },
        heroTitle: {
            fontSize: '3.5rem',
            fontWeight: '800',
            color: '#1b0000ff',
            marginBottom: '20px',
            lineHeight: '1.2'
        },
        heroSubtitle: {
            fontSize: '1.25rem',
            color: '#f8fafc',
            opacity: 0.95,
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px'
        },
        heroStats: {
            display: 'flex',
            justifyContent: 'center',
            gap: '60px',
            flexWrap: 'wrap',
            marginTop: '50px'
        },
        statItem: {
            textAlign: 'center'
        },
        statValue: {
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        statLabel: {
            fontSize: '1rem',
            opacity: 0.9
        },
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '40px 20px'
        },
        mainContent: {
            display: 'grid',
            gridTemplateColumns: '1fr 350px',
            gap: '30px',
            alignItems: 'start'
        },
        leftSection: {
            flex: 1
        },
        searchBar: {
            position: 'relative',
            marginBottom: '30px'
        },
        searchInput: {
            width: '100%',
            padding: '16px 50px 16px 50px',
            fontSize: '1rem',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: 'white'
        },
        searchIcon: {
            position: 'absolute',
            left: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            fontSize: '1.2rem'
        },
        filterBar: {
            display: 'flex',
            gap: '15px',
            marginBottom: '30px',
            flexWrap: 'wrap',
            alignItems: 'center'
        },
        filterBtn: {
            padding: '10px 20px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748b'
        },
        filterBtnActive: {
            backgroundColor: '#667eea',
            color: 'white',
            borderColor: '#667eea'
        },
        newPostBtn: {
            marginLeft: 'auto',
            padding: '12px 24px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
        },
        discussionCard: {
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            border: '1px solid #f1f5f9'
        },
        discussionHeader: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
        },
        avatar: {
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            marginRight: '12px',
            objectFit: 'cover'
        },
        authorInfo: {
            flex: 1
        },
        authorName: {
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '4px'
        },
        timeAgo: {
            fontSize: '0.875rem',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        },
        trendingBadge: {
            backgroundColor: '#fef3c7',
            color: '#f59e0b',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        },
        categoryTag: {
            backgroundColor: '#e0e7ff',
            color: '#667eea',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: '600',
            marginLeft: '8px'
        },
        discussionTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '12px',
            lineHeight: '1.4',
            cursor: 'pointer',
            transition: 'color 0.2s ease'
        },
        discussionContent: {
            fontSize: '1rem',
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '16px'
        },
        tags: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px'
        },
        tag: {
            backgroundColor: '#f1f5f9',
            color: '#475569',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '500'
        },
        discussionFooter: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9'
        },
        actionButtons: {
            display: 'flex',
            gap: '20px'
        },
        actionBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: 'none',
            background: 'none',
            padding: '6px 12px',
            borderRadius: '6px'
        },
        actionBtnActive: {
            color: '#667eea'
        },
        sidebar: {
            position: 'sticky',
            top: '100px'
        },
        sidebarCard: {
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #f1f5f9'
        },
        sidebarTitle: {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        topicItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid #f1f5f9',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        topicName: {
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#475569',
            flex: 1
        },
        topicCount: {
            fontSize: '0.875rem',
            color: '#94a3b8',
            marginRight: '12px'
        },
        trendTag: {
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600'
        },
        eventCard: {
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            marginBottom: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid #e2e8f0'
        },
        eventType: {
            display: 'inline-block',
            backgroundColor: '#667eea',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            marginBottom: '8px'
        },
        eventTitle: {
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '8px'
        },
        eventDetails: {
            fontSize: '0.875rem',
            color: '#64748b',
            marginBottom: '8px'
        },
        eventParticipants: {
            fontSize: '0.875rem',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        '@media (max-width: 1024px)': {
            mainContent: {
                gridTemplateColumns: '1fr'
            },
            sidebar: {
                position: 'relative',
                top: 0
            },
            heroTitle: {
                fontSize: '2.5rem'
            }
        }
    };

    const filteredDiscussions = discussions.filter(discussion => {
        const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (selectedFilter === 'trending') {
            return matchesSearch && discussion.trending;
        }
        return matchesSearch;
    });

    return (
        <div style={styles.community}>
            <Navbar onSignInClick={onSignInClick} onGetStartedClick={onGetStartedClick} />

            {/* Hero Section */}
            <section style={styles.heroSection}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>Join Our Developer Community</h1>
                    <p style={styles.heroSubtitle}>
                        Connect, learn, and grow with thousands of passionate developers worldwide
                    </p>
                    
                    <div style={styles.heroStats}>
                        <div style={styles.statItem}>
                            <div style={styles.statValue}>
                                <FaUsers />
                                50K+
                            </div>
                            <div style={styles.statLabel}>Active Members</div>
                        </div>
                        <div style={styles.statItem}>
                            <div style={styles.statValue}>
                                <FaComments />
                                10K+
                            </div>
                            <div style={styles.statLabel}>Discussions</div>
                        </div>
                        <div style={styles.statItem}>
                            <div style={styles.statValue}>
                                <FaTrophy />
                                500+
                            </div>
                            <div style={styles.statLabel}>Weekly Contests</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div style={styles.container}>
                <div style={styles.mainContent}>
                    {/* Left Section - Discussions */}
                    <div style={styles.leftSection}>
                        {/* Search Bar */}
                        <div style={styles.searchBar}>
                            <FaSearch style={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search discussions, topics, or tags..."
                                style={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>

                        {/* Filter Bar */}
                        <div style={styles.filterBar}>
                            <button
                                style={{
                                    ...styles.filterBtn,
                                    ...(selectedFilter === 'trending' ? styles.filterBtnActive : {})
                                }}
                                onClick={() => setSelectedFilter('trending')}
                                onMouseEnter={(e) => {
                                    if (selectedFilter !== 'trending') {
                                        e.target.style.backgroundColor = '#f8fafc';
                                        e.target.style.borderColor = '#cbd5e1';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedFilter !== 'trending') {
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.borderColor = '#e2e8f0';
                                    }
                                }}
                            >
                                <FaFire /> Trending
                            </button>
                            <button
                                style={{
                                    ...styles.filterBtn,
                                    ...(selectedFilter === 'recent' ? styles.filterBtnActive : {})
                                }}
                                onClick={() => setSelectedFilter('recent')}
                                onMouseEnter={(e) => {
                                    if (selectedFilter !== 'recent') {
                                        e.target.style.backgroundColor = '#f8fafc';
                                        e.target.style.borderColor = '#cbd5e1';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedFilter !== 'recent') {
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.borderColor = '#e2e8f0';
                                    }
                                }}
                            >
                                <FaClock /> Recent
                            </button>
                            <button
                                style={{
                                    ...styles.filterBtn,
                                    ...(selectedFilter === 'popular' ? styles.filterBtnActive : {})
                                }}
                                onClick={() => setSelectedFilter('popular')}
                                onMouseEnter={(e) => {
                                    if (selectedFilter !== 'popular') {
                                        e.target.style.backgroundColor = '#f8fafc';
                                        e.target.style.borderColor = '#cbd5e1';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedFilter !== 'popular') {
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.borderColor = '#e2e8f0';
                                    }
                                }}
                            >
                                <FaTrophy /> Popular
                            </button>

                            <button
                                style={styles.newPostBtn}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#5568d3';
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#667eea';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <FaPlus /> New Discussion
                            </button>
                        </div>

                        {/* Discussion Cards */}
                        {filteredDiscussions.map((discussion) => (
                            <div
                                key={discussion.id}
                                style={styles.discussionCard}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {/* Header */}
                                <div style={styles.discussionHeader}>
                                    <img
                                        src={discussion.avatar}
                                        alt={discussion.author}
                                        style={styles.avatar}
                                    />
                                    <div style={styles.authorInfo}>
                                        <div style={styles.authorName}>{discussion.author}</div>
                                        <div style={styles.timeAgo}>
                                            <FaClock /> {discussion.timeAgo}
                                        </div>
                                    </div>
                                    {discussion.trending && (
                                        <div style={styles.trendingBadge}>
                                            <FaFire /> Trending
                                        </div>
                                    )}
                                    <span style={styles.categoryTag}>{discussion.category}</span>
                                </div>

                                {/* Title */}
                                <h3
                                    style={styles.discussionTitle}
                                    onMouseEnter={(e) => e.target.style.color = '#667eea'}
                                    onMouseLeave={(e) => e.target.style.color = '#1e293b'}
                                >
                                    {discussion.title}
                                </h3>

                                {/* Content */}
                                <p style={styles.discussionContent}>{discussion.content}</p>

                                {/* Tags */}
                                <div style={styles.tags}>
                                    {discussion.tags.map((tag, index) => (
                                        <span key={index} style={styles.tag}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div style={styles.discussionFooter}>
                                    <div style={styles.actionButtons}>
                                        <button
                                            style={{
                                                ...styles.actionBtn,
                                                ...(likedPosts.has(discussion.id) ? styles.actionBtnActive : {})
                                            }}
                                            onClick={() => toggleLike(discussion.id)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            {likedPosts.has(discussion.id) ? <FaHeart /> : <FaRegHeart />}
                                            {discussion.likes + (likedPosts.has(discussion.id) ? 1 : 0)}
                                        </button>
                                        <button
                                            style={styles.actionBtn}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <FaComment /> {discussion.comments}
                                        </button>
                                        <button
                                            style={styles.actionBtn}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <FaEye /> {discussion.views}
                                        </button>
                                    </div>
                                    <div style={styles.actionButtons}>
                                        <button
                                            style={{
                                                ...styles.actionBtn,
                                                ...(bookmarkedPosts.has(discussion.id) ? styles.actionBtnActive : {})
                                            }}
                                            onClick={() => toggleBookmark(discussion.id)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            {bookmarkedPosts.has(discussion.id) ? <FaBookmark /> : <FaRegBookmark />}
                                        </button>
                                        <button
                                            style={styles.actionBtn}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <FaShare />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Sidebar */}
                    <div style={styles.sidebar}>
                        {/* Trending Topics */}
                        <div style={styles.sidebarCard}>
                            <h3 style={styles.sidebarTitle}>
                                <FaFire style={{ color: '#f59e0b' }} />
                                Trending Topics
                            </h3>
                            {trendingTopics.map((topic, index) => (
                                <div
                                    key={index}
                                    style={styles.topicItem}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <span style={styles.topicName}>{topic.name}</span>
                                    <span style={styles.topicCount}>{topic.count}</span>
                                    <span style={styles.trendTag}>{topic.trend}</span>
                                </div>
                            ))}
                        </div>

                        {/* Upcoming Events */}
                        <div style={styles.sidebarCard}>
                            <h3 style={styles.sidebarTitle}>
                                <FaTrophy style={{ color: '#667eea' }} />
                                Upcoming Events
                            </h3>
                            {upcomingEvents.map((event) => (
                                <div
                                    key={event.id}
                                    style={styles.eventCard}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    <span style={styles.eventType}>{event.type}</span>
                                    <div style={styles.eventTitle}>{event.title}</div>
                                    <div style={styles.eventDetails}>
                                        📅 {event.date} at {event.time}
                                    </div>
                                    <div style={styles.eventParticipants}>
                                        <FaUsers /> {event.participants} registered
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Links */}
                        <div style={styles.sidebarCard}>
                            <h3 style={styles.sidebarTitle}>
                                <FaLightbulb style={{ color: '#f59e0b' }} />
                                Quick Links
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <a
                                    href="#"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        color: '#475569',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f8fafc';
                                        e.target.style.color = '#667eea';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#475569';
                                    }}
                                >
                                    <FaCode /> Practice Problems
                                </a>
                                <a
                                    href="#"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        color: '#475569',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f8fafc';
                                        e.target.style.color = '#667eea';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#475569';
                                    }}
                                >
                                    <FaQuestionCircle /> Help Center
                                </a>
                                <a
                                    href="#"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        color: '#475569',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f8fafc';
                                        e.target.style.color = '#667eea';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#475569';
                                    }}
                                >
                                    <FaNewspaper /> Blog & Resources
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Community;