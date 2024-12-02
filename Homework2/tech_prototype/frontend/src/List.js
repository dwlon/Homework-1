import {useEffect, useState} from "react";
import './List.css';
const List = () => {
    const [state, setState] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/all')
            .then(response => response.json())
            .then(data => {
                setState(data);
            })
    }, []);

    return (
        <table>
            <thead>
            <tr>
                <th>Issuer</th>
                <th>Date</th>
                <th>Last Trade Price</th>
                <th>Max</th>
                <th>Min</th>
                <th>Average Price</th>
                <th>Percent Change</th>
                <th>Volume</th>
                <th>Turnover (Best)</th>
                <th>Total Turnover</th>
            </tr>
            </thead>
            <tbody>
            {state.map((obj) => (
                <tr key={`${obj.issuer}-${obj.date}`}> {/* Composite key */}
                    <td>{obj.issuer}</td>
                    <td>{obj.date}</td>
                    <td>{obj.last_trade_price}</td>
                    <td>{obj.max}</td>
                    <td>{obj.min}</td>
                    <td>{obj.avg_price}</td>
                    <td>{obj.percent_change}</td>
                    <td>{obj.volume}</td>
                    <td>{obj.turnover_best}</td>
                    <td>{obj.total_turnover}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
export default List;