import React from 'react';
import PredictionsCard from './PredictionsCard';
import './AISection.css';

const AISection = () => {
    const predictionsData = [
        { name: 'Stock A', price: '2,434,3434.00', change: '-0.34%', changeColor: 'red' },
        { name: 'Stock B', price: '3,212,3243.00', change: '+1.23%', changeColor: 'green' },
        { name: 'Stock C', price: '1,123,4567.00', change: '+0.45%', changeColor: 'green' },
        { name: 'Stock D', price: '4,333,0000.00', change: '-1.12%', changeColor: 'red' }
    ];

    return (
        <section className="ai-section">
            <h2>AI Predictions</h2>
            <div className="predictions-container">
                {predictionsData.map((pd, index) => (
                    <PredictionsCard key={index} data={pd} />
                ))}
            </div>
        </section>
    );
};

export default AISection;
