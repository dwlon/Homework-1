import React from 'react';
import { AppBar, Toolbar, Typography, Box, TextField, InputAdornment } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import SearchIcon from '@mui/icons-material/Search';
import imageSvg from "../../assets/Logo.png";

const Header = () => {
    return (
        <AppBar position="static" sx={{ background: 'black', display: 'flex', justifyContent: 'center', alignItems:"center" }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', width: "80%" }}>
                <Box sx={{ display: 'flex', gap: 2 }}
                    component="img"
                    src={imageSvg} // Change to imagePng if you prefer PNG
                    alt="Logo"
                    sx={{
                        /*width: { xs: '20%', md: '20%' }, // Responsive width*/
                        height: 'auto',
                        maxWidth: 50, // Adjust as needed
                        borderRadius: 2,
                        mx: 'auto', // Centers the image horizontally
                        marginLeft: "0",
                        marginRight: "0"
                    }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Link component={RouterLink} to="/" color="inherit" underline="hover">
                        Home
                    </Link>
                    <Link component={RouterLink} to="/charts" color="inherit" underline="hover">
                        Charts
                    </Link>
                    <Link component={RouterLink} to="/technical" color="inherit" underline="hover">
                        Technical Analysis
                    </Link>
                    <Link component={RouterLink} to="/fundamental" color="inherit" underline="hover">
                        Fundamental Analysis
                    </Link>
                    <Link component={RouterLink} to="/lstm" color="inherit" underline="hover">
                        LSTM
                    </Link>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search Stock"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            sx: {
                                backgroundColor: 'white',
                                borderRadius: 1,
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'white',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'white',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'white',
                                },
                                color: 'black',
                            },
                        }}
                        sx={{
                            width: '200px',
                        }}
                    />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
