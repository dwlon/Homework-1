import React from 'react';

const ChartTypeSelector = ({ chartType, onChartTypeChange }) => {
    return (
        <div className="chart-type-selector">
            <button
                onClick={() => onChartTypeChange('line')}
                className={chartType === 'line' ? 'active' : ''}
            >
                Line
            </button>
            <button
                onClick={() => onChartTypeChange('candlestick')}
                className={chartType === 'candlestick' ? 'active' : ''}
            >
                Candlestick
            </button>
        </div>
    );
};

export default ChartTypeSelector;
