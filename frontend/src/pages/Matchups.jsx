import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Shield, Swords, ChevronDown, ChevronUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Matchups = () => {
  const { name: playerName } = useParams();
  const [matchups, setMatchups] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedBowler, setExpandedBowler] = useState(null);

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

      <div className="space-y-8">
        {/* Top Bowlers Table with RHB/LHB expansion */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-morphism rounded-[2.5rem] p-10 overflow-hidden"
        >
          <h3 className="text-2xl font-display font-bold mb-2 flex items-center gap-3">
            <Shield className="text-secondary" /> Elite Confrontations
          </h3>
          <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold opacity-60">Click a bowler to see their RHB / LHB career stats</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  <th className="pb-4 px-4">Bowler</th>
                  <th className="pb-4 px-4 text-center">Runs</th>
                  <th className="pb-4 px-4 text-center">Balls</th>
                  <th className="pb-4 px-4 text-center">Outs</th>
                  <th className="pb-4 px-4 text-right">SR</th>
                  <th className="pb-4 px-4 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {matchups?.top_bowlers.map((b) => (
                  <React.Fragment key={b.bowler}>
                    <tr
                      className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 cursor-pointer"
                      onClick={() => setExpandedBowler(expandedBowler === b.bowler ? null : b.bowler)}
                    >
                      <td className="py-6 px-4 font-bold text-lg group-hover:text-primary transition-colors">{b.bowler}</td>
                      <td className="py-6 px-4 text-center font-bold text-xl">{b.runs}</td>
                      <td className="py-6 px-4 text-center text-slate-400 font-medium">{b.balls}</td>
                      <td className="py-6 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.outs > 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                          {b.outs} {b.outs === 1 ? 'Out' : 'Outs'}
                        </span>
                      </td>
                      <td className="py-6 px-4 text-right font-display font-extrabold text-secondary">{b.strike_rate}</td>
                      <td className="py-6 px-4 text-right text-slate-500">
                        {expandedBowler === b.bowler ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                      </td>
                    </tr>
                    {expandedBowler === b.bowler && (
                      <tr className="bg-white/[0.02] border-b border-white/5">
                        <td colSpan={6} className="px-8 py-6">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{b.bowler} — Career stats vs Handedness</p>
                          <div className="grid grid-cols-2 gap-6 max-w-xl">
                            {['RHB', 'LHB'].map(hand => {
                              const h = b.vs_hand?.[hand];
                              if (!h) return null;
                              return (
                                <div key={hand} className="bg-black/30 rounded-2xl p-5 space-y-3">
                                  <p className={`text-sm font-extrabold uppercase tracking-wider ${hand === 'RHB' ? 'text-indigo-400' : 'text-emerald-400'}`}>{hand}</p>
                                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                                    <span className="text-slate-500">Balls</span><span className="font-bold text-right">{h.balls}</span>
                                    <span className="text-slate-500">Runs</span><span className="font-bold text-right">{h.runs_conceded}</span>
                                    <span className="text-slate-500">Wickets</span><span className="font-bold text-right">{h.wickets}</span>
                                    <span className="text-slate-500">SR</span><span className="font-bold text-right">{h.strike_rate}</span>
                                    <span className="text-slate-500">Average</span><span className="font-bold text-right">{h.average}</span>
                                    <span className="text-slate-500">Economy</span><span className="font-bold text-right">{h.economy}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bowl Style Breakdown Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-[2.5rem] p-10"
        >
          <h3 className="text-2xl font-display font-bold mb-2 flex items-center gap-3">
            <Activity className="text-primary" /> Style Matchup Matrix
          </h3>
          <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold opacity-60">Runs, Strike Rate, Average & Dismissal Rate vs Each Bowling Style</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  <th className="pb-4 px-4">Style</th>
                  <th className="pb-4 px-4 text-center">Balls</th>
                  <th className="pb-4 px-4 text-center">Runs</th>
                  <th className="pb-4 px-4 text-center">SR</th>
                  <th className="pb-4 px-4 text-center">Average</th>
                  <th className="pb-4 px-4 text-center">Dismissal %</th>
                </tr>
              </thead>
              <tbody>
                {matchups?.by_style?.map((s) => (
                  <tr key={s.style} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-bold text-primary">{s.style}</td>
                    <td className="py-4 px-4 text-center text-slate-400">{s.balls}</td>
                    <td className="py-4 px-4 text-center font-bold">{s.runs}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold ${s.strike_rate >= 130 ? 'text-emerald-400' : s.strike_rate >= 100 ? 'text-amber-400' : 'text-red-400'}`}>
                        {s.strike_rate}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold">{s.average}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.dismissal_rate > 2 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                        {s.dismissal_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Strike Rate & Runs by Pace/Spin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-morphism rounded-[2.5rem] p-10 flex flex-col min-h-[500px]"
          >
            <h3 className="text-2xl font-display font-bold mb-10 flex items-center gap-3">
              <TrendingUp className="text-primary" /> Strike Rate vs Type
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matchups?.by_type} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="type" stroke="#555" tick={{ fill: '#888', fontWeight: 700 }} />
                  <YAxis stroke="#555" tick={{ fill: '#888' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f0f12', border: 'none', borderRadius: '16px' }} />
                  <Bar dataKey="strike_rate" fill="#6366f1" radius={[10, 10, 0, 0]} name="Strike Rate" barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-morphism rounded-[2.5rem] p-10 flex flex-col min-h-[500px]"
          >
            <h3 className="text-2xl font-display font-bold mb-10 flex items-center gap-3">
              <TrendingUp className="text-secondary" /> Runs vs Type
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matchups?.by_type} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="type" stroke="#555" tick={{ fill: '#888', fontWeight: 700 }} />
                  <YAxis stroke="#555" tick={{ fill: '#888' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f0f12', border: 'none', borderRadius: '16px' }} />
                  <Bar dataKey="runs" fill="#10b981" radius={[10, 10, 0, 0]} name="Total Runs" barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Matchups;
