import React, { useState, useEffect } from 'react';
import {
    FaBars, FaTimes, FaGithub, FaTwitter, FaLinkedin, FaCode, FaUsers,
    FaTrophy, FaRocket, FaChevronRight, FaStar, FaRegStar, FaRegLightbulb,
    FaChartLine, FaLaptopCode, FaUserGraduate, FaRegClock, FaRegCheckCircle
} from 'react-icons/fa';
import { SiLeetcode, SiCodechef, SiCodeforces } from 'react-icons/si';
import './Home.css';
import SignIn from './Sign_in';
import Navbar from '../components/Header';
import Footer from '../components/Footer';

const testimonials = [
    {
        id: 1,
        name: 'Rahman Karim',
        role: 'Software Engineer',
        content: 'Byte Arena helped me land my dream job at a leading tech company. The practice problems and community support were invaluable!',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
        id: 2,
        name: 'Fatima Begum',
        role: 'Computer Science Student',
        content: 'The structured learning path and real-world challenges made all the difference in my coding journey.',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
        id: 3,
        name: 'Mohammad Hassan',
        role: 'Full Stack Developer',
        content: 'I improved my problem-solving skills significantly after joining Byte Arena. The community is amazing!',
        avatar: 'https://randomuser.me/api/portraits/men/28.jpg'
    }
];

const stats = [
    { value: '50K+', label: 'Active Coders' },
    { value: '10K+', label: 'Coding Problems' },
    { value: '1M+', label: 'Submissions' },
    { value: '100+', label: 'Expert Mentors' }
];

const Home = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const [isSignUpMode, setIsSignUpMode] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleSignInClick = () => {
        setIsSignUpMode(false);
        setShowSignIn(true);
    };

    const handleGetStartedClick = () => {
        setIsSignUpMode(true);
        setShowSignIn(true);
    };

    return (
        <div className="home">
            {/* Navbar */}
            <Navbar onSignInClick={handleSignInClick} onGetStartedClick={handleGetStartedClick} />

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-container">
                    <div className="hero-content">
                        <div
                            className=""
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                gap: "8px",
                                padding: "10px 24px",
                                backgroundColor: "#F0F7FF",
                                color: "#2563EB",
                                fontSize: "15px",
                                fontWeight: "600",
                                borderRadius: "9999px",
                                border: "1px solid #BFDBFE",
                                boxShadow: "0 0 8px rgba(59, 130, 246, 0.15)",
                                cursor: "pointer",
                                transition: "all 0.25s ease-in-out",
                                width: "fit-content",
                                minWidth: "260px", // Keeps width balanced like in the image
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = "#E0EDFF";
                                e.currentTarget.style.boxShadow = "0 0 12px rgba(59, 130, 246, 0.3)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "#F0F7FF";
                                e.currentTarget.style.boxShadow = "0 0 8px rgba(59, 130, 246, 0.15)";
                            }}
                        >
                            🚀 <span>Join 50,000+ Developers</span>
                        </div>



                        <h1>
                            <span className="gradient-text">Master</span> Coding Through Practice & Community
                        </h1>
                        <p>Accelerate your coding journey with our curated problems, expert mentorship, and a supportive developer community.</p>
                        <div className="hero-buttons">
                            <button className="btn btn-primary btn-lg">
                                Start Practicing <FaChevronRight className="btn-icon" />
                            </button>
                            <button className="btn btn-outline btn-lg">
                                Watch Demo
                            </button>
                        </div>
                        <div className="trusted-by">
                            <span>Trusted by developers at</span>
                            <div className="companies">
                                <SiLeetcode className="company-logo" />
                                <SiCodechef className="company-logo" />
                                <SiCodeforces className="company-logo" />
                            </div>
                        </div>
                    </div>
                    <div className="hero-image">
                        <div className="trophy-illustration">
                            <img src="/Trophy.png" alt="Coding Trophy" className="trophy-img" />
                            <div className="floating-elements">
                                <div className="floating-card top-left">
                                    <FaRegCheckCircle className="icon" />
                                    <span>Daily Challenges</span>
                                </div>
                                <div className="floating-card top-right">
                                    <FaUsers className="icon" />
                                    <span>Active Community</span>
                                </div>
                                <div className="floating-card bottom-left">
                                    <FaTrophy className="icon" />
                                    <span>Win Prizes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section - Moved below hero content and image */}
                <div className="stats-container">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-item">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="section-header">
                    <span className="section-subtitle">Why Choose Us?</span>
                    <h2>Everything You Need to <span className="gradient-text">Level Up</span></h2>
                    <p>Join thousands of developers who have accelerated their careers with our platform</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><FaLaptopCode /></div>
                        <h3>Interactive Coding</h3>
                        <p>Practice with our interactive coding environment that supports multiple languages and provides real-time feedback.</p>
                        <a href="#" className="feature-link">Learn more <FaChevronRight className="icon" /></a>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"><FaUserGraduate /></div>
                        <h3>Expert Mentorship</h3>
                        <p>Get guidance from industry experts with 1:1 mentorship and code reviews to improve your skills faster.</p>
                        <a href="#" className="feature-link">Meet our mentors <FaChevronRight className="icon" /></a>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"><FaChartLine /></div>
                        <h3>Track Progress</h3>
                        <p>Monitor your improvement with detailed analytics and personalized learning recommendations.</p>
                        <a href="#" className="feature-link">View analytics <FaChevronRight className="icon" /></a>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"><FaRegLightbulb /></div>
                        <h3>Smart Practice</h3>
                        <p>Our AI-powered system adapts to your skill level and suggests the most relevant problems.</p>
                        <a href="#" className="feature-link">Try now <FaChevronRight className="icon" /></a>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials">
                <div className="section-header">
                    <span className="section-subtitle">Success Stories</span>
                    <h2>What Our <span className="gradient-text">Community</span> Says</h2>
                </div>

                <div className="testimonials-grid">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="testimonial-card">
                            <div className="testimonial-rating">
                                {[...Array(5)].map((_, i) => (
                                    i < 4 ? <FaStar key={i} /> : <FaRegStar key={i} />
                                ))}
                            </div>
                            <p className="testimonial-content">"{testimonial.content}"</p>
                            <div className="testimonial-author">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    className="testimonial-avatar"
                                />
                                <div>
                                    <h4>{testimonial.name}</h4>
                                    <span>{testimonial.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="newsletter">
                <div className="newsletter-container">
                    <div className="newsletter-content">
                        <h3>Stay Updated</h3>
                        <p>Subscribe to our newsletter for the latest coding challenges and tips</p>
                    </div>
                    <form className="newsletter-form">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="newsletter-input"
                            required
                        />
                        <button type="submit" className="btn btn-primary">Subscribe</button>
                    </form>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="cta-container">
                    <div className="cta-content">
                        <h2>Ready to Start Your Coding Journey?</h2>
                        <p>Join thousands of developers who have improved their skills with our platform</p>
                    </div>
                    <div className="cta-buttons">
                        <button className="btn btn-primary btn-lg">Start Free Trial</button>
                        <button className="btn btn-outline btn-lg">Schedule a Demo</button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />

            {/* SignIn Modal */}
            {showSignIn && <SignIn onClose={() => setShowSignIn(false)} isSignUpMode={isSignUpMode} />}
        </div>
    );
};

export default Home;