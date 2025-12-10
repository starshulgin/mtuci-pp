import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home-Page/HomePage';
import LoginPage from './pages/Login-Page/LoginPage';
import './App.css';

function App() {
  return (
    
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </Router>
    
  );
}

export default App;
