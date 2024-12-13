// MarketTable.js
import React from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
} from "@mui/material";
import MiniChart from './MiniChart';

const MarketTable = ({ data, count, page, rowsPerPage, handleChangePage }) => {
    return (
        <Box sx={{ display: "flex", justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            <TableContainer component={Paper} sx={{ width: 'fit-content'}}>
                <Table size="small" >
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: '100px', textAlign: 'center', verticalAlign: 'middle' }}>Symbol</TableCell>
                            <TableCell sx={{ width: '100px', textAlign: 'center', verticalAlign: 'middle' }}>LTP</TableCell>
                            <TableCell sx={{ width: '100px', textAlign: 'center', verticalAlign: 'middle' }}>24h %</TableCell>
                            <TableCell sx={{ width: '100px', textAlign: 'center', verticalAlign: 'middle' }}>Quantity</TableCell>
                            <TableCell sx={{ width: '100px', textAlign: 'center', verticalAlign: 'middle' }}>Last 7 Days</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((d, i) => (
                            <TableRow key={i}>
                                <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>{d.symbol}</TableCell>
                                <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>{d.ltp.toFixed(2)}</TableCell>
                                <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle', color: d.change < 0 ? 'red' : 'green' }}>
                                    {(d.change * 100).toFixed(2)}%
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>{d.quantity.toLocaleString()}</TableCell>
                                <TableCell sx={{ width: '300px', display: "flex", justifyContent: 'center', alignItems: 'middle'}}>
                                    <MiniChart data={d.last7Days} color={d.change < 0 ? 'red' : 'green'} topColor={d.change < 0 ? 'red' : 'green'} bottomColor={d.change < 0 ? '#80FF0000' : '#20fc0303'}/>
                                </TableCell>
                            </TableRow>
                        ))}

                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No data available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={count}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[]} // Hide the rows per page selector
                sx={{ float: 'right'}}
            />
        </Box>
    );
};

export default MarketTable;
