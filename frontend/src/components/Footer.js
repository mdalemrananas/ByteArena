import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { SiCodeforces } from 'react-icons/si';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <div className="logo"><span className="gradient-text">Byte</span>Arena</div>
          <p>Empowering developers worldwide to achieve their coding goals through practice, community, and mentorship.</p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="#" className="social-link" aria-label="Codeforces">
              <SiCodeforces />
            </a>
          </div>
        </div>

        <div className="footer-section links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Practice</a></li>
            <li><a href="#">Community</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        <div className="footer-section resources">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Documentation</a></li>
            <li><a href="#">Tutorials</a></li>
            <li><a href="#">Webinars</a></li>
            <li><a href="#">API Reference</a></li>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Status</a></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h4>Contact Us</h4>
          <ul>
            <li><a href="mailto:hello@bytearena.com">Info@bytearena.inc.bd</a></li>
            <li><a href="tel:+1234567890">09604-848848</a></li>
            <li>United City, Madani Ave,<br/> Dhaka 1212</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} Byte Arena. All rights reserved.</p>
          <div className="legal-links">
            <a href="#">Privacy Policy</a>
            <span>•</span>
            <a href="#">Terms of Service</a>
            <span>•</span>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
