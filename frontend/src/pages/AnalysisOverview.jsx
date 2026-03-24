import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, LayoutDashboard, Zap, TrendingUp, PieChart, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const AnalysisOverview = () => {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/players`)
      .then(res => res.json())
      .then(data => setPlayers(data));
  }, []);

  const filteredPlayers = players.filter(p => p.toLowerCase().includes(search.toLowerCase()));

  const features = [
    { title: 'Career Intelligence', desc: 'Deep-dive into runs, strike rates, and overall form across formats.', icon: TrendingUp, color: 'text-indigo-400' },
    { title: 'Technical Mastery', desc: 'Analyze performance precisely against Pace and Spin bowling types.', icon: Zap, color: 'text-emerald-400' },
    { title: 'Field Sector Dominance', desc: 'Interactive wagon wheels showing scoring zones and preferences.', icon: Target, color: 'text-amber-400' },
    { title: 'Dismissal Archetypes', desc: 'Identify patterns and technical flaws through dismissal analysis.', icon: PieChart, color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight">
              Player <span className="text-primary italic">Intelligence</span>
            </h1>
            <p className="text-slate-400 text-xl max-w-2xl leading-relaxed">
              Unlock professional-grade statistical modeling and behavioral analytics for every top-tier cricketer.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div className="space-y-8">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
              <LayoutDashboard className="text-primary" /> Key Capabilities
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {features.map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-morphism p-6 rounded-2xl flex gap-4 items-start border-white/5"
                >
                  <div className={`p-3 rounded-xl bg-black/40 ${f.color}`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{f.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-display font-bold text-white">Select a Player</h2>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search player intelligence database..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0f0f12] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium text-white placeholder:text-slate-600"
              />
            </div>
            
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map(player => (
                  <button 
                    key={player}
                    onClick={() => navigate(`/player/${player}`)}
                    className="w-full text-left p-4 rounded-xl border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group flex justify-between items-center"
                  >
                    <span className="font-bold text-slate-300 group-hover:text-white">{player}</span>
                    <LayoutDashboard className="w-4 h-4 text-slate-600 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))
              ) : (
                <p className="text-slate-600 italic">No intelligence records found...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisOverview;
