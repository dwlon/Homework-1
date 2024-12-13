import { Link } from 'react-router-dom';
import './Home.css';
function Home() {
    return (
        <div className="container">
            <h1>Welcome to Macedonian Stock Exchange App</h1>
            <Link to="/list" className="link"> See List </Link>
        </div>
    );
}

export default Home;