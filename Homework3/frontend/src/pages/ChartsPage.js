import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import ChartsFilter from '../components/ChartsFilter/ChartsFilter';
import ChartComponent from '../components/ChartComponents/ChartComponent';
import HistoricalTable from '../components/HistoricalTable/HistoricalTable';

import { fetchChartData } from '../services/api';

const ChartsPage = () => {
    // Default values: last 30 days and symbol "ALKALOID"
    const today = new Date();
    const fromDateDefault = new Date(today);
    fromDateDefault.setDate(fromDateDefault.getDate() - 30);

    const [fromDate, setFromDate] = useState(fromDateDefault.toISOString().slice(0, 10));
    const [toDate, setToDate] = useState(today.toISOString().slice(0, 10));
    const [symbol, setSymbol] = useState("ALKALOID");
    const [chartData, setChartData] = useState([]);
    const [chartType, setChartType] = useState('line'); // 'line', 'candlestick', 'area'

    useEffect(() => {
        fetchData();
    }, [fromDate, toDate, symbol]);

    const fetchData = async () => {
        const data = await fetchChartData(symbol, fromDate, toDate);
        setChartData(data);
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
        <Box className="charts-page" sx={{display: 'flex', justifyContent: "center", alignContent: 'center'}}>
            <Box sx={{display: 'flex', justifyContent: "center", alignContent: 'center', width: "80vw"}}>

                <Box className="charts-container" sx={{ p: 3 }}>
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
                            onChartTypeChange={setChartType}
                            onRangeChange={handleRangeChange}
                        />
                    </Box>

                    <Box className="historical-table-section" sx={{ mt: 5 }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                            Historical Data
                        </Typography>
                        <HistoricalTable data={chartData} />
                    </Box>
                </Box>

            </Box>
        </Box>
    );
};

export default ChartsPage;
