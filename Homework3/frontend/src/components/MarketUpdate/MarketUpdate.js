// MarketUpdate.js
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import { fetchMarketData } from "../../services/api";
import MarketTable from './MarketTable'; // Import the new MarketTable component

const MarketUpdate = () => {
    const [category, setCategory] = useState('Gainers');
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [allData, setAllData] = useState([]);

    // Pagination states
    const [page, setPage] = useState(0);
    const rowsPerPage = 4; // Fixed to 4 rows per page

    useEffect(() => {
        // Fetch data from the mock API
        fetchMarketData().then(data => {
            setAllData(data);
        });
    }, []);

    useEffect(() => {
        filterData();
    }, [allData, category, searchQuery]);

    const filterData = () => {
        let result = [...allData];

        // Filter by category
        if (category === 'Gainers') {
            result = result.filter(d => d.change > 0);
        } else if (category === 'Losers') {
            result = result.filter(d => d.change < 0);
        } else if (category === 'Top Sectors') {
            // For demonstration: top sectors could be filtered by a "sector" property
            result = result.filter(d => d.sector && d.sector === 'Technology');
        }

        // Filter by search query
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            result = result.filter(d => d.symbol.toLowerCase().includes(q));
        }

        setFilteredData(result);
        setPage(0); // Reset to first page whenever data changes
    };

    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Calculate the rows to display on the current page
    const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ p: 4, backgroundColor: '#fafafa' }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: "100%",gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
                <Typography variant="h4">Market Update</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, width: "100%" }}>
                <ToggleButtonGroup
                    value={category}
                    exclusive
                    onChange={(e, val) => val && setCategory(val)}
                    size="small"
                >
                    <ToggleButton value="Gainers">Gainers</ToggleButton>
                    <ToggleButton value="Losers">Losers</ToggleButton>
                    <ToggleButton value="Top Sectors">Top Sectors</ToggleButton>
                </ToggleButtonGroup>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search by symbol..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    sx={{ ml: 'auto' }}
                />
                </Box>
            </Box>

            {/* Pass necessary props to MarketTable */}
            <MarketTable
                data={paginatedData}
                count={filteredData.length}
                page={page}
                rowsPerPage={rowsPerPage}
                handleChangePage={handleChangePage}
            />
            </Box>
        </Box>
    );
};

export default MarketUpdate;
