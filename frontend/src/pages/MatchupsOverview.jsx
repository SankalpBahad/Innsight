import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Share2, Swords, Shield, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

const MatchupsOverview = () => {
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
    { title: 'Elite Confrontations', desc: 'Detailed head-to-head records against the worlds most dominant bowlers.', icon: Swords, color: 'text-rose-400' },
    { title: 'Technical Mastery', desc: 'Comparative analysis of strike rate and volume versus Pace and Spin.', icon: Activity, color: 'text-primary' },
    { title: 'Interaction Networks', desc: 'Visualizing ball-count involvement and situational dominance patterns.', icon: Share2, color: 'text-purple-400' },
    { title: 'Defensive Resilience', desc: 'Evaluate batting stability and risk management in high-pressure matchups.', icon: Shield, color: 'text-emerald-400' },
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
              Matchup <span className="text-secondary italic">Intelligence</span>
            </h1>
            <p className="text-slate-400 text-xl max-w-2xl leading-relaxed">
              Explore deep tactical breakdowns and head-to-head rivalries utilizing advanced relationship modeling.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div className="space-y-8">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
              <Share2 className="text-secondary" /> Tactical Scope
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
            <h2 className="text-2xl font-display font-bold text-white">Select a Battle</h2>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-secondary transition-colors" />
              <input 
                type="text" 
                placeholder="Search head-to-head records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0f0f12] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all font-medium text-white placeholder:text-slate-600"
              />
            </div>
            
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map(player => (
                  <button 
                    key={player}
                    onClick={() => navigate(`/matchups/${player}`)}
                    className="w-full text-left p-4 rounded-xl border border-white/5 hover:border-secondary/30 hover:bg-secondary/5 transition-all group flex justify-between items-center"
                  >
                    <span className="font-bold text-slate-300 group-hover:text-white">{player}</span>
                    <Share2 className="w-4 h-4 text-slate-600 group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))
              ) : (
                <p className="text-slate-600 italic">No matchup records found...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchupsOverview;
