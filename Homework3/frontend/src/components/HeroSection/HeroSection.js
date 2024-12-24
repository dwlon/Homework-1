import React from 'react';
import { Box, Grid, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import imageSvg from '../../assets/man-working-on-laptop.png'; // Adjust the path as necessary

const HeroSection = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center', // Centers the Paper horizontally
                alignItems: 'center', // Centers the Paper vertically
                minHeight: '70vh', // Ensures the Box takes at least the full viewport height
                backgroundColor: '#f5f5f5', // Optional: Background color for the surrounding area
                p: 2, // Padding around the Paper
            }}
        >
            <Box
                square
                sx={{
                    p: { xs: 3, md: 6 }, // Responsive padding
                    backgroundColor: '#f5f5f5',
                    maxWidth: 1200, // Maximum width of the Paper
                    width: '100%', // Full width up to the maxWidth
                    /*boxShadow: 3, // Optional: Adds a subtle shadow*/
                }}
            >
                <Grid
                    container
                    spacing={4}
                    alignItems="center"
                    justifyContent="center" // Centers Grid items horizontally
                    textAlign="center" // Centers text inside Grid items
                >
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                            }}
                        >
                            <Typography variant="h2" gutterBottom>
                                Daily Updates of Stock Market
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Stay informed with the latest trends and insights in the stock market. Our comprehensive analysis and real-time data help you make informed investment decisions.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                component={RouterLink}
                                to="/charts"
                                sx={{ mt: 2 }}
                            >
                                See Charts
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {/* Replacing Box with an Image */}
                        <Box
                            component="img"
                            src={imageSvg} // Change to imagePng if you prefer PNG
                            alt="Stock Market Illustration"
                            sx={{
                                width: { xs: '80%', md: '100%' }, // Responsive width
                                height: 'auto',
                                maxWidth: 500, // Adjust as needed
                                borderRadius: 2,
                                mx: 'auto', // Centers the image horizontally
                                display: 'block',
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default HeroSection;
