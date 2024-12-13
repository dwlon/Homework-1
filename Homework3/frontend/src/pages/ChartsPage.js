import React, { useEffect, useState } from 'react';
import Header from '../components/Header/Header';
import ChartsFilter from '../components/ChartsFilter/ChartsFilter';
import ChartComponent from '../components/ChartComponents/ChartComponent';
import HistoricalTable from '../components/HistoricalTable/HistoricalTable';
import Footer from '../components/Footer/Footer';

import { fetchChartData } from '../services/api';

const ChartsPage = () => {
    // Default values: last 30 days and symbol "ALKALOID"
    const today = new Date();
    const fromDateDefault = new Date(today);
    fromDateDefault.setDate(fromDateDefault.getDate() - 30);

    const [fromDate, setFromDate] = useState(fromDateDefault.toISOString().slice(0,10));
    const [toDate, setToDate] = useState(today.toISOString().slice(0,10));
    const [symbol, setSymbol] = useState("ALKALOID");
    const [chartData, setChartData] = useState([]);
    const [chartType, setChartType] = useState('line'); // 'line' or 'candlestick'

    // Fetch data based on current filter
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

    return (
        <div className="charts-page">
            <Header />
            <div className="charts-container" style={{ padding: '20px' }}>
                <ChartsFilter
                    fromDate={fromDate}
                    toDate={toDate}
                    symbol={symbol}
                    onFilter={handleFilter}
                />

                <div className="chart-section" style={{ marginTop: '40px' }}>
                    <h2>{symbol}</h2>
                    <ChartComponent data={chartData} chartType={chartType} onChartTypeChange={setChartType} />
                </div>

                <div className="historical-table-section" style={{ marginTop: '40px' }}>
                    <h3>Historical Data</h3>
                    <HistoricalTable data={chartData} />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ChartsPage;
