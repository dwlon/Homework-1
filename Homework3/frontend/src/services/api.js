export const fetchMarketData = async () => {
    // simulate fetching data
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { symbol: 'AAPL', ltp: 150.32, change: 0.0145, quantity: 45332, last7Days: [148,149,150,151,150,151,150], sector: 'Technology' },
                { symbol: 'GOOGL', ltp: 2820.5, change: -0.0512, quantity: 34823, last7Days: [2850,2840,2830,2820,2810,2800,2790], sector: 'Technology' },
                { symbol: 'TSLA', ltp: 1082.70, change: -0.0375, quantity: 34823, last7Days: [1100,1095,1090,1080,1085,1082,1081], sector: 'Automotive' },
                { symbol: 'META', ltp: 315.70, change: 0.0145, quantity: 5219, last7Days: [310,312,313,314,315,316,315], sector: 'Technology' },
                { symbol: 'AMZN', ltp: 3400.0, change: 0.025, quantity: 40000, last7Days: [3300,3320,3350,3360,3380,3390,3400], sector: 'Technology' },
                { symbol: 'NFLX', ltp: 500.0, change: -0.01, quantity: 20000, last7Days: [510,509,508,507,506,505,500], sector: 'Entertainment' },
                { symbol: 'MSFT', ltp: 300.0, change: 0.03, quantity: 10000, last7Days: [290,292,295,298,300,302,300], sector: 'Technology' },
                { symbol: 'IBM', ltp: 145.0, change: -0.02, quantity: 15000, last7Days: [150,149,148,147,146,145,144], sector: 'Technology' },
            ]);
        }, 500);
    });
};


// services/api.js
export const fetchChartData = async (symbol, fromDate, toDate) => {
    // symbol: string, fromDate: 'YYYY-MM-DD', toDate: 'YYYY-MM-DD'
    // We'll generate random data over the last 10 years for demonstration.
    // In real scenario, this would fetch from the backend with filters.

    function getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    const fromTime = new Date(fromDate).getTime();
    const toTime = new Date(toDate).getTime();

    // Generate daily data for the last 10 years:
    // 10 years ~ 3650 days
    let data = [];
    const start = new Date();
    start.setFullYear(start.getFullYear() - 10);

    for (let d = new Date(start); d <= new Date(); d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0,10);
        const basePrice = getRandomFloat(100, 3000);
        const max = basePrice + getRandomFloat(0, 50);
        const min = basePrice - getRandomFloat(0, 50);
        const last_trade_price = (max + min) / 2;
        const percent_change = (Math.random() - 0.5) / 10; // between -5% and +5%
        const volume = Math.floor(getRandomFloat(1000, 50000));
        const total_turnover = volume * last_trade_price;
        const turnover_best = total_turnover / 2;
        const avg_price = (max + min) / 2;

        data.push({
            issuer: symbol,
            date: dateStr,
            last_trade_price,
            max,
            min,
            avg_price,
            percent_change,
            volume,
            turnover_best,
            total_turnover
        });
    }

    // Filter by symbol, fromDate, toDate
    data = data.filter(d => d.issuer === symbol
        && new Date(d.date).getTime() >= fromTime
        && new Date(d.date).getTime() <= toTime);

    return data;
};
