import React from 'react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-left">
                    <p>&copy; {currentYear} Smart Mosquito Control System. All rights reserved.</p>
                </div>
                <div className="footer-right">
                    <ul className="footer-links">
                        <li><a href="#privacy">Privacy Policy</a></li>
                        <li><a href="#terms">Terms of Service</a></li>
                        <li><a href="#contact">Contact Us</a></li>
                        <li className="version">v1.2.0</li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
