// PredictionsCard.js
import React from 'react';
import { Box, Paper, CardContent, Typography } from '@mui/material';

const PredictionsCard = ({ data }) => {
    const { name, price, change, changeColor } = data;
    const isPositive = changeColor === 'green';

    return isPositive ? (
        <Paper
            elevation={4}
            sx={{
                width: 150,
                borderRadius: 2,
                p: 2,
                boxShadow: 3,
            }}
        >
            <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                    {name}
                </Typography>
                <Typography variant="body2">{price}</Typography>
                <Typography variant="body2" sx={{ color: changeColor }}>
                    {change}
                </Typography>
            </CardContent>
        </Paper>
    ) : (
        <Box
            sx={{
                width: 150,
                borderRadius: 2,
                p: 2,
            }}
        >
            <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                    {name}
                </Typography>
                <Typography variant="body2">{price}</Typography>
                <Typography variant="body2" sx={{ color: changeColor }}>
                    {change}
                </Typography>
            </CardContent>
        </Box>
    );
};

export default PredictionsCard;
