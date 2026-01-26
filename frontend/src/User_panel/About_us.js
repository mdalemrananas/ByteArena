import React, { useState } from 'react';
import {
    FaRocket, FaUsers, FaHeart, FaLightbulb, FaCode, FaTrophy,
    FaGraduationCap, FaHandshake, FaChartLine, FaGlobe, FaAward,
    FaLinkedin, FaTwitter, FaGithub, FaQuoteLeft, FaCheckCircle,
    FaArrowRight, FaStar, FaUserTie, FaBullseye, FaEye,
    FaPlay, FaBook, FaTarget, FaShieldAlt, FaClock
} from 'react-icons/fa';
import Navbar from '../components/Header';
import Footer from '../components/Footer';

const AboutUs = ({ onSignInClick, onGetStartedClick }) => {
    const [activeValue, setActiveValue] = useState(0);

    const teamMembers = [
        {
            id: 1,
            name: 'David Martinez',
            role: 'CEO & Founder',
            image: 'https://randomuser.me/api/portraits/men/52.jpg',
            bio: 'Former Google engineer with 15+ years of experience in competitive programming.',
            social: {
                linkedin: '#',
                twitter: '#',
                github: '#'
            }
        },
        {
            id: 2,
            name: 'Jennifer Lee',
            role: 'CTO',
            image: 'https://randomuser.me/api/portraits/women/65.jpg',
            bio: 'Algorithm expert and ACM ICPC World Finalist. Passionate about education technology.',
            social: {
                linkedin: '#',
                twitter: '#',
                github: '#'
            }
        },
        {
            id: 3,
            name: 'Robert Kim',
            role: 'Head of Product',
            image: 'https://randomuser.me/api/portraits/men/43.jpg',
            bio: 'Product leader with expertise in building developer-focused platforms.',
            social: {
                linkedin: '#',
                twitter: '#',
                github: '#'
            }
        },
        {
            id: 4,
            name: 'Emily Watson',
            role: 'Head of Community',
            image: 'https://randomuser.me/api/portraits/women/47.jpg',
            bio: 'Community builder who has helped thousands of developers achieve their goals.',
            social: {
                linkedin: '#',
                twitter: '#',
                github: '#'
            }
        },
        {
            id: 5,
            name: 'James Anderson',
            role: 'Lead Engineer',
            image: 'https://randomuser.me/api/portraits/men/67.jpg',
            bio: 'Full-stack developer and open-source contributor with a passion for clean code.',
            social: {
                linkedin: '#',
                twitter: '#',
                github: '#'
            }
        },
        {
            id: 6,
            name: 'Sophia Patel',
            role: 'Content Director',
            image: 'https://randomuser.me/api/portraits/women/89.jpg',
            bio: 'Creating engaging educational content that makes learning algorithms fun.',
            social: {
                linkedin: '#',
                twitter: '#',
                github: '#'
            }
        }
    ];

    const coreValues = [
        {
            icon: <FaLightbulb />,
            title: 'Innovation',
            description: 'We constantly push boundaries to create the best learning experience for developers.'
        },
        {
            icon: <FaUsers />,
            title: 'Community',
            description: 'We believe in the power of community and collaborative learning.'
        },
        {
            icon: <FaHeart />,
            title: 'Passion',
            description: 'We are passionate about coding and helping others achieve their dreams.'
        },
        {
            icon: <FaTrophy />,
            title: 'Excellence',
            description: 'We strive for excellence in everything we do, from content to user experience.'
        }
    ];

    const milestones = [
        {
            year: '2019',
            title: 'Founded',
            description: 'CodeMaster was born from a passion to make coding education accessible to everyone.'
        },
        {
            year: '2020',
            title: '10K Users',
            description: 'Reached our first major milestone with 10,000 active users.'
        },
        {
            year: '2021',
            title: 'Series A Funding',
            description: 'Raised $5M to expand our platform and reach more developers worldwide.'
        },
        {
            year: '2022',
            title: '100K Community',
            description: 'Our community grew to over 100,000 passionate developers.'
        },
        {
            year: '2023',
            title: 'Global Expansion',
            description: 'Launched in 50+ countries with multi-language support.'
        },
        {
            year: '2024',
            title: 'Enterprise Solutions',
            description: 'Introduced enterprise solutions for companies to upskill their teams.'
        }
    ];

    const achievements = [
        {
            icon: <FaUsers />,
            number: '500K+',
            label: 'Students Trained'
        },
        {
            icon: <FaGraduationCap />,
            number: '50K+',
            label: 'Success Stories'
        },
        {
            icon: <FaGlobe />,
            number: '120+',
            label: 'Countries Reached'
        },
        {
            icon: <FaAward />,
            number: '100+',
            label: 'Industry Awards'
        }
    ];

    const testimonials = [
        {
            id: 1,
            quote: 'Byte Arena transformed my career. The structured curriculum and supportive community helped me land my dream job at a leading tech company.',
            author: 'Rahman Karim',
            role: 'Software Engineer at TechBangla',
            image: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        {
            id: 2,
            quote: 'The best platform for learning algorithms and data structures. The problems are challenging yet approachable for Bangladeshi students.',
            author: 'Fatima Begum',
            role: 'Full Stack Developer',
            image: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        {
            id: 3,
            quote: 'As a company, we use Byte Arena to train our engineering teams. The results have been phenomenal for our Bangladeshi workforce.',
            author: 'Mohammad Hassan',
            role: 'CTO at Dhaka Tech Solutions',
            image: 'https://randomuser.me/api/portraits/men/28.jpg'
        }
    ];

    const styles = {
        aboutUs: {
            minHeight: '100vh',
            backgroundColor: '#ffffff',
            fontFamily: 'Helvetica, Arial, sans-serif'
        },
        heroSection: {
            background: `linear-gradient(rgba(102, 126, 234, 0.85), rgba(118, 75, 162, 0.85)), url('https://img.freepik.com/premium-vector/about-us_773186-1363.jpg?semt=ais_hybrid&w=740&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            padding: '140px 20px 100px',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        },
        heroContent: {
            maxWidth: '900px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 2
        },
        heroSubtitle: {
            fontSize: '1.1rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '20px',
            opacity: 0.95
        },
        heroTitle: {
            fontSize: '3.5rem',
            fontWeight: '800',
            marginBottom: '24px',
            lineHeight: '1.2'
        },
        heroDescription: {
            fontSize: '1.3rem',
            color: '#ffffff',
            opacity: 0.95,
            lineHeight: '1.8',
            maxWidth: '700px',
            margin: '0 auto'
        },
        section: {
            padding: '80px 20px',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        sectionAlt: {
            padding: '80px 20px',
            maxWidth: '1200px',
            margin: '0 auto',
            backgroundColor: '#f8fafc'
        },
        sectionHeader: {
            textAlign: 'center',
            marginBottom: '60px'
        },
        sectionTitle: {
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#1e293b',
            marginBottom: '16px'
        },
        sectionSubtitle: {
            fontSize: '1.1rem',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
        },
        gradientText: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
        },
        storySection: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
            marginBottom: '40px'
        },
        storyContent: {
            fontSize: '1.1rem',
            color: '#475569',
            lineHeight: '1.8'
        },
        storyParagraph: {
            marginBottom: '20px'
        },
        storyImage: {
            width: '100%',
            height: '400px',
            borderRadius: '16px',
            objectFit: 'cover',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        },
        valuesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            marginTop: '50px'
        },
        valueCard: {
            backgroundColor: 'white',
            padding: '40px 30px',
            borderRadius: '16px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            border: '2px solid #f1f5f9',
            cursor: 'pointer'
        },
        valueIcon: {
            fontSize: '3rem',
            color: '#667eea',
            marginBottom: '20px'
        },
        valueTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '12px'
        },
        valueDescription: {
            fontSize: '1rem',
            color: '#64748b',
            lineHeight: '1.6'
        },
        timeline: {
            position: 'relative',
            maxWidth: '900px',
            margin: '0 auto'
        },
        timelineItem: {
            display: 'flex',
            gap: '30px',
            marginBottom: '50px',
            position: 'relative'
        },
        timelineYear: {
            fontSize: '2rem',
            fontWeight: '800',
            color: '#667eea',
            minWidth: '120px',
            textAlign: 'right'
        },
        timelineContent: {
            flex: 1,
            paddingLeft: '40px',
            borderLeft: '3px solid #e2e8f0',
            paddingBottom: '20px'
        },
        timelineTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '8px'
        },
        timelineDescription: {
            fontSize: '1.05rem',
            color: '#64748b',
            lineHeight: '1.6'
        },
        teamGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            marginTop: '50px'
        },
        teamCard: {
            backgroundColor: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            border: '1px solid #f1f5f9'
        },
        teamImage: {
            width: '100%',
            height: '300px',
            objectFit: 'cover'
        },
        teamInfo: {
            padding: '24px'
        },
        teamName: {
            fontSize: '1.4rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '6px'
        },
        teamRole: {
            fontSize: '1rem',
            color: '#667eea',
            fontWeight: '600',
            marginBottom: '12px'
        },
        teamBio: {
            fontSize: '0.95rem',
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '20px'
        },
        socialLinks: {
            display: 'flex',
            gap: '12px'
        },
        socialIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        achievementsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginTop: '50px'
        },
        achievementCard: {
            textAlign: 'center'
        },
        achievementIcon: {
            fontSize: '3.5rem',
            color: '#667eea',
            marginBottom: '16px'
        },
        achievementNumber: {
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#1e293b',
            marginBottom: '8px'
        },
        achievementLabel: {
            fontSize: '1.05rem',
            color: '#64748b',
            fontWeight: '600'
        },
        testimonialsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            marginTop: '50px'
        },
        testimonialCard: {
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #f1f5f9',
            position: 'relative'
        },
        quoteIcon: {
            fontSize: '2.5rem',
            color: '#667eea',
            opacity: 0.2,
            position: 'absolute',
            top: '20px',
            left: '20px'
        },
        testimonialQuote: {
            fontSize: '1.05rem',
            color: '#475569',
            lineHeight: '1.7',
            marginBottom: '24px',
            fontStyle: 'italic',
            position: 'relative',
            zIndex: 1
        },
        testimonialAuthor: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        testimonialImage: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            objectFit: 'cover'
        },
        testimonialName: {
            fontSize: '1rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '4px'
        },
        testimonialRole: {
            fontSize: '0.9rem',
            color: '#64748b'
        },
        ctaSection: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '80px 20px',
            textAlign: 'center',
            color: 'white'
        },
        ctaTitle: {
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '20px'
        },
        ctaDescription: {
            fontSize: '1.2rem',
            marginBottom: '40px',
            opacity: 0.95,
            maxWidth: '600px',
            margin: '0 auto 40px'
        },
        ctaButtons: {
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
        },
        btnPrimary: {
            padding: '16px 40px',
            fontSize: '1.1rem',
            fontWeight: '600',
            backgroundColor: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        btnOutline: {
            padding: '16px 40px',
            fontSize: '1.1rem',
            fontWeight: '600',
            backgroundColor: 'transparent',
            color: 'white',
            border: '2px solid white',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        missionVision: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            marginTop: '50px'
        },
        missionCard: {
            backgroundColor: '#f8fafc',
            padding: '40px',
            borderRadius: '16px',
            border: '2px solid #e2e8f0'
        },
        missionIcon: {
            fontSize: '3rem',
            color: '#667eea',
            marginBottom: '20px'
        },
        missionTitle: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '16px'
        },
        missionText: {
            fontSize: '1.05rem',
            color: '#475569',
            lineHeight: '1.8'
        }
    };

    return (
        <div style={styles.aboutUs}>
            <Navbar onSignInClick={onSignInClick} onGetStartedClick={onGetStartedClick} />

            {/* Hero Section */}
            <section style={styles.heroSection}>
                <div style={styles.heroContent}>
                    <div style={styles.heroSubtitle}>About Byte Arena</div>
                    <h1 style={styles.heroTitle}>
                        Empowering Developers to<br />Master Their Craft
                    </h1>
                    <p style={styles.heroDescription}>
                        We're on a mission to make coding education accessible, engaging, and effective
                        for developers worldwide. Join us in shaping the future of tech education.
                    </p>
                </div>
            </section>

            {/* Our Story Section */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                        Our <span style={styles.gradientText}>Story</span>
                    </h2>
                    <p style={styles.sectionSubtitle}>
                        How a passion for coding education became a global platform
                    </p>
                </div>

                <div style={styles.storySection}>
                    <div style={styles.storyContent}>
                        <p style={styles.storyParagraph}>
                            CodeMaster was founded in 2019 by a group of software engineers who were passionate
                            about competitive programming and helping others succeed in their coding journey. We
                            noticed a gap in the market for a platform that combined quality content, a supportive
                            community, and practical problem-solving experience.
                        </p>
                        <p style={styles.storyParagraph}>
                            What started as a small project to help our friends prepare for technical interviews
                            has grown into a global platform serving over 500,000 developers across 120+ countries.
                            Our platform has helped countless developers land their dream jobs at top tech companies
                            and advance their careers.
                        </p>
                        <p style={styles.storyParagraph}>
                            Today, we continue to innovate and expand our offerings, always keeping our core mission
                            at heart: making coding education accessible, effective, and enjoyable for everyone.
                        </p>
                    </div>
                    <div>
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
                            alt="Team collaboration"
                            style={styles.storyImage}
                        />
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section style={styles.sectionAlt}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                        Mission & <span style={styles.gradientText}>Vision</span>
                    </h2>
                </div>

                <div style={styles.missionVision}>
                    <div style={styles.missionCard}>
                        <div style={styles.missionIcon}>
                            <FaBullseye />
                        </div>
                        <h3 style={styles.missionTitle}>Our Mission</h3>
                        <p style={styles.missionText}>
                            To democratize coding education by providing world-class resources, fostering a 
                            supportive community, and empowering developers to reach their full potential through 
                            practical, hands-on learning experiences.
                        </p>
                    </div>
                    <div style={styles.missionCard}>
                        <div style={styles.missionIcon}>
                            <FaEye />
                        </div>
                        <h3 style={styles.missionTitle}>Our Vision</h3>
                        <p style={styles.missionText}>
                            To become the world's leading platform for algorithmic thinking and problem-solving, 
                            where every developer, regardless of background, can access the tools and community 
                            they need to excel in their career.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                        Our Core <span style={styles.gradientText}>Values</span>
                    </h2>
                    <p style={styles.sectionSubtitle}>
                        The principles that guide everything we do
                    </p>
                </div>

                <div style={styles.valuesGrid}>
                    {coreValues.map((value, index) => (
                        <div
                            key={index}
                            style={styles.valueCard}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.15)';
                                e.currentTarget.style.borderColor = '#667eea';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = '#f1f5f9';
                            }}
                        >
                            <div style={styles.valueIcon}>{value.icon}</div>
                            <h3 style={styles.valueTitle}>{value.title}</h3>
                            <p style={styles.valueDescription}>{value.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Achievements */}
            <section style={styles.sectionAlt}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                        Our <span style={styles.gradientText}>Impact</span>
                    </h2>
                    <p style={styles.sectionSubtitle}>
                        Numbers that reflect our commitment to excellence
                    </p>
                </div>

                <div style={styles.achievementsGrid}>
                    {achievements.map((achievement, index) => (
                        <div key={index} style={styles.achievementCard}>
                            <div style={styles.achievementIcon}>{achievement.icon}</div>
                            <div style={styles.achievementNumber}>{achievement.number}</div>
                            <div style={styles.achievementLabel}>{achievement.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                        What People <span style={styles.gradientText}>Say</span>
                    </h2>
                    <p style={styles.sectionSubtitle}>
                        Hear from developers who have transformed their careers with us
                    </p>
                </div>

                <div style={styles.testimonialsGrid}>
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} style={styles.testimonialCard}>
                            <FaQuoteLeft style={styles.quoteIcon} />
                            <p style={styles.testimonialQuote}>{testimonial.quote}</p>
                            <div style={styles.testimonialAuthor}>
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.author}
                                    style={styles.testimonialImage}
                                />
                                <div>
                                    <div style={styles.testimonialName}>{testimonial.author}</div>
                                    <div style={styles.testimonialRole}>{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section style={styles.ctaSection}>
                <h2 style={styles.ctaTitle}>Ready to Join Us?</h2>
                <p style={styles.ctaDescription}>
                    Become part of our growing community and start your journey to coding excellence today.
                </p>
                <div style={styles.ctaButtons}>
                    <button
                        style={styles.btnPrimary}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Get Started <FaArrowRight />
                    </button>
                    <button
                        style={styles.btnOutline}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = '#667eea';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'white';
                        }}
                    >
                        Contact Us
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutUs;