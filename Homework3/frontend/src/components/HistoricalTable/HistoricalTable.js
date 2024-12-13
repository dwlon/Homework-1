import React, { useState } from 'react';
import './HistoricalTable.css';

const HistoricalTable = ({ data }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const totalPages = Math.ceil((data || []).length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = (data || []).slice(startIndex, startIndex + itemsPerPage);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    return (
        <div className="historical-table-container">
            <table className="historical-table">
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Last Trade</th>
                    <th>Max</th>
                    <th>Min</th>
                    <th>%Chg</th>
                    <th>Volume</th>
                    <th>Total Turnover</th>
                </tr>
                </thead>
                <tbody>
                {currentData.map((row, i) => (
                    <tr key={i}>
                        <td>{row.date}</td>
                        <td>{row.last_trade_price.toFixed(2)}</td>
                        <td>{row.max.toFixed(2)}</td>
                        <td>{row.min.toFixed(2)}</td>
                        <td>{(row.percent_change * 100).toFixed(2)}%</td>
                        <td>{row.volume.toLocaleString()}</td>
                        <td>{row.total_turnover.toLocaleString()}</td>
                    </tr>
                ))}
                {currentData.length === 0 && (
                    <tr><td colSpan="7">No data</td></tr>
                )}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div className="historical-pagination">
                    <button onClick={handlePrev} disabled={currentPage === 1}>Prev</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
                </div>
            )}
        </div>
    );
};

export default HistoricalTable;
