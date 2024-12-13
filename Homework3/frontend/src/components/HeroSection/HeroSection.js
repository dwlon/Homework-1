import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1>Daily updates of stock market</h1>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Rorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <a className="btn-primary" href="/charts">See Charts</a>
            </div>
            <div className="hero-graphic">
                {/* Placeholder graphic */}
                <div className="dummy-graphic"></div>
            </div>
        </section>
    );
};

export default HeroSection;
