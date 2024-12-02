import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from "./Home";
import List from "./List";

function App() {
  return (
      <Router>
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route path="/list" exact={true}
                 element={<List/>}/>

        </Routes>
      </Router>
  );
}



export default App;
