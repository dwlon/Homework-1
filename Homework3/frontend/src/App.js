import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChartsPage from './pages/ChartsPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/charts" element={<ChartsPage />} />
            </Routes>
        </Router>
    );
}

export default App;
