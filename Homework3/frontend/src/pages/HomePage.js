import React from 'react';
import HeroSection from '../components/HeroSection/HeroSection';
import AISection from '../components/AISection/AISection';
import MarketUpdate from '../components/MarketUpdate/MarketUpdate';

const HomePage = () => {
    return (
        <div className="homepage-container">
            <HeroSection />
            <MarketUpdate />
            <AISection />
        </div>
    );
};

export default HomePage;
