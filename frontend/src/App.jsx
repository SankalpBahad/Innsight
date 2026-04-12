import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PlayerAnalytics from './pages/PlayerAnalytics';
import Matchups from './pages/Matchups';
import AnalysisOverview from './pages/AnalysisOverview';
import MatchupsOverview from './pages/MatchupsOverview';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analysis" element={<AnalysisOverview />} />
          <Route path="/matchups" element={<MatchupsOverview />} />
          <Route path="/player/:name" element={<PlayerAnalytics />} />
          <Route path="/matchups/:name" element={<Matchups />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
