// src/components/TechnicalAnalysis/TechnicalAnalysis.js
import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Autocomplete,
    TextField,
    CircularProgress,
    Alert,
} from '@mui/material';
import { fetchPrecomputedMetrics, fetchAllIssuers } from '../services/api';

const TechnicalAnalysis = () => {
    const [allSymbols, setAllSymbols] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('1d');
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recommendation, setRecommendation] = useState('');

    useEffect(() => {
        const fetchSymbols = async () => {
            try {
                const issuers = await fetchAllIssuers();
                setAllSymbols(issuers);
            } catch (err) {
                console.error('Failed to fetch symbols:', err);
                setError('Failed to load symbols.');
            }
        };
        fetchSymbols();
    }, []);

    const handleAnalyze = async () => {
        if (!selectedSymbol || !selectedPeriod) {
            setError('Please select both symbol and period.');
            return;
        }
        setError('');
        setLoading(true);
        setMetrics(null);
        setRecommendation('');

        try {
            const data = await fetchPrecomputedMetrics(selectedSymbol, selectedPeriod);
            if (data) {
                setMetrics(data);
                const rec = analyzeIndicators(data);
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

    const analyzeIndicators = (data) => {
        // Define thresholds for indicators
        const thresholds = {
            rsi: {overbought: 70, oversold: 30},
            macd: {aboveSignal: true, belowSignal: false}, // MACD > Signal Line
            stoch: {overbought: 80, oversold: 20},
            ao: {positive: true, negative: false},
            williams: {overbought: -20, oversold: -80},
            cci: {overbought: 100, oversold: -100},
            sma_ema: {bullish: 'sma < ema', bearish: 'sma > ema'},
            ema_sma: {bullish: 'ema < sma', bearish: 'ema > sma'},
            wma_ema: {bullish: 'wma < ema', bearish: 'wma > ema'},
            hma_ema: {bullish: 'hma < ema', bearish: 'hma > ema'},
            ibl: {
                // Define custom thresholds if applicable
                // For example:
                // overbought: 30000,
                // oversold: 20000
                // Since IBL is a mid-point indicator, thresholds might vary based on context
                // Here, we'll skip it or set arbitrary values
                overbought: 28000,
                oversold: 25000,
            },
        };

        let score = 0;

        // Helper function to check if a value is null or undefined
        const isValid = (value) => value !== null && value !== undefined;

        // RSI Analysis
        if (isValid(data.rsi)) {
            if (data.rsi > thresholds.rsi.overbought) {
                score -= 2;
            } else if (data.rsi < thresholds.rsi.oversold) {
                score += 2;
            }
        }


        // MACD Analysis
        // Assuming MACD Signal Line is another value, but since only MACD is provided,
        // We'll consider negative MACD as bearish and positive as bullish
        if (isValid(data.macd)) {
            if (data.macd < 0) {
                score -= 2;
            } else if (data.macd > 0) {
                score += 2;
            }
        }


        // Stochastic Oscillator Analysis
        if (isValid(data.stoch)) {
            if (data.stoch > thresholds.stoch.overbought) {
                score -= 2;
            } else if (data.stoch < thresholds.stoch.oversold) {
                score += 2;
            }
        }


        // Awesome Oscillator (AO) Analysis
        if (isValid(data.ao)) {
            if (data.ao > 0) {
                score += 1;
            } else if (data.ao < 0) {
                score -= 1;
            }
        }


        // Williams %R Analysis
        if (isValid(data.williams)) {
            if (data.williams > thresholds.williams.overbought) {
                score -= 2;
            } else if (data.williams < thresholds.williams.oversold) {
                score += 2;
            }
        }


        // CCI Analysis
        if (isValid(data.cci)) {
            if (data.cci > thresholds.cci.overbought) {
                score -= 2;
            } else if (data.cci < thresholds.cci.oversold) {
                score += 2;
            }
        }


        // SMA vs EMA Analysis
        if (data.sma > data.ema) {
            score -= 1; // Bearish
        } else if (data.sma < data.ema) {
            score += 1; // Bullish
        }

        // EMA vs SMA Analysis (redundant with above, but included for completeness)
        if (isValid(data.sma) && isValid(data.ema)) {
            if (data.ema > data.sma) {
                score += 1; // Bullish
            } else if (data.ema < data.sma) {
                score -= 1; // Bearish
            }
        }


        // WMA vs EMA Analysis
        if (isValid(data.hma) && isValid(data.ema)){
            if (data.wma > data.ema) {
                score -= 1; // Bearish
            } else if (data.wma < data.ema) {
                score += 1; // Bullish
            }
        }


        // HMA vs EMA Analysis
        if (isValid(data.hma) && isValid(data.ema)){
            if (data.hma > data.ema) {
                score -= 1; // Bearish
            } else if (data.hma < data.ema) {
                score += 1; // Bullish
            }
        }


        // IBL Analysis (custom thresholds)
        if (isValid(data.ibl)) {
            if (data.ibl > thresholds.ibl.overbought) {
                score -= 1;
            } else if (data.ibl < thresholds.ibl.oversold) {
                score += 1;
            }
        }


        // Determine recommendation based on score
        if (score >= 10) return 'Strong Buy';
        if (score >= 7) return 'Buy';
        if (score >= 3) return 'Hold';
        if (score >= -2) return 'Hold';
        if (score >= -7) return 'Sell';
        return 'Strong Sell';
    };

    return (
        <Box sx={{p: 4, backgroundColor: '#f5f5f5', borderRadius: 2, maxWidth: 800, margin: '10px auto', height: '100vh'}}>
            <Typography variant="h5" gutterBottom>
                Technical Analysis
            </Typography>

            <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2}}>
                <Autocomplete
                    options={allSymbols}
                    value={selectedSymbol}
                    onChange={(event, newValue) => {
                        setSelectedSymbol(newValue);
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Select Symbol" variant="outlined"/>
                    )}
                    sx={{flex: 1, minWidth: 200}}
                />

                <Autocomplete
                    options={['1d', '1w', '1m']}
                    value={selectedPeriod}
                    onChange={(event, newValue) => {
                        setSelectedPeriod(newValue);
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Select Period" variant="outlined"/>
                    )}
                    sx={{flex: 1, minWidth: 200}}
                    disableClearable
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAnalyze}
                    disabled={loading}
                    sx={{flex: '0 0 150px', minWidth: 150, height: 56}}
                >
                    {loading ? <CircularProgress size={24} color="inherit"/> : 'Analyze'}
                </Button>
            </Box>

            {error && (
                <Box sx={{mt: 2}}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}

            {metrics && (
                <Box sx={{mt: 4}}>
                    <Typography variant="h6" gutterBottom>
                        Indicators:
                    </Typography>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Typography>RSI:</Typography>
                            <Typography>{metrics.rsi ? metrics.rsi.toFixed(2) : 'N/A'}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Typography>MACD:</Typography>
                            <Typography>{metrics.macd ? metrics.macd.toFixed(2) : 'N/A'}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Typography>Stochastic Oscillator:</Typography>
                            <Typography>{metrics.stoch && metrics.stoch.toFixed ? metrics.stoch.toFixed(2) : 'N/A'}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Typography>Awesome Oscillator (AO):</Typography>
                            <Typography>{metrics.ao && metrics.ao.toFixed ? metrics.ao.toFixed(2) : 'N/A'}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Typography>Williams %R:</Typography>
                            <Typography>{metrics.williams ? metrics.williams.toFixed(2) : 'N/A'}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Typography>CCI:</Typography>
                            <Typography>{metrics.cci ? metrics.cci.toFixed(2) : 'N/A'}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Typography>SMA:</Typography>
                            <Typography>{metrics.sma ? metrics.sma.toFixed(2) : 'N/A'}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Typography>EMA:</Typography>
                            <Typography>{metrics.ema ? metrics.ema.toFixed(2) : 'N/A'}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Typography>WMA:</Typography>
                            <Typography>{metrics.wma ? metrics.wma.toFixed(2) : 'N/A'}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Typography>HMA:</Typography>
                            <Typography>{metrics.hma ? metrics.hma.toFixed(2) : 'N/A'}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Typography>IBL:</Typography>
                            <Typography>{metrics.ibl ? metrics.ibl.toFixed(2) : 'N/A'}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{mt: 4, textAlign: 'center'}}>
                        <Typography variant="h6">Recommendation:</Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                color:
                                    recommendation === 'Strong Buy'
                                        ? 'green'
                                        : recommendation === 'Buy'
                                            ? 'lightgreen'
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
            )}
        </Box>
    );
};
export default TechnicalAnalysis;
