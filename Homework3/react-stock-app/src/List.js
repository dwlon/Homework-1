import { useEffect, useState } from "react";
import './List.css';

const List = () => {
    const [state, setState] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 100; // Define how many rows to display per page

    useEffect(() => {
        fetch('http://localhost:8080/api/all')
            .then(response => response.json())
            .then(data => {
                setState(data);
            });
    }, []);

    // Calculate the rows for the current page
    const currentData = state.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // Change the page
    const handlePageChange = (newPage) => setCurrentPage(newPage);

    const totalPages = Math.ceil(state.length / rowsPerPage);

    return (
        <>
            <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next</button>
            </div>
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
                {currentData.map((obj) => (
                    <tr key={`${obj.issuer}-${obj.date}`}>
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
            <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next</button>
            </div>
        </>
    );
};

export default List;
