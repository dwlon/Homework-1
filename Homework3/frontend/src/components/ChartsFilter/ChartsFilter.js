import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

const ChartsFilter = ({ fromDate, toDate, symbol, onFilter }) => {
    const [tempFrom, setTempFrom] = useState(fromDate);
    const [tempTo, setTempTo] = useState(toDate);
    const [tempSymbol, setTempSymbol] = useState(symbol);

    const handleFind = () => {
        onFilter(tempFrom, tempTo, tempSymbol);
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="h6">Filter</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <TextField
                    label="From"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={tempFrom}
                    onChange={(e) => setTempFrom(e.target.value)}
                />
                <TextField
                    label="To"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={tempTo}
                    onChange={(e) => setTempTo(e.target.value)}
                />
                <TextField
                    label="Symbol"
                    value={tempSymbol}
                    onChange={(e) => setTempSymbol(e.target.value)}
                />
                <Button variant="contained" onClick={handleFind}>Find</Button>
            </Box>
        </Box>
    );
};

export default ChartsFilter;
