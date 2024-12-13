import React from 'react';
import MiniChart from './MiniChart';

const MarketTable = ({ data }) => {
    return (
        <table className="market-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '0.9rem' }}>
            <thead>
            <tr>
                <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Symbol</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>LTP</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>24h %</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Quantity</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Last 7 Days</th>
            </tr>
            </thead>
            <tbody>
            {data.map((d, i) => (
                <tr key={i}>
                    <td style={{ borderBottom: '1px solid #ddd', padding: '10px', verticalAlign: 'middle', textAlign: 'center'}}>{d.symbol}</td>
                    <td style={{ borderBottom: '1px solid #ddd', padding: '10px', verticalAlign: 'middle', textAlign: 'center' }}>{d.ltp.toFixed(2)}</td>
                    <td style={{ borderBottom: '1px solid #ddd', padding: '10px', verticalAlign: 'middle', textAlign: 'center', color: d.change < 0 ? 'red' : 'green' }}>
                        {d.change > 0 ? `+${(d.change * 100).toFixed(2)}%` : `${(d.change * 100).toFixed(2)}%`}
                    </td>
                    <td style={{ borderBottom: '1px solid #ddd', padding: '10px', verticalAlign: 'middle', textAlign: 'center' }}>{d.quantity.toLocaleString()}</td>
                    <td style={{ borderBottom: '1px solid #ddd', padding: '10px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <MiniChart data={d.last7Days} color={d.change < 0 ? 'red' : 'green'} />
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default MarketTable;
