import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import ChartTypeSelector from './ChartTypeSelector';
import './ChartComponent.css';

const ChartComponent = ({ data, chartType, onChartTypeChange }) => {
    const chartContainerRef = useRef();
    const tooltipRef = useRef();

    const [showVolume, setShowVolume] = useState(false);
    const [showPriceLine, setShowPriceLine] = useState(true);
    const [compareSymbol, setCompareSymbol] = useState('');
    const [compareData, setCompareData] = useState([]);
    const [seriesObjects, setSeriesObjects] = useState({ priceSeries: null, volumeSeries: null, compareSeries: null });

    // For demonstration, handle multiple ranges. We'll just call a callback or event externally,
    // but here we can simulate by adjusting data range from parent in a real case.
    // In a real scenario, you might have a prop function that refetches data with new date ranges.
    // For now, we assume `data` prop changes when parent fetches new data.

    useEffect(() => {
        if (!data || data.length === 0) return;
        // Clear previous chart instance
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

        // Price Series
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
                open: d.min + (d.max - d.min) * 0.25,
                high: d.max,
                low: d.min,
                close: d.last_trade_price
            })));
        } else if (chartType === 'area') {
            const areaSeries = chart.addAreaSeries({ topColor: 'rgba(33, 150, 243,0.4)', bottomColor: 'rgba(33, 150, 243,0.0)', lineColor: '#2196f3', lineWidth: 2 });
            areaSeries.setData(data.map(d => ({ time: d.date, value: d.last_trade_price })));
            priceSeries = areaSeries;
        }

        // Price Line
        if (showPriceLine && data.length > 0) {
            const lastPrice = data[data.length - 1].last_trade_price;
            priceSeries.createPriceLine({
                price: lastPrice,
                color: 'red',
                lineWidth: 2,
                lineStyle: 2,
                axisLabelVisible: true,
                title: 'Last Price'
            });
        }

        // Volume Series
        let volumeSeries = null;
        if (showVolume) {
            volumeSeries = chart.addHistogramSeries({
                priceFormat: { type: 'volume' },
                priceScaleId: '',
                color: '#26a69a',
                lineWidth: 2,
                overlay: false,
                scaleMargins: {
                    top: 0.8,
                    bottom: 0
                }
            });

            volumeSeries.setData(data.map(d => ({
                time: d.date, value: d.volume
            })));
        }

        // Compare Series
        let compSeries = null;
        if (compareData.length > 0) {
            // We'll just add a line series for the compare symbol
            compSeries = chart.addLineSeries({
                color: '#FF9900',
                lineWidth: 1,
            });
            compSeries.setData(compareData.map(d => ({ time: d.date, value: d.last_trade_price })));
        }

        // Tooltips
        const toolTip = document.createElement('div');
        toolTip.className = 'chart-tooltip';
        toolTip.style.display = 'none';
        toolTip.style.position = 'absolute';
        toolTip.style.background = 'rgba(255, 255, 255, 0.9)';
        toolTip.style.border = '1px solid #ccc';
        toolTip.style.padding = '5px';
        toolTip.style.fontSize = '12px';
        toolTip.style.pointerEvents = 'none';
        chartContainerRef.current.appendChild(toolTip);

        chart.subscribeCrosshairMove((param) => {
            if (
                param.point === undefined ||
                param.time === undefined
            ) {
                toolTip.style.display = 'none';
                return;
            }

            toolTip.style.display = 'block';
            const price = param.seriesPrices.get(priceSeries);
            const dateStr = param.time;
            toolTip.innerHTML = `Date: ${dateStr}<br/>Price: ${price ? price.toFixed(2) : 'N/A'}`;
            const coordinate = chart.priceScale('right').priceToCoordinate(price);
            const x = param.point.x;
            const y = coordinate - 30;
            toolTip.style.left = x + 'px';
            toolTip.style.top = y + 'px';
        });

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };
        window.addEventListener('resize', handleResize);

        setSeriesObjects({ priceSeries, volumeSeries, compareSeries: compSeries });

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, chartType, showVolume, showPriceLine, compareData]);

    // For demonstration, let's simulate loading older data on demand:
    const loadMoreData = async () => {
        // This could call a function that fetches older data by expanding the fromDate range.
        // For now, just log a message or simulate pushing more data into the parent.
        alert('Load more data (simulate infinite history) would fetch older data and prepend to chartData');
    };

    // Add compare symbol
    const handleAddCompare = async () => {
        if (!compareSymbol.trim()) return;
        // In a real scenario, fetch data for the compareSymbol with the same date range:
        const startDate = data[0].date;
        const endDate = data[data.length - 1].date;
        const urlSymbol = compareSymbol.trim().toUpperCase();
        // Reuse fetchChartData from services:
        const { fetchChartData } = await import('../../services/api');
        const compData = await fetchChartData(urlSymbol, startDate, endDate);
        setCompareData(compData);
    };

    // Remove compare series
    const handleRemoveCompare = () => {
        setCompareData([]);
    };

    // Range switches:
    const handleRangeChange = async (range) => {
        // This would actually inform the parent to refetch data for a new range.
        // Since we control from/to date from parent in previous steps, you'd integrate a callback.
        // Here, we simulate by just alerting.
        // In a real integration:
        // onRangeChange('1M') => parent sets fromDate = today - 1 month, toDate = today, fetchData();
        alert(`Range switched to: ${range}. Implement logic to refetch data in parent component.`);
    };

    return (
        <div className="chart-component-container">
            <div className="chart-controls">
                <ChartTypeSelector chartType={chartType} onChartTypeChange={onChartTypeChange} />

                {/* Range Switcher */}
                <div className="range-switcher">
                    <button onClick={() => handleRangeChange('1W')}>1W</button>
                    <button onClick={() => handleRangeChange('1M')}>1M</button>
                    <button onClick={() => handleRangeChange('1Y')}>1Y</button>
                    <button onClick={() => handleRangeChange('10Y')}>10Y</button>
                </div>

                {/* Volume Toggle */}
                <label style={{ marginLeft: '10px' }}>
                    <input type="checkbox" checked={showVolume} onChange={(e) => setShowVolume(e.target.checked)} />
                    Show Volume
                </label>

                {/* Price Line Toggle */}
                <label style={{ marginLeft: '10px' }}>
                    <input type="checkbox" checked={showPriceLine} onChange={(e) => setShowPriceLine(e.target.checked)} />
                    Show Last Price Line
                </label>

                {/* Compare Symbol */}
                <div style={{ marginLeft: '10px', display: 'inline-block' }}>
                    <input
                        type="text"
                        placeholder="Compare Symbol"
                        value={compareSymbol}
                        onChange={(e) => setCompareSymbol(e.target.value)}
                        style={{ width: '100px', marginRight: '5px' }}
                    />
                    <button onClick={handleAddCompare}>Add</button>
                    <button onClick={handleRemoveCompare}>Remove</button>
                </div>

                {/* Load More Data (Infinite History Simulation) */}
                <button style={{ marginLeft: '10px' }} onClick={loadMoreData}>Load More Data</button>
            </div>

            <div ref={chartContainerRef} className="chart-area" style={{ position: 'relative' }}></div>
        </div>
    );
};

export default ChartComponent;
