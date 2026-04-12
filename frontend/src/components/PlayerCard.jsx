import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Zap, ChevronRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const PlayerCard = ({ name, delay = 0 }) => {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/player/${encodeURIComponent(name)}/career`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, [name]);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.6 }}
      onClick={() => navigate(`/player/${encodeURIComponent(name)}`)}
      className="group cursor-pointer relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-[2.5rem] blur opacity-0 group-hover:opacity-10 transition duration-500" />
      <div className="relative glass-morphism rounded-[2.5rem] p-8 border-white/5 hover:border-white/10 transition-all flex flex-col h-full bg-[#0f0f12]">
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">CricInsight Elite</div>
          <h3 className="text-2xl font-display font-bold group-hover:text-primary transition-colors">{name}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Runs</div>
            <div className="text-xl font-bold font-display">{stats?.runs || '---'}</div>
          </div>
          <div>
             <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Strike Rate</div>
             <div className="text-xl font-bold font-display text-emerald-400">{stats?.strike_rate || '---'}</div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
           <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
              <Award className="w-3 h-3 text-amber-500" /> Veteran Legend
           </div>
           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
              <ChevronRight className="w-4 h-4" />
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerCard;
