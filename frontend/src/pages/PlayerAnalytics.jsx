import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, TrendingUp, Target, Users, Share2, 
  PieChart as PieChartIcon, Activity, Zap, 
  Award, BarChart2, ChevronDown, Monitor
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend,
  AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

import { useParams, useNavigate } from 'react-router-dom';
import WagonWheel from '../components/WagonWheel';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const PlayerAnalytics = () => {
  const { name: playerName } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [career, setCareer] = useState(null);
  const [matchups, setMatchups] = useState(null);
  const [dismissals, setDismissals] = useState([]);
  const [zones, setZones] = useState([]);
  const [wagonBalls, setWagonBalls] = useState([]);
  const [wicketShots, setWicketShots] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/players`)
      .then(res => res.json())
      .then(data => setPlayers(data));
  }, []);

  useEffect(() => {
    if (playerName) {
      setLoading(true);
      Promise.all([
        fetch(`${API_BASE}/player/${playerName}/career`).then(res => res.json()),
        fetch(`${API_BASE}/player/${playerName}/matchups`).then(res => res.json()),
        fetch(`${API_BASE}/player/${playerName}/dismissals`).then(res => res.json()),
        fetch(`${API_BASE}/player/${playerName}/zones`).then(res => res.json()),
        fetch(`${API_BASE}/player/${playerName}/wicket-shots`).then(res => res.json()),
        fetch(`${API_BASE}/player/${playerName}/phases`).then(res => res.json()),
      ]).then(([careerData, matchupsData, dismissalsData, zonesData, wicketShotsData, phasesData]) => {
        setCareer(careerData);
        setMatchups(matchupsData);
        setDismissals(dismissalsData);
        setZones(zonesData?.zones ?? zonesData ?? []);
        setWagonBalls(zonesData?.balls ?? []);
        setWicketShots(wicketShotsData);
        setPhases(Array.isArray(phasesData) ? phasesData : []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [playerName]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading && !career) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
      />
      <p className="text-slate-400 font-display animate-pulse">Gathering Match Intelligence...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        
        <header className="mb-12">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight">
              {playerName} <span className="text-primary italic">Intelligence</span>
            </h1>
            <p className="text-slate-400 mt-2 font-medium uppercase tracking-[0.2em] text-xs">Deep Career Analytics & Statistical Modeling</p>
          </motion.div>
        </header>

        <motion.main 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Key Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Runs', value: career?.runs.toLocaleString(), sub: '+8% vs Avg', icon: TrendingUp, color: 'from-indigo-500/20 to-indigo-500/5', iconColor: 'text-indigo-400' },
              { label: 'Strike Rate', value: career?.strike_rate, sub: 'Power Hitter', icon: Zap, color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400' },
              { label: 'Avg / Out', value: career?.average, sub: 'Solid Form', icon: Award, color: 'from-amber-500/20 to-amber-500/5', iconColor: 'text-amber-400' },
              { label: 'Total Matches', value: career?.matches, sub: 'Veteran Tier', icon: Users, color: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-400' },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className={cn(
                  "glass-morphism rounded-[2rem] p-8 border-transparent overflow-hidden relative group",
                  "before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-10 group-hover:before:opacity-20 transition-all",
                  stat.color
                )}
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-2">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-4xl font-display font-extrabold tracking-tighter">{stat.value}</h3>
                    <p className="text-slate-500 text-[10px] font-medium leading-tight">{stat.sub}</p>
                  </div>
                  <div className={cn("p-3 rounded-2xl bg-black/40", stat.iconColor)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                {/* Decorative Element */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-current opacity-[0.03] blur-2xl group-hover:opacity-[0.07] transition-all" />
              </motion.div>
            ))}
          </div>

          {/* Phase Analysis */}
          {phases.length > 0 && (
            <motion.div variants={itemVariants} className="glass-morphism rounded-[2.5rem] p-10">
              <h3 className="text-xl font-display font-bold mb-2">Phase Intelligence</h3>
              <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold opacity-60">Powerplay · Middle · Death</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {phases.map((p) => {
                  const phaseColor = p.phase === 'Powerplay' ? 'indigo' : p.phase === 'Middle' ? 'emerald' : 'rose';
                  const colorMap = { indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', bar: 'bg-indigo-500' }, emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500' }, rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', bar: 'bg-rose-500' } };
                  const c = colorMap[phaseColor];
                  return (
                    <div key={p.phase} className={`rounded-2xl p-6 ${c.bg} space-y-4`}>
                      <p className={`text-xs font-extrabold uppercase tracking-widest ${c.text}`}>{p.phase}</p>
                      <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <span className="text-slate-400">Runs</span><span className="font-bold text-right">{p.runs}</span>
                        <span className="text-slate-400">Balls</span><span className="font-bold text-right">{p.balls}</span>
                        <span className="text-slate-400">SR</span><span className={`font-extrabold text-right ${c.text}`}>{p.strike_rate}</span>
                        <span className="text-slate-400">Average</span><span className="font-bold text-right">{p.average}</span>
                        <span className="text-slate-400">4s / 6s</span><span className="font-bold text-right">{p.fours} / {p.sixes}</span>
                        <span className="text-slate-400">Dot %</span><span className="font-bold text-right">{p.dot_pct}%</span>
                        <span className="text-slate-400">Boundary %</span><span className="font-bold text-right">{p.boundary_pct}%</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Boundary %</span><span>{p.boundary_pct}%</span></div>
                        <div className="h-1.5 bg-white/5 rounded-full"><div className={`h-full ${c.bar} rounded-full`} style={{ width: `${Math.min(p.boundary_pct * 2, 100)}%` }} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Strike Rate Mastery */}
            <motion.div 
              variants={itemVariants} 
              className="lg:col-span-4 glass-morphism rounded-[2.5rem] p-10 flex flex-col min-h-[500px]"
            >
              <div className="mb-10">
                <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                  <Zap className="text-primary" /> Strike Rate
                </h3>
                <p className="text-slate-400 text-sm mt-1">Consistency vs Pace/Spin</p>
              </div>
              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={matchups?.by_type} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="type" stroke="#555" tick={{ fill: '#888', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ backgroundColor: '#0f0f12', border: '1px solid #1e293b', borderRadius: '16px' }}
                      itemStyle={{ color: '#fff', fontSize: '10px' }}
                    />
                    <Bar dataKey="strike_rate" fill="url(#barGradientPrimary)" radius={[6, 6, 0, 0]} barSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Scoring Volume */}
            <motion.div 
              variants={itemVariants} 
              className="lg:col-span-4 glass-morphism rounded-[2.5rem] p-10 flex flex-col min-h-[500px]"
            >
              <div className="mb-10">
                <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                  <TrendingUp className="text-secondary" /> Runs Volume
                </h3>
                <p className="text-slate-400 text-sm mt-1">Accumulation vs Pace/Spin</p>
              </div>
              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={matchups?.by_type} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradientSecondary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="type" stroke="#555" tick={{ fill: '#888', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ backgroundColor: '#0f0f12', border: '1px solid #1e293b', borderRadius: '16px' }}
                      itemStyle={{ color: '#fff', fontSize: '10px' }}
                    />
                    <Bar dataKey="runs" fill="url(#barGradientSecondary)" radius={[6, 6, 0, 0]} barSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Wagon Wheel */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-4 glass-morphism rounded-[2.5rem] p-10 flex flex-col"
            >
              <h3 className="text-xl font-display font-bold mb-2">Wagon Wheel</h3>
              <p className="text-slate-400 text-xs mb-6 uppercase tracking-widest font-bold opacity-60">Scoring Map — 500 ball sample</p>
              <div className="flex-1 flex items-center justify-center">
                <WagonWheel balls={wagonBalls} />
              </div>
            </motion.div>
          </div>
          {/* Bowl Style Breakdown */}
          <motion.div variants={itemVariants} className="glass-morphism rounded-[2.5rem] p-10">
            <h3 className="text-xl font-display font-bold mb-2">Style Matchup Matrix</h3>
            <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold opacity-60">Performance vs Every Bowling Style</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Dismissals - Specialized Card */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-12 glass-morphism rounded-[2.5rem] p-10 flex flex-col"
            >
              <h3 className="text-xl font-display font-bold mb-2">Technical Flaws</h3>
              <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold opacity-60">Dismissal Archetypes</p>
              <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={dismissals}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={8}
                      dataKey="count"
                      nameKey="type"
                      strokeWidth={0}
                    >
                      {dismissals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f0f12', border: 'none', borderRadius: '12px' }}
                    />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Wicket Shots vs Bowler Style */}
          {wicketShots && (
            <motion.div variants={itemVariants} className="glass-morphism rounded-[2.5rem] p-10">
              <h3 className="text-xl font-display font-bold mb-2">Dismissal Heatmap</h3>
              <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold opacity-60">
                Wicket Shots vs Bowling Style
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Shot breakdown */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Top Dismissal Shots</p>
                  <div className="space-y-2">
                    {wicketShots.by_shot?.map((s) => {
                      const max = wicketShots.by_shot[0]?.count || 1;
                      return (
                        <div key={s.shot} className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 w-44 truncate font-medium">{s.shot.replace(/_/g, ' ')}</span>
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full"
                              style={{ width: `${(s.count / max) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-rose-400 w-6 text-right">{s.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Style breakdown */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Dismissals by Bowling Style</p>
                  <div className="space-y-2">
                    {wicketShots.by_style?.map((s) => {
                      const max = wicketShots.by_style[0]?.count || 1;
                      return (
                        <div key={s.style} className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 w-12 font-bold">{s.style}</span>
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${(s.count / max) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-indigo-400 w-6 text-right">{s.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Heatmap table */}
                <div className="lg:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Shot × Style Matrix</p>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="pb-3 px-3 text-left text-slate-500 font-bold">Shot</th>
                          {[...new Set(wicketShots.heatmap?.map(h => h.bowl_style))].sort().map(style => (
                            <th key={style} className="pb-3 px-3 text-center text-slate-500 font-bold">{style}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...new Set(wicketShots.heatmap?.map(h => h.shot))].map(shot => {
                          const rowData = wicketShots.heatmap?.filter(h => h.shot === shot);
                          const styles = [...new Set(wicketShots.heatmap?.map(h => h.bowl_style))].sort();
                          return (
                            <tr key={shot} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="py-3 px-3 font-medium text-slate-300">{shot.replace(/_/g, ' ')}</td>
                              {styles.map(style => {
                                const cell = rowData.find(h => h.bowl_style === style);
                                const count = cell?.count || 0;
                                const intensity = count > 0 ? Math.min(count / 5, 1) : 0;
                                return (
                                  <td key={style} className="py-3 px-3 text-center">
                                    {count > 0 ? (
                                      <span
                                        className="inline-block w-7 h-7 rounded-lg text-white font-bold leading-7"
                                        style={{ backgroundColor: `rgba(239,68,68,${0.15 + intensity * 0.75})` }}
                                      >
                                        {count}
                                      </span>
                                    ) : (
                                      <span className="text-slate-700">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.main>

        <footer className="mt-20 pt-10 border-t border-slate-900 flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-[0.2em]">
          <p>© 2024 DEEPMIND CRIC LABS</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            <a href="#" className="hover:text-primary transition-colors">Data Ethics</a>
            <a href="#" className="hover:text-primary transition-colors">System Status</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PlayerAnalytics;
