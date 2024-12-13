import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-logo">MY LOGO</div>
            <div className="footer-contact">
                <p>Let's talk! 👍</p>
                <p>+97788586458</p>
                <p>Test@Mail.com</p>
            </div>
            <p className="footer-copy">Copyright © 2024 MSE</p>
        </footer>
    );
};

export default Footer;
