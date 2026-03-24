import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Share2, Activity, Shield, Swords } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Matchups = () => {
  const { name: playerName } = useParams();
  const [matchups, setMatchups] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/player/${playerName}/matchups`)
      .then(res => res.json())
      .then(data => {
        setMatchups(data);
        setLoading(false);
      });
  }, [playerName]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Battle Data...</div>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <header className="mb-12">
        <h2 className="text-4xl font-display font-extrabold flex items-center gap-4">
          <Swords className="text-primary w-10 h-10" /> {playerName} vs The World
        </h2>
        <p className="text-slate-400 mt-2">Deep tactical intelligence and head-to-head breakdowns</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Bowlers Table */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-12 glass-morphism rounded-[2.5rem] p-10 overflow-hidden"
        >
          <h3 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
             <Shield className="text-secondary" /> Elite Confrontations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  <th className="pb-4 px-4 font-extrabold">Bowler</th>
                  <th className="pb-4 px-4 font-extrabold text-center">Runs</th>
                  <th className="pb-4 px-4 font-extrabold text-center">Balls</th>
                  <th className="pb-4 px-4 font-extrabold text-center">Outs</th>
                  <th className="pb-4 px-4 font-extrabold text-right">SR</th>
                </tr>
              </thead>
              <tbody>
                {matchups?.top_bowlers.map((b, i) => (
                  <tr key={b.bowler} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5">
                    <td className="py-6 px-4 font-bold text-lg group-hover:text-primary transition-colors">{b.bowler}</td>
                    <td className="py-6 px-4 text-center font-bold text-xl">{b.runs}</td>
                    <td className="py-6 px-4 text-center text-slate-400 font-medium">{b.balls}</td>
                    <td className="py-6 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.outs > 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                        {b.outs} {b.outs === 1 ? 'Out' : 'Outs'}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-right font-display font-extrabold text-secondary">{b.strike_rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Strike Rate Mastery */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-6 glass-morphism rounded-[2.5rem] p-10 flex flex-col min-h-[500px]"
        >
          <h3 className="text-2xl font-display font-bold mb-10 flex items-center gap-3">
             <Zap className="text-primary" /> Strike Rate
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matchups?.by_type} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="type" stroke="#555" tick={{ fill: '#888', fontWeight: 700 }} />
                <YAxis stroke="#555" tick={{ fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f12', border: 'none', borderRadius: '16px' }} 
                />
                <Bar dataKey="strike_rate" fill="#6366f1" radius={[10, 10, 0, 0]} name="Strike Rate" barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Scoring Volume */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-6 glass-morphism rounded-[2.5rem] p-10 flex flex-col min-h-[500px]"
        >
          <h3 className="text-2xl font-display font-bold mb-10 flex items-center gap-3">
             <TrendingUp className="text-secondary" /> Runs Volume
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matchups?.by_type} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="type" stroke="#555" tick={{ fill: '#888', fontWeight: 700 }} />
                <YAxis stroke="#555" tick={{ fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f12', border: 'none', borderRadius: '16px' }} 
                />
                <Bar dataKey="runs" fill="#10b981" radius={[10, 10, 0, 0]} name="Total Runs" barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Matchups;
