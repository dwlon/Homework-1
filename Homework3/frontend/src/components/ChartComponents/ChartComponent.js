import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, FormControlLabel, TextField, Box, ButtonGroup } from '@mui/material';
import { createChart, CrosshairMode } from 'lightweight-charts';
import ChartTypeSelector from './ChartTypeSelector';

const ChartComponent = ({ data, chartType, onChartTypeChange, onRangeChange }) => {
    const chartContainerRef = useRef();
    const [showVolume, setShowVolume] = useState(false);
    const [showMinMaxAvgLines, setShowMinMaxAvgLines] = useState(false); // New state
    const [compareSymbol, setCompareSymbol] = useState('');
    const [compareData, setCompareData] = useState([]);

    useEffect(() => {
        if (!data || data.length === 0) return;
        if (!chartContainerRef.current) return;

        // Clear previous chart
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
                horzLines: { visible: false }
            },
            timeScale: {
                timeVisible: true,
                borderVisible: true,
                secondsVisible: false
            }
        });

        chart.timeScale().fitContent();

        let priceSeries;
        if (chartType === 'line') {
            priceSeries = chart.addLineSeries({
                color: '#2196f3',
                lineWidth: 2
            });
            priceSeries.setData(data.map(d => ({ time: d.date, value: d.last_trade_price })));
        } else if (chartType === 'candlestick') {
            priceSeries = chart.addCandlestickSeries();
            priceSeries.setData(data.map(d => ({
                time: d.date,
                open: d.min + (d.max - d.min) * 0.25, // Approximation
                high: d.max,
                low: d.min,
                close: d.last_trade_price
            })));
        } else if (chartType === 'area') {
            const areaSeries = chart.addAreaSeries({
                topColor: 'rgba(33,150,243,0.4)',
                bottomColor: 'rgba(33,150,243,0.0)',
                lineColor: '#2196f3',
                lineWidth: 2
            });
            areaSeries.setData(data.map(d => ({ time: d.date, value: d.last_trade_price })));
            priceSeries = areaSeries;
        } else {
            console.warn(`Unsupported chart type: ${chartType}`);
            // Optionally, set a default chart type
            priceSeries = chart.addLineSeries({
                color: '#2196f3',
                lineWidth: 2
            });
            priceSeries.setData(data.map(d => ({ time: d.date, value: d.last_trade_price })));
        }

        if (showMinMaxAvgLines && data.length > 0) {
            // Calculate min, max, and average
            const prices = data.map(d => d.last_trade_price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

            // Add Min Price Line
            priceSeries.createPriceLine({
                price: minPrice,
                color: 'green',
                lineWidth: 2,
                lineStyle: 2,
                axisLabelVisible: true,
                title: 'Min Price'
            });

            // Add Max Price Line
            priceSeries.createPriceLine({
                price: maxPrice,
                color: 'red',
                lineWidth: 2,
                lineStyle: 2,
                axisLabelVisible: true,
                title: 'Max Price'
            });

            // Add Average Price Line
            priceSeries.createPriceLine({
                price: avgPrice,
                color: 'orange',
                lineWidth: 2,
                lineStyle: 2,
                axisLabelVisible: true,
                title: 'Average Price'
            });
        }

        let volumeSeries = null;
        if (showVolume) {
            volumeSeries = chart.addHistogramSeries({
                color: '#26a69a', // Default color; will override per bar
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '', // set as an overlay by setting a blank priceScaleId
                scaleMargins: {
                    top: 0.7, // highest point of the series will be 70% away from the top
                    bottom: 0,
                },
            });
            // Update scale margins if needed
            volumeSeries.priceScale().applyOptions({
                scaleMargins: {
                    top: 0.7,
                    bottom: 0,
                },
            });

            // Prepare volume data with dynamic colors based on %chg.
            const volumeData = data.map(d => ({
                time: d.date,
                value: d.volume,
                color: (d['percent_change'] !== undefined && d['percent_change'].includes('-'))  ? 'red' : 'green' // Dynamic color
            }));

            volumeSeries.setData(volumeData);
        }

        let compSeries = null;
        if (compareData.length > 0) {
            compSeries = chart.addLineSeries({
                color: '#FF9900',
                lineWidth: 1,
            });
            compSeries.setData(compareData.map(d => ({ time: d.date, value: d.last_trade_price })));
        }

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };

    }, [data, chartType, showVolume, showMinMaxAvgLines, compareData]); // Updated dependency


    const handleAddCompare = async () => {
        if (!compareSymbol.trim()) return;
        const startDate = data[0]?.date;
        const endDate = data[data.length - 1]?.date;
        if (!startDate || !endDate) return;
        const urlSymbol = compareSymbol.trim().toUpperCase();
        try {
            const { fetchChartData } = await import('../../services/api');
            const compData = await fetchChartData(urlSymbol, startDate, endDate);
            setCompareData(compData);
        } catch (error) {
            console.error('Error fetching compare data:', error);
            alert('Failed to fetch compare data. Please check the symbol and try again.');
        }
    };

    const handleRemoveCompare = () => {
        setCompareData([]);
    };

    return (
        <Box className="chart-component-container">
            <Box className="chart-controls" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <ChartTypeSelector chartType={chartType} onChartTypeChange={onChartTypeChange} />

                <ButtonGroup variant="outlined" size="small">
                    <Button onClick={() => onRangeChange('1W')}>1W</Button>
                    <Button onClick={() => onRangeChange('1M')}>1M</Button>
                    <Button onClick={() => onRangeChange('1Y')}>1Y</Button>
                    <Button onClick={() => onRangeChange('10Y')}>10Y</Button>
                </ButtonGroup>

                <FormControlLabel
                    control={<Checkbox checked={showVolume} onChange={(e) => setShowVolume(e.target.checked)} />}
                    label="Show Volume"
                />

                {/* New Checkbox for Min, Max, Avg Lines */}
                <FormControlLabel
                    control={<Checkbox checked={showMinMaxAvgLines} onChange={(e) => setShowMinMaxAvgLines(e.target.checked)} />}
                    label="Show Min, Max, Avg Lines"
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        size="small"
                        label="Compare Symbol"
                        value={compareSymbol}
                        onChange={(e) => setCompareSymbol(e.target.value)}
                        sx={{ width: '120px' }}
                    />
                    <Button variant="contained" size="small" onClick={handleAddCompare}>Add</Button>
                    <Button variant="outlined" size="small" onClick={handleRemoveCompare}>Remove</Button>
                </Box>

            </Box>

            <Box ref={chartContainerRef} className="chart-area" sx={{ position: 'relative', width: '100%', height: 400 }} />
        </Box>
    );
};

export default ChartComponent;
