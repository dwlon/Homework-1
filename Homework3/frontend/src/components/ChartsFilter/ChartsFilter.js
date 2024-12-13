import React, { useState } from 'react';
import './ChartsFilter.css';

const ChartsFilter = ({ fromDate, toDate, symbol, onFilter }) => {
    const [tempFrom, setTempFrom] = useState(fromDate);
    const [tempTo, setTempTo] = useState(toDate);
    const [tempSymbol, setTempSymbol] = useState(symbol);

    const handleFind = () => {
        onFilter(tempFrom, tempTo, tempSymbol);
    };

    return (
        <div className="charts-filter">
            <h3>Filter</h3>
            <div className="filter-row">
                <div className="filter-item">
                    <label>From</label>
                    <input type="date" value={tempFrom} onChange={(e) => setTempFrom(e.target.value)} />
                </div>
                <div className="filter-item">
                    <label>To</label>
                    <input type="date" value={tempTo} onChange={(e) => setTempTo(e.target.value)} />
                </div>
                <div className="filter-item">
                    <label>Symbol</label>
                    <input type="text" value={tempSymbol} onChange={(e) => setTempSymbol(e.target.value)} />
                </div>
                <div className="filter-item">
                    <button onClick={handleFind}>Find</button>
                </div>
            </div>
        </div>
    );
};

export default ChartsFilter;
