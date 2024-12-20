// MarketUpdate.js
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import { fetchLastSevenDaysPerIssuer } from '../../services/api';
import MarketTable from './MarketTable';

const MarketUpdate = () => {
    const [category, setCategory] = useState('Gainers');
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [allData, setAllData] = useState([]);

    // Pagination states
    const [page, setPage] = useState(0);
    const rowsPerPage = 4; // Fixed to 4 rows per page

    useEffect(() => {
        fetchLastSevenDaysPerIssuer().then((data) => {
            console.log(data)
            // Process the data into the format we need
            const processedData = Object.keys(data).map((issuerKey) => {
                const issuerDataArray = data[issuerKey];

                // Ensure data is sorted by date ascending (since we reversed it in the backend)
                const sortedData = issuerDataArray.sort((a, b) =>
                    a.date.localeCompare(b.date)
                );

                // Get the most recent data point
                const latestDataPoint = sortedData[sortedData.length - 1];

                // Extract the last trade prices for the last 7 days
                const last7DaysPrices = sortedData.map((d) => {
                        return parseNumber(d.last_trade_price)
                    }
                );


                return {
                    symbol: issuerKey + "",
                    ltp: latestDataPoint.last_trade_price + "",
                    change: latestDataPoint.percent_change + "", // Convert percentage to decimal
                    quantity: latestDataPoint.volume + "",
                    last7Days: last7DaysPrices,
                };
            });

            setAllData(processedData);
        });
    }, []);

    useEffect(() => {
        filterData();
    }, [allData, category, searchQuery]);

    const parseNumber = (str) => {
        // Remove dots used as thousand separators, replace commas with dots for decimals
        if (!str) return 0;
        const normalizedStr = str.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(normalizedStr);
        return isNaN(num) ? 0 : num;
    };

    const filterData = () => {
        let result = [...allData];

        // Filter by category
        if (category === 'Gainers') {
            result = result.filter((d) => d.change.indexOf('-')===-1);
        } else if (category === 'Losers') {
            result = result.filter((d) => d.change.indexOf('-')!==-1);
        } else if (category === 'Top Sectors') {
            // If you have sector information, filter accordingly
            // For now, we'll skip this as the data doesn't include sectors
        }

        // Filter by search query
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            result = result.filter((d) => d.symbol.toLowerCase().includes(q));
        }

        setFilteredData(result);
        setPage(0); // Reset to first page whenever data changes
    };

    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Calculate the rows to display on the current page
    const paginatedData = filteredData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box
            sx={{
                p: 4,
                backgroundColor: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                        }}
                    >
                        <Typography variant="h4">Market Update</Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            width: '100%',
                        }}
                    >
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
                            onChange={(e) => setSearchQuery(e.target.value)}
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
