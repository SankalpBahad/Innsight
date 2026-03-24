import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Zap, Star, ChevronRight, Trophy, Users } from 'lucide-react';
import PlayerCard from '../components/PlayerCard';

const Home = () => {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => {
        setPlayers(data);
        setFilteredPlayers(data.slice(0, 10)); // Initial top players
      });
  }, []);

  const handleSearch = (val) => {
    setSearch(val);
    const filtered = players.filter(p => p.toLowerCase().includes(val.toLowerCase())).slice(0, 6);
    setFilteredPlayers(filtered);
  };

  const featured = ['Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'AB de Villiers'];

  return (
    <div className="min-h-screen pb-20 overflow-hidden relative">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] -z-10" />

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-6 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest">
            <Trophy className="w-3 h-3" /> The Ultimate IPL Intelligence Platform
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-extrabold tracking-tight leading-[0.9]">
            Analyze Every <span className="text-gradient">Ball</span>.<br />
            Master Every <span className="text-secondary italic">Match</span>.
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Next-generation cricket analytics powered by deep-data intelligence. 
            Real-time insights for pros and fans alike.
          </p>

          {/* Immersive Search Container */}
          <div className="pt-10 max-w-xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-all duration-500" />
            <div className="relative glass-morphism rounded-[2rem] p-2 flex items-center bg-[#0f0f12]">
              <Search className="ml-4 text-primary w-6 h-6" />
              <input 
                type="text"
                placeholder="Search for a player (e.g. Virat Kohli)"
                className="flex-1 bg-transparent border-none py-4 px-4 text-lg focus:outline-none placeholder:text-slate-600 font-medium"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                Explore <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Search Suggestions */}
            <AnimatePresence>
              {search && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-4 glass-morphism rounded-3xl p-4 z-50 overflow-hidden"
                >
                  {filteredPlayers.length > 0 ? (
                    filteredPlayers.map((p, i) => (
                      <button
                        key={p}
                        onClick={() => navigate(`/player/${encodeURIComponent(p)}`)}
                        className="w-full text-left px-6 py-4 rounded-2xl hover:bg-white/5 flex justify-between items-center group transition-colors"
                      >
                        <span className="font-semibold text-lg">{p}</span>
                        <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="p-10 text-center text-slate-500">No results found</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-display font-bold flex items-center gap-3">
              <Star className="text-accent overflow-hidden" /> Featured Legends
            </h2>
            <p className="text-slate-400 mt-2 font-medium">Curated deep-dives into the greatest performers</p>
          </div>
          <button className="text-slate-400 hover:text-white font-bold flex items-center gap-2 transition-colors uppercase tracking-widest text-xs">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map((name, i) => (
            <PlayerCard key={name} name={name} delay={0.1 * i} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5">
         <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
               <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">In-Memory Processing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Lightning fast ball-by-ball analysis powered by high-concurrency Pandas optimization.</p>
         </div>
         <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
               <TrendingUp className="text-emerald-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Predictive Matchups</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Advanced H2H intelligence predicting performance against specific bowling styles.</p>
         </div>
      </section>
    </div>
  );
};

export default Home;
