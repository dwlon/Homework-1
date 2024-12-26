// src/pages/ChartsPage.js
import React, { useEffect, useState } from 'react';
import {Box, Button, Typography} from '@mui/material';
import ChartsFilter from '../components/ChartsFilter/ChartsFilter';
import ChartComponent from '../components/ChartComponents/ChartComponent';
import HistoricalTable from '../components/HistoricalTable/HistoricalTable';

import {fetchIssuerData, fetchAllIssuers, fetchPrecomputedMetrics} from '../services/api';
import { makeObject, thresholds, getCounts, analyzeIndicators } from "../Utils/technicalAnalysisUtils";
import Link from '@mui/material/Link';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
const ChartsPage = () => {
    // Default values: last 30 days and symbol "ALK"
    const today = new Date();
    const fromDateDefault = new Date(today);
    fromDateDefault.setDate(fromDateDefault.getDate() - (365*10));

    const [fromDate, setFromDate] = useState(fromDateDefault.toISOString().slice(0, 10));
    const [toDate, setToDate] = useState(today.toISOString().slice(0, 10));
    const [symbol, setSymbol] = useState("ALK");
    const [chartData, setChartData] = useState([]);
    const [chartType, setChartType] = useState('line'); // 'line', 'candlestick', 'area'
    const [allSymbols, setAllSymbols] = useState([]); // To store all symbols for the dropdown

    const [metrics, setMetrics] = useState(null);
    const [recommendation, setRecommendation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [period, setPeriod] = useState('1d');
    const handleAnalyze = async () => {
        if (!symbol) {
            setError('Please select both symbol.');
            return;
        }
        setLoading(true);
        setMetrics(null);
        setRecommendation('');

        try {
            const data = await fetchPrecomputedMetrics(symbol, period);
            console.log("Received data:", data);
            const rec = analyzeIndicators(data);
            if (data) {
                setMetrics(data);
                setRecommendation(rec);
            } else {
                setError('No metrics found for the selected symbol and period.');
            }
        } catch (err) {
            console.error('Error fetching metrics:', err);
            setError('Failed to fetch metrics.');
        } finally {
            setLoading(false);
        }
    };

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
        handleAnalyze();
    }, []);

    useEffect(() => {
        handleAnalyze();
    }, [period, symbol]);

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

    let navigate = useNavigate()

    const handleNavigate = () => {
        navigate('/technical', { state: { symbol, period } });
    }

    return (
        <Box className="charts-page" sx={{ display: 'flex', justifyContent: "center", alignContent: 'center', p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: "center", alignContent: 'center', width: "80vw" }}>

                <Box className="charts-container" sx={{ p: 3, width: "100%" }}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                        <ChartsFilter
                            fromDate={fromDate}
                            toDate={toDate}
                            symbol={symbol}
                            onFilter={handleFilter}
                            onClick={handleAnalyze}
                        />

                        <Box sx={{display:'flex', flexDirection:'row'}}>
                            <Box sx={{border: '2px solid lightgray', borderRadius: '10px', padding: 3}}>
                                <Box>
                                    <Typography sx={{textAlign: 'center', fontWeight: 'bold', marginBottom: 1}}> Technicals </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 5, justifyContent: 'center'}}>
                                    <Box>
                                        <Typography variant="h7" color={'#1976D2'} fontWeight={'bold'}> Buy </Typography>
                                        <Typography textAlign={"center"} variant="h6"> { metrics ? getCounts(metrics).Buy : 0 } </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h7" color={'orange'} fontWeight={'bold'}> Sell </Typography>
                                        <Typography textAlign={"center"} variant="h6"> { metrics ? getCounts(metrics).Sell : 0 } </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h7" color={'gray'} fontWeight={'bold'}> Hold </Typography>
                                        <Typography textAlign={"center"} variant="h6"> { metrics ? getCounts(metrics).Hold : 0 } </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{mt: 4, textAlign: 'center', marginTop: 1}}>
                                    <Typography variant="h7">Recommendation:</Typography>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color:
                                                recommendation === 'Strong Buy'
                                                    ? '#1976D2'
                                                    : recommendation === 'Buy'
                                                        ? '#488DCE'
                                                        : recommendation === 'Hold'
                                                            ? 'grey'
                                                            : recommendation === 'Sell'
                                                                ? 'orange'
                                                                : 'red',
                                            fontWeight: 'bold',
                                            mt: 1,
                                        }}
                                    >
                                        {recommendation}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{display: 'flex', flexDirection: 'column', justifyContent:'space-around', marginLeft: 1.5, border: '2px solid lightgray', borderRadius: '10px', padding: 3, textAlign: 'center'}}>
                                <Button
                                    sx={{color:'black',  backgroundColor: period === '1d' ? 'lightgray' : 'transparent'}}
                                    onClick={ () => { setPeriod('1d')}}
                                >
                                    1d
                                </Button>
                                <Button onClick={()=> {setPeriod('1w')}} sx={{color:'black',  backgroundColor: period === '1w' ? 'lightgray' : 'transparent'}}>
                                    1w
                                </Button>
                                <Button onClick={()=> {setPeriod('1m')}} sx={{color:'black',  backgroundColor: period === '1m' ? 'lightgray' : 'transparent'}}>
                                    1m
                                </Button>
                                <Button sx={{ color: 'white', background: '#212121', borderRadius: '40%', paddingLeft: 2, paddingRight: 2 }} onClick={handleNavigate}>
                                    More..
                                </Button>
                            </Box>
                        </Box>
                        </Box>

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
                            allSymbols={allSymbols}
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
