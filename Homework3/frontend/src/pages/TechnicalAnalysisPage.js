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
import ShowMetric from "./ShowMetric";

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
            console.log("DATA", data)
            const rec = analyzeIndicators(data)
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

    let thresholds = {
        rsi: {overbought: 70, oversold: 30},
        macd: {aboveSignal: true, belowSignal: false},
        stoch: {overbought: 80, oversold: 20},
        ao: {positive: true, negative: false},
        williams: {overbought: -20, oversold: -80},
        cci: {overbought: 100, oversold: -100},
        sma_ema: {bullish: 'sma < ema', bearish: 'sma > ema'},
        ema_sma: {bullish: 'ema < sma', bearish: 'ema > sma'},
        wma_ema: {bullish: 'wma < ema', bearish: 'wma > ema'},
        hma_ema: {bullish: 'hma < ema', bearish: 'hma > ema'},
        ibl: {
            overbought: 28000,
            oversold: 25000,
        },
    };

    function makeObject(metric, data, result) {
        data[metric] = {
            value: data[metric] ? data[metric].toFixed(2) : null,
            "result": result
        }
    }

    const analyzeIndicators = (data) => {
        let score = 0;
        const isValid = (value) => value !== null && value !== undefined;

        if (isValid(data.rsi)) {
            if (data.rsi > thresholds.rsi.overbought) {
                score -= 1;
                makeObject('rsi', data, 'Buy');

            } else if (data.rsi < thresholds.rsi.oversold) {
                score += 1;
                makeObject('rsi', data, 'Sell');
            }
        }

        if (isValid(data.macd)) {
            if (data.macd < 0) {
                score -= 1;
                makeObject('macd', data, 'Buy');
            } else if (data.macd > 0) {
                score += 1;
                makeObject('macd', data, 'Sell');
            }
        }

        if (isValid(data.stoch)) {
            if (data.stoch > thresholds.stoch.overbought) {
                score -= 1;
                makeObject('stoch', data, 'Buy');
            } else if (data.stoch < thresholds.stoch.oversold) {
                score += 1
                makeObject('stoch', data, 'Sell');
            }
        }

        if (isValid(data.ao)) {
            if (data.ao > 0) {
                score += 1;
                makeObject('ao', data, 'Buy');
            } else if (data.ao < 0) {
                score -= 1;
                makeObject('macd', data, 'Sell');
            }
        }

        if (isValid(data.williams)) {
            if (`data`.williams > thresholds.williams.overbought) {
                score -= 2;
                makeObject('williams', data, 'Buy');
            } else if (data.williams < thresholds.williams.oversold) {
                score += 2;
                makeObject('williams', data, 'Sell');
            }
        }

        if (isValid(data.cci)) {
            if (data.cci > thresholds.cci.overbought) {
                score -= 2;
                makeObject('cci', data, 'Sell');
            } else if (data.cci < thresholds.cci.oversold) {
                score += 2;
                makeObject('cci', data, 'Buy');
            }
        }

        if (data.sma > data.ema) {
            score -= 1; // Bearish
            makeObject('sma', data, 'Buy');
        } else if (data.sma < data.ema) {
            score += 1; // Bullish
            makeObject('sma', data, 'Sell');
        }

        if (isValid(data.sma) && isValid(data.ema)) {
            if (data.ema > data.sma) {
                score += 1; // Bullish
                makeObject('ema', data, 'Buy');
            } else if (data.ema < data.sma) {
                score -= 1; // Bearish
                makeObject('ema', data, 'Sell');
            }
        }

        if (isValid(data.hma) && isValid(data.ema)){
            if (data.wma > data.ema) {
                score -= 1; // Bearish
                makeObject('wma', data, 'Buy');
            } else if (data.wma < data.ema) {
                score += 1; // Bullish
                makeObject('wma', data, 'Sell');
            }
        }

        if (isValid(data.hma) && isValid(data.ema)){
            if (data.hma > data.ema) {
                score -= 1; // Bearish
                makeObject('hma', data, 'Buy');
            } else if (data.hma < data.ema) {
                score += 1; // Bullish
                makeObject('hma', data, 'Sell');
            }
        }

        if (isValid(data.ibl)) {
            if (data.ibl > thresholds.ibl.overbought) {
                score -= 1;
                makeObject('ibl', data, 'Buy');
            } else if (data.ibl < thresholds.ibl.oversold) {
                score += 1;
                makeObject('ibl', data, 'Sell');
            }
        }

        let buy = getCounts(data).Buy
        let sell = getCounts(data).Sell

        console.log(buy + " "  + sell + "= " + buy/sell)

        if (buy / sell > 2.5) return 'Strong Buy';
        if (buy / sell > 1.5) return 'Buy';
        if (buy / sell > 0.75) return 'Hold';
        if (buy / sell > 0.3) return 'Hold';
        if (buy / sell > 0) return 'Sell';
        return 'Strong Sell';
    };

    function getCounts(metrics) {
        let count = {
            'Buy': 0,
            'Sell': 0,
            'NA': 0
        }

        Object.keys(metrics).forEach(key => {
            let result = metrics[key]?.result;
            if (result === 'Buy') {
                count.Buy++;
            } else if (result === "Sell") {
                count.Sell++;
            } else {
                count.NA++;
            }
        });

        count.NA = count.NA - 4

        return count
    }

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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <ShowMetric title={"RSI:"} value={metrics?.rsi?.value} result={metrics?.rsi?.result} />
                        <ShowMetric title={"MACD:"} value={metrics?.macd?.value} result={metrics?.macd?.result} />
                        <ShowMetric title={"Stochastic Oscillator:"} value={metrics?.stoch?.value} result={metrics?.stoch?.result} />
                        <ShowMetric title={"Awesome Oscillator (AO):"} value={metrics?.ao?.value} result={metrics?.ao?.result} />
                        <ShowMetric title={"Williams %R:"} value={metrics?.williams?.value} result={metrics?.williams?.result} />
                        <ShowMetric title={"CCI:"} value={metrics?.cci?.value} result={metrics?.cci?.result} />
                        <ShowMetric title={"SMA:"} value={metrics?.sma?.value} result={metrics?.sma?.result} />
                        <ShowMetric title={"EMA:"} value={metrics?.ema?.value} result={metrics?.ema?.result} />
                        <ShowMetric title={"WMA:"} value={metrics?.wma?.value} result={metrics?.wma?.result} />
                        <ShowMetric title={"HMA:"} value={metrics?.hma?.value} result={metrics?.hma?.result} />
                        <ShowMetric title={"IBL:"} value={metrics?.ibl?.value} result={metrics?.ibl?.result} />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 5, justifyContent: 'center', marginTop: 5}}>
                        <Box>
                            <Typography variant="h6" color={'green'}> Buy </Typography>
                            <Typography textAlign={"center"} variant="h6"> { getCounts(metrics).Buy } </Typography>
                        </Box>
                        <Box>
                            <Typography variant="h6" color={'orange'}> Sell </Typography>
                            <Typography textAlign={"center"} variant="h6"> { getCounts(metrics).Sell } </Typography>
                        </Box>
                        <Box>
                            <Typography variant="h6" color={'red'}> NA </Typography>
                            <Typography textAlign={"center"} variant="h6"> { getCounts(metrics).NA } </Typography>
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
