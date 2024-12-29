// src/components/ChartComponents/ChartComponent.js

import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Checkbox,
    FormControlLabel,
    TextField,
    Box,
    ButtonGroup,
    Autocomplete,
    CircularProgress,
    Tooltip, // <-- new import
} from '@mui/material';
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts';
import ChartTypeSelector from './ChartTypeSelector';
import { fetchIssuerData, fetchLSTMPredictions } from '../../services/api'; // Ensure correct import
import { convertDateFormat, parseNumber } from "../../Utils/Helpres";

const ChartComponent = ({
                            data,
                            chartType,
                            onChartTypeChange,
                            onRangeChange,
                            fromDate,
                            toDate,
                            allSymbols,
                            symbol  // <-- new prop for current issuer
                        }) => {
    const chartContainerRef = useRef();
    const [showVolume, setShowVolume] = useState(false);
    const [showMinMaxAvgLines, setShowMinMaxAvgLines] = useState(false);
    const [compareSymbol, setCompareSymbol] = useState('');
    const [compareData, setCompareData] = useState([]);

    // --------------- NEW STATES FOR PREDICTIONS ---------------
    const [showPredictions, setShowPredictions] = useState(false);
    const [predictionRows, setPredictionRows] = useState([]);
    const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);

    // -------------------- CHART RENDERING ---------------------
    useEffect(() => {
        if (!data || data.length === 0) return;
        if (!chartContainerRef.current) return;

        // Clear out old chart
        chartContainerRef.current.innerHTML = '';

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { type: 'solid', color: '#ffffff' },
                textColor: '#333',
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { visible: false },
            },
            timeScale: {
                timeVisible: true,
                borderVisible: true,
                secondsVisible: false,
            },
        });

        chart.timeScale().fitContent();

        // ----- Add main price series -----
        let priceSeries;
        if (chartType === 'line') {
            priceSeries = chart.addLineSeries({
                color: '#2196f3',
                lineWidth: 2,
            });
            priceSeries.setData(
                data.map((d) => ({
                    time: convertDateFormat(d.date),
                    value: parseNumber(d.last_trade_price),
                }))
            );
        } else if (chartType === 'candlestick') {
            priceSeries = chart.addCandlestickSeries();
            priceSeries.setData(
                data.map((d) => ({
                    time: convertDateFormat(d.date),
                    open: parseNumber(d.last_trade_price),
                    high: parseNumber(d.max),
                    low: parseNumber(d.min),
                    close: parseNumber(d.last_trade_price),
                }))
            );
        } else if (chartType === 'area') {
            const areaSeries = chart.addAreaSeries({
                topColor: 'rgba(33,150,243,0.4)',
                bottomColor: 'rgba(33,150,243,0.0)',
                lineColor: '#2196f3',
                lineWidth: 2,
            });
            areaSeries.setData(
                data.map((d) => ({
                    time: convertDateFormat(d.date),
                    value: parseNumber(d.last_trade_price),
                }))
            );
            priceSeries = areaSeries;
        } else {
            // Fallback
            priceSeries = chart.addLineSeries({
                color: '#2196f3',
                lineWidth: 2,
            });
            priceSeries.setData(
                data.map((d) => ({
                    time: convertDateFormat(d.date),
                    value: parseNumber(d.last_trade_price),
                }))
            );
        }

        // ----- Optional Min/Max/Avg lines -----
        if (showMinMaxAvgLines && data.length > 0) {
            const prices = data.map((d) => parseNumber(d.last_trade_price));
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

            priceSeries.createPriceLine({
                price: minPrice,
                color: 'green',
                lineWidth: 2,
                lineStyle: LineStyle.Dotted,
                axisLabelVisible: true,
                title: 'Min Price',
            });

            priceSeries.createPriceLine({
                price: maxPrice,
                color: 'red',
                lineWidth: 2,
                lineStyle: LineStyle.Dotted,
                axisLabelVisible: true,
                title: 'Max Price',
            });

            priceSeries.createPriceLine({
                price: avgPrice,
                color: 'orange',
                lineWidth: 2,
                lineStyle: LineStyle.Dotted,
                axisLabelVisible: true,
                title: 'Average Price',
            });
        }

        // ----- Volume series (optional) -----
        let volumeSeries = null;
        if (showVolume) {
            volumeSeries = chart.addHistogramSeries({
                color: '#26a69a',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '',
                scaleMargins: {
                    top: 0.7,
                    bottom: 0,
                },
            });

            const volumeData = data.map((d) => {
                const volValue = parseNumber(d.volume);
                // If percent_change is negative => red volume
                const color = d.percent_change && d.percent_change.includes('-') ? 'red' : 'green';
                return {
                    time: convertDateFormat(d.date),
                    value: volValue,
                    color: color,
                };
            });

            volumeSeries.setData(volumeData);
        }

        // ----- Compare symbol series (optional) -----
        if (compareData.length > 0) {
            const compSeries = chart.addLineSeries({
                color: '#FF9900',
                lineWidth: 1,
            });
            compSeries.setData(
                compareData.map((d) => ({
                    time: convertDateFormat(d.date),
                    value: parseNumber(d.last_trade_price),
                }))
            );
        }

        // ----- PREDICTIONS series -----
        if (showPredictions && predictionRows.length > 0) { // <-- updated condition
            // Add a dotted line for predicted data
            const predictionsSeries = chart.addLineSeries({
                color: '#D81B60',   // Choose a distinct color for predictions
                lineWidth: 2,
                lineStyle: LineStyle.Dotted, // Dotted line style
            });

            // Map predictionRows to {time, value}
            const predictionsData = predictionRows.map((p) => ({
                time: convertDateFormat(p.date),   // Ensure date format matches
                value: p.predictedPrice,
            }));

            predictionsSeries.setData(predictionsData);
        }

        // ----- Handle Resize -----
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [
        data,
        chartType,
        showVolume,
        showMinMaxAvgLines,
        compareData,
        showPredictions,   // re-render if toggled
        predictionRows,    // re-render if new predictions fetched
    ]);

    // ------------------- FETCHING PREDICTIONS -------------------
    const handleTogglePredictions = async () => {
        // If user is about to turn OFF predictions:
        if (showPredictions) {
            setShowPredictions(false);
            return;
        }

        // If user is turning ON predictions, fetch them from backend
        try {
            setIsLoadingPredictions(true);
            setPredictionRows([]);  // Clear old data

            // symbol is the currently selected issuer
            const response = await fetchLSTMPredictions(symbol);

            if (response && response.predictionRows) {
                // Extract the last data point from historical data
                const lastDataPoint = data[data.length - 1];
                if (!lastDataPoint) {
                    throw new Error('No historical data available to connect predictions.');
                }

                // Create a new PredictionRowDto object
                const newRow = {
                    date: lastDataPoint.date, // Ensure this matches the format expected by the chart
                    predictedPrice: parseNumber(lastDataPoint.last_trade_price), // Starting point for predictions
                    percentChange: 0, // No change for the last actual data point
                };

                // Prepend the new row to the predictionRows
                const updatedPredictionRows = [newRow, ...response.predictionRows];

                // Update the state with the new prediction rows
                setPredictionRows(updatedPredictionRows);
            }
            setShowPredictions(true);
        } catch (err) {
            console.error('Error fetching LSTM predictions:', err);
            alert('Failed to fetch LSTM predictions. Please try again.');
        } finally {
            setIsLoadingPredictions(false);
        }
    };

    // ------------------- COMPARE SYMBOL LOGIC -------------------
    const handleAddCompare = async () => {
        if (!compareSymbol.trim()) return;
        try {
            const compData = await fetchIssuerData(compareSymbol.trim().toUpperCase(), fromDate, toDate);
            setCompareData(compData);
        } catch (error) {
            console.error('Error fetching compare data:', error);
            alert('Failed to fetch compare data. Please check the symbol and try again.');
        }
    };

    const handleRemoveCompare = () => {
        setCompareData([]);
    };

    // ------------------- CHECK DATA LENGTH ------------------- // <-- new section
    const isShowPredictionsDisabled = data.length < 100; // <-- new

    return (
        <Box className="chart-component-container">
            {/* Top controls */}
            <Box
                className="chart-controls"
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}
            >
                <ChartTypeSelector chartType={chartType} onChartTypeChange={onChartTypeChange} />

                <ButtonGroup variant="outlined" size="small">
                    <Button onClick={() => onRangeChange('1M')}>1M</Button>
                    <Button onClick={() => onRangeChange('1Y')}>1Y</Button>
                    <Button onClick={() => onRangeChange('10Y')}>10Y</Button>
                </ButtonGroup>

                <FormControlLabel
                    control={<Checkbox checked={showVolume} onChange={(e) => setShowVolume(e.target.checked)} />}
                    label="Show Volume"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={showMinMaxAvgLines}
                            onChange={(e) => setShowMinMaxAvgLines(e.target.checked)}
                        />
                    }
                    label="Show Min, Max, Avg Lines"
                />

                {/* Compare symbol controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Autocomplete
                        options={allSymbols}
                        value={compareSymbol}
                        onChange={(event, newValue) => {
                            setCompareSymbol(newValue || '');
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Compare Symbol" variant="outlined" size="small" />
                        )}
                        sx={{ width: '200px' }}
                        freeSolo={false}
                    />
                    <Button variant="contained" size="small" onClick={handleAddCompare}>
                        Add
                    </Button>
                    <Button variant="outlined" size="small" onClick={handleRemoveCompare}>
                        Remove
                    </Button>
                </Box>

                {/* ---- NEW: Show Predictions button with Tooltip ---- */}
                <Tooltip
                    title={isShowPredictionsDisabled ? "The issuer does not have enough data to make predictions." : ""}
                    arrow
                >
                    {/* Wrapping Button with Box to handle Tooltip for disabled state */}
                    <Box>
                        <Button
                            variant="contained"
                            color={showPredictions ? 'secondary' : 'primary'}
                            onClick={handleTogglePredictions}
                            disabled={isLoadingPredictions || isShowPredictionsDisabled} // <-- updated
                        >
                            {isLoadingPredictions ? (
                                <CircularProgress size={20} sx={{ color: '#fff' }} />
                            ) : showPredictions ? (
                                'Hide Predictions'
                            ) : (
                                'Show Predictions'
                            )}
                        </Button>
                    </Box>
                </Tooltip>
            </Box>

            {/* Chart container */}
            <Box
                ref={chartContainerRef}
                className="chart-area"
                sx={{ position: 'relative', width: '100%', height: 400 }}
            />
        </Box>
    );

};

export default ChartComponent;
