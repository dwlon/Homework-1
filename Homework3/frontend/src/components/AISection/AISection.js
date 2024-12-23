// AISection.js
import React from 'react';
import {Box, Typography, Stack, Paper, Divider, Grid} from '@mui/material';
import PredictionsCard from './PredictionsCard';

const AISection = () => {
    const predictionsData = [
        { name: 'Stock A', price: '2,434,3434.00', change: '-0.34%', changeColor: 'red' },
        { name: 'Stock B', price: '3,212,3243.00', change: '+1.23%', changeColor: 'green' },
        { name: 'Stock C', price: '1,123,4567.00', change: '+0.45%', changeColor: 'green' },
        { name: 'Stock D', price: '4,333,0000.00', change: '-1.12%', changeColor: 'red' }
    ];

    return (
        <Box sx={{ p: 4, textAlign: 'center', display: 'flex',
            justifyContent: 'center', // Centers the Paper horizontally
            alignItems: 'center', // Centers the Paper vertically
            marginTop: '-100px',

        }}>
            <Paper
                elevation={8} // Adjust elevation as needed for shadow effect
                sx={{
                    width: "fit-content",
                    borderRadius: 4,
                    padding: 5

                }}
            >
                <Grid container>
                    <Typography
                        variant="p"
                        gutterBottom
                        align = "left"
                        sx={{
                            color: 'white', // White text
                            textAlign: 'left', // Align text to the left
                            bgcolor: '#1976d2',
                            paddingTop: 1,
                            paddingBottom: 1,
                            paddingLeft: 2,
                            paddingRight:2,
                            borderRadius: 5
                        }}
                    >
                        AI Predictions
                    </Typography>
                </Grid>

                <Divider
                    sx={{
                        backgroundColor: 'white', // Divider color
                        mb: 3, // Margin bottom
                        mx: 2, // Horizontal margins to avoid touching the ends
                        width: 'calc(100% - 32px)', // Adjust width based on horizontal margins
                        margin: "15px 0px 20px 0px"
                    }}
                />

                <Stack direction="row" spacing={2} justifyContent="center">
                    {predictionsData.map((pd, i) => <PredictionsCard key={i} data={pd} />)}
                </Stack>
            </Paper>
        </Box>
    );
};

export default AISection;
