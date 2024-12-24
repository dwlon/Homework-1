// src/pages/ChartsPage.js
import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import ChartsFilter from '../components/ChartsFilter/ChartsFilter';
import ChartComponent from '../components/ChartComponents/ChartComponent';
import HistoricalTable from '../components/HistoricalTable/HistoricalTable';

import {fetchIssuerData, fetchAllIssuers} from '../services/api';

const ChartsPage = () => {
    // Default values: last 30 days and symbol "ALK"
    const today = new Date();
    const fromDateDefault = new Date(today);
    fromDateDefault.setDate(fromDateDefault.getDate() - 30);

    const [fromDate, setFromDate] = useState(fromDateDefault.toISOString().slice(0, 10));
    const [toDate, setToDate] = useState(today.toISOString().slice(0, 10));
    const [symbol, setSymbol] = useState("ALK");
    const [chartData, setChartData] = useState([]);
    const [chartType, setChartType] = useState('line'); // 'line', 'candlestick', 'area'
    const [allSymbols, setAllSymbols] = useState([]); // To store all symbols for the dropdown

    useEffect(() => {
        // Fetch all issuers to populate the dropdown
        const fetchSymbols = async () => {
            try {
                const issuers = await fetchAllIssuers();
                setAllSymbols(issuers);
            } catch (error) {
                console.error('Failed to fetch issuers:', error);
            }
        };
        fetchSymbols();
    }, []);

    useEffect(() => {
        fetchData();
    }, [fromDate, toDate, symbol]);

    const fetchData = async () => {
        try {
            console.log(fromDate)
            const data = await fetchIssuerData(symbol, fromDate, toDate);
            setChartData(data);
        } catch (error) {
            console.error('Error fetching issuer data:', error);
        }
    };

    const handleFilter = (fDate, tDate, sym) => {
        setFromDate(fDate);
        setToDate(tDate);
        setSymbol(sym);
    };

    const handleRangeChange = (range) => {
        // Adjust fromDate/toDate based on the selected range
        const newToDate = new Date();
        let newFromDate = new Date();
        switch (range) {
            case '1W':
                newFromDate.setDate(newToDate.getDate() - 7);
                break;
            case '1M':
                newFromDate.setMonth(newToDate.getMonth() - 1);
                break;
            case '1Y':
                newFromDate.setFullYear(newToDate.getFullYear() - 1);
                break;
            case '10Y':
                newFromDate.setFullYear(newToDate.getFullYear() - 10);
                break;
            default:
                break;
        }
        setFromDate(newFromDate.toISOString().slice(0, 10));
        setToDate(newToDate.toISOString().slice(0, 10));
    };

    return (
        <Box className="charts-page" sx={{ display: 'flex', justifyContent: "center", alignContent: 'center', p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: "center", alignContent: 'center', width: "80vw" }}>

                <Box className="charts-container" sx={{ p: 3, width: "100%" }}>
                    <ChartsFilter
                        fromDate={fromDate}
                        toDate={toDate}
                        symbol={symbol}
                        onFilter={handleFilter}
                    />

                    <Box className="chart-section" sx={{ mt: 5 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            {symbol}
                        </Typography>
                        <ChartComponent
                            data={chartData}
                            chartType={chartType}
                            fromDate={fromDate}
                            toDate={toDate}
                            onChartTypeChange={setChartType}
                            onRangeChange={handleRangeChange}
                            allSymbols={allSymbols} // Pass allSymbols to ChartComponent
                        />
                    </Box>

                    <Box className="historical-table-section" sx={{ mt: 5 }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                            Historical Data
                        </Typography>
                        <HistoricalTable data={chartData}/>
                    </Box>
                </Box>

            </Box>
        </Box>
    );
};

export default ChartsPage;
