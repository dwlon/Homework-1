import React from 'react';

const PredictionsCard = ({ data }) => {
    const { name, price, change, changeColor } = data;
    return (
        <div className="prediction-card" style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', width: '150px', textAlign: 'left' }}>
            <div className="stock-name" style={{ fontWeight: 'bold', marginBottom: '10px' }}>{name}</div>
            <div className="stock-price">{price}</div>
            <div className="stock-change" style={{color: changeColor === 'red' ? 'red' : 'green'}}>
                {change}
            </div>
        </div>
    );
};

export default PredictionsCard;
