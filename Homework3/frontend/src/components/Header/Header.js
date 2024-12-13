import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            // If we had a dedicated search page:
            // navigate(`/search?query=${e.target.value}`);
            // For now, do nothing.
        }
    };

    return (
        <header className="header-container">
            <div className="logo">MY LOGO</div>
            <nav className="nav-menu">
                <Link to="/">Home</Link>
                <Link to="/charts">Charts</Link>
                <Link to="/technical">Technical Analysis</Link>
                <Link to="/fundamental">Fundamental Analysis</Link>
                <Link to="/lstm">LSTM</Link>
            </nav>
            <div className="search-bar">
                <input type="text" placeholder="Search Stock" onKeyDown={handleSearch} />
            </div>
        </header>
    );
};

export default Header;
