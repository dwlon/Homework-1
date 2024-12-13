import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const MiniChart = ({ data, color }) => {
    const chartContainerRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;
        const chart = createChart(chartContainerRef.current, {
            width: 150,
            height: 70,
            layout: {
                background: { type: 'solid', color: 'transparent' },
                textColor: '#333',
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { visible: false },
            },
            timeScale: { visible: false },
            priceScale: { visible: false },
            crosshair: { vertLine: { visible: false }, horzLine: { visible: false } }
        });

        const lineSeries = chart.addLineSeries({
            color: color,
            lineWidth: 2,
        });

        lineSeries.setData(data.map((value, index) => ({ time: index + 1, value })));

        return () => {
            chart.remove();
        };
    }, [data, color]);

    return <div style={{ display: 'flex', justifyContent: 'center', borderBottom: '1px solid #ddd', padding: '10px' }} ref={chartContainerRef} />;
};

export default MiniChart;
