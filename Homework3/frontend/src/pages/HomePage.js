import React from 'react';
import Header from '../components/Header/Header';
import HeroSection from '../components/HeroSection/HeroSection';
import AISection from '../components/AISection/AISection';
import MarketUpdate from '../components/MarketUpdate/MarketUpdate';
import Footer from '../components/Footer/Footer';

const HomePage = () => {
    return (
        <div className="homepage-container">
            <Header />
            <HeroSection />
            <AISection />
            <MarketUpdate />
            <Footer />
        </div>
    );
};

export default HomePage;
