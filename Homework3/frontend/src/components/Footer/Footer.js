import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
    return (
        <Box sx={{ p: 4, backgroundColor: '#222', color: '#fff', textAlign: 'center' }}>
            <Typography variant="h6">MY LOGO</Typography>
            <Typography variant="body2">Let's talk! 👍</Typography>
            <Typography variant="body2">+97788586458</Typography>
            <Typography variant="body2">Test@Mail.com</Typography>
            <Typography variant="caption" display="block" sx={{ mt: 2, color: '#aaa' }}>
                © 2024 MSE
            </Typography>
        </Box>
    );
};

export default Footer;
