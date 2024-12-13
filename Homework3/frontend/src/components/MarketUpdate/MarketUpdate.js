import React, { useEffect, useState } from 'react';
import { fetchMarketData } from '../../services/api';
import MarketTable from './MarketTable';
import './MarketUpdate.css';

const MarketUpdate = () => {
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [category, setCategory] = useState('Gainers'); // default view
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    useEffect(() => {
        // fetch data from the mock API
        fetchMarketData().then(data => {
            setAllData(data);
        });
    }, []);

    useEffect(() => {
        filterData();
    }, [allData, category, searchQuery]);

    const filterData = () => {
        let result = [...allData];

        // filter by category
        if (category === 'Gainers') {
            result = result.filter(d => d.change > 0);
        } else if (category === 'Losers') {
            result = result.filter(d => d.change < 0);
        } else if (category === 'Top Sectors') {
            // For demonstration: top sectors could be filtered by a "sector" property
            result = result.filter(d => d.sector && d.sector === 'Technology');
        }

        // filter by search query
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            result = result.filter(d => d.symbol.toLowerCase().includes(q));
        }

        setFilteredData(result);
        setCurrentPage(1); // reset to first page whenever filters change
    };

    // pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleCategoryClick = (cat) => {
        setCategory(cat);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    return (
        <section className="market-update">
            <div className="market-header">
                <h2>Market Update</h2>
                <div className="market-tabs">
                    <button onClick={() => handleCategoryClick('Gainers')} className={category==='Gainers' ? 'active' : ''}>Gainers</button>
                    <button onClick={() => handleCategoryClick('Losers')} className={category==='Losers' ? 'active' : ''}>Losers</button>
                    <button onClick={() => handleCategoryClick('Top Sectors')} className={category==='Top Sectors' ? 'active' : ''}>Top Sectors</button>
                </div>
                <div className="market-search">
                    <input
                        type="text"
                        placeholder="Search by symbol..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            <MarketTable data={displayedData} />

            <div className="pagination">
                <button onClick={handlePrev} disabled={currentPage === 1}>Prev</button>
                <span>Page {currentPage} of {totalPages || 1}</span>
                <button onClick={handleNext} disabled={currentPage === totalPages || totalPages===0}>Next</button>
            </div>
        </section>
    );
};

export default MarketUpdate;
