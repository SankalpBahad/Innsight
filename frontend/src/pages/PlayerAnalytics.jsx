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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const PlayerAnalytics = () => {
  const { name: playerName } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [career, setCareer] = useState(null);
  const [matchups, setMatchups] = useState(null);
  const [dismissals, setDismissals] = useState([]);
  const [zones, setZones] = useState([]);
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
        fetch(`${API_BASE}/player/${playerName}/zones`).then(res => res.json())
      ]).then(([careerData, matchupsData, dismissalsData, zonesData]) => {
        setCareer(careerData);
        setMatchups(matchupsData);
        setDismissals(dismissalsData);
        setZones(zonesData);
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
              <h3 className="text-xl font-display font-bold mb-2">Scoring Hotzones</h3>
              <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold opacity-60">Field Sector Dominance</p>
              <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={zones}>
                    <PolarGrid stroke="#222" />
                    <PolarAngleAxis dataKey="zone" tick={{ fill: '#666', fontSize: 10, fontWeight: 700 }} />
                    <Radar
                      name="Runs"
                      dataKey="runs"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.4}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#0f0f12', border: 'none', borderRadius: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
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
