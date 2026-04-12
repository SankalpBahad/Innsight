import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, Zap, Award, Activity, Target,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useParams } from 'react-router-dom';
import WagonWheel from '../components/WagonWheel';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Bowling style full names
const STYLE_NAMES = {
  RF:  'Right-arm Fast',
  RFM: 'Right-arm Fast-Medium',
  RM:  'Right-arm Medium',
  RMF: 'Right-arm Medium-Fast',
  OB:  'Off-break (right-arm off-spin)',
  LBG: 'Leg-break Googly (wrist spin)',
  SLA: 'Slow Left-arm orthodox',
  LF:  'Left-arm Fast',
  LFM: 'Left-arm Fast-Medium',
  LM:  'Left-arm Medium',
  LMF: 'Left-arm Medium-Fast',
  LWS: 'Left-arm Wrist Spin',
  LB:  'Leg-break',
};

const StyleLegend = () => (
  <details className="mt-4">
    <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 transition-colors font-bold uppercase tracking-widest select-none">
      Style abbreviations ▾
    </summary>
    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5">
      {Object.entries(STYLE_NAMES).map(([abbr, full]) => (
        <div key={abbr} className="flex gap-2 text-xs">
          <span className="font-extrabold text-indigo-400 w-10 shrink-0">{abbr}</span>
          <span className="text-slate-500">{full}</span>
        </div>
      ))}
    </div>
  </details>
);

// Reusable bar row
const BarRow = ({ label, count, max, color = 'bg-indigo-500', textColor = 'text-indigo-400', labelClass = 'w-44' }) => (
  <div className="flex items-center gap-3">
    <span className={`text-xs font-medium text-slate-400 truncate ${labelClass}`}>{label}</span>
    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${(count / (max || 1)) * 100}%` }} />
    </div>
    <span className={`text-xs font-bold w-6 text-right ${textColor}`}>{count}</span>
  </div>
);

const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

// ── Tab button ──────────────────────────────────────────────────
const Tab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`pb-3 px-6 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
      active ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
    }`}
  >
    {children}
  </button>
);

// ── Main ────────────────────────────────────────────────────────
const PlayerAnalytics = () => {
  const { name: playerName } = useParams();
  const [career,      setCareer]      = useState(null);
  const [matchups,    setMatchups]    = useState(null);
  const [dismissals,  setDismissals]  = useState([]);
  const [wagonBalls,  setWagonBalls]  = useState([]);
  const [wicketShots, setWicketShots] = useState(null);
  const [phases,      setPhases]      = useState([]);
  const [wpa,         setWpa]         = useState(null);
  const [bowling,     setBowling]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState('batter');

  useEffect(() => {
    if (!playerName) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/player/${playerName}/career`).then(r => r.json()),
      fetch(`${API_BASE}/player/${playerName}/matchups`).then(r => r.json()),
      fetch(`${API_BASE}/player/${playerName}/dismissals`).then(r => r.json()),
      fetch(`${API_BASE}/player/${playerName}/zones`).then(r => r.json()),
      fetch(`${API_BASE}/player/${playerName}/wicket-shots`).then(r => r.json()),
      fetch(`${API_BASE}/player/${playerName}/phases`).then(r => r.json()),
      fetch(`${API_BASE}/player/${playerName}/wpa`).then(r => r.json()),
      fetch(`${API_BASE}/player/${playerName}/bowling`).then(r => r.ok ? r.json() : null),
    ]).then(([careerD, matchupsD, dismissalsD, zonesD, wicketShotsD, phasesD, wpaD, bowlingD]) => {
      setCareer(careerD);
      setMatchups(matchupsD);
      setDismissals(dismissalsD);
      setWagonBalls(zonesD?.balls ?? []);
      setWicketShots(wicketShotsD);
      setPhases(Array.isArray(phasesD) ? phasesD : []);
      setWpa(wpaD);
      setBowling(bowlingD);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [playerName]);

  if (loading && !career) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
      />
      <p className="text-slate-400 animate-pulse text-sm">Gathering Match Intelligence...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">

        {/* Header */}
        <motion.header initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-8">
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight">
            {playerName} <span className="text-indigo-400 italic">Intelligence</span>
          </h1>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs">Deep Career Analytics &amp; Statistical Modelling</p>
        </motion.header>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 mb-8">
          <Tab active={tab === 'batter'} onClick={() => setTab('batter')}>As Batter</Tab>
          {bowling && <Tab active={tab === 'bowler'} onClick={() => setTab('bowler')}>As Bowler</Tab>}
        </div>

        {/* ══════════════ AS BATTER ══════════════ */}
        {tab === 'batter' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

            {/* Key stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Runs',    value: career?.runs?.toLocaleString(), icon: TrendingUp, grad: 'from-indigo-500/20', iconC: 'text-indigo-400' },
                { label: 'Strike Rate',   value: career?.strike_rate,            icon: Zap,         grad: 'from-emerald-500/20', iconC: 'text-emerald-400' },
                { label: 'Average',       value: career?.average,                icon: Award,       grad: 'from-amber-500/20',   iconC: 'text-amber-400' },
                { label: 'Matches',       value: career?.matches,                icon: Users,       grad: 'from-purple-500/20',  iconC: 'text-purple-400' },
              ].map((s, i) => (
                <motion.div key={i} variants={itemVariants} whileHover={{ y: -4 }}
                  className={cn('glass-morphism rounded-[2rem] p-7 relative overflow-hidden group before:absolute before:inset-0 before:bg-gradient-to-br before:to-transparent before:opacity-10 group-hover:before:opacity-20 transition-all', s.grad)}>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{s.label}</p>
                      <h3 className="text-4xl font-display font-extrabold">{s.value}</h3>
                    </div>
                    <div className={cn('p-3 rounded-2xl bg-black/40', s.iconC)}>
                      <s.icon className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Phase Intelligence */}
            {phases.length > 0 && (
              <motion.div variants={itemVariants} className="glass-morphism rounded-[2.5rem] p-8">
                <h3 className="text-xl font-display font-bold mb-1">Phase Intelligence</h3>
                <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest font-bold">
                  Batting stats split by over range — Powerplay (1–6) · Middle (7–15) · Death (16–20)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {phases.map(p => {
                    const c = p.phase === 'Powerplay'
                      ? { bg: 'bg-indigo-500/10', text: 'text-indigo-400', bar: 'bg-indigo-500' }
                      : p.phase === 'Middle'
                      ? { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500' }
                      : { bg: 'bg-rose-500/10',    text: 'text-rose-400',    bar: 'bg-rose-500' };
                    return (
                      <div key={p.phase} className={`rounded-2xl p-6 ${c.bg} space-y-3`}>
                        <p className={`text-xs font-extrabold uppercase tracking-widest ${c.text}`}>{p.phase}</p>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                          <span className="text-slate-400">Runs</span>        <span className="font-bold text-right">{p.runs}</span>
                          <span className="text-slate-400">Balls</span>       <span className="font-bold text-right">{p.balls}</span>
                          <span className="text-slate-400">SR</span>          <span className={`font-extrabold text-right ${c.text}`}>{p.strike_rate}</span>
                          <span className="text-slate-400">Average</span>     <span className="font-bold text-right">{p.average}</span>
                          <span className="text-slate-400">4s / 6s</span>     <span className="font-bold text-right">{p.fours} / {p.sixes}</span>
                          <span className="text-slate-400">Dot %</span>       <span className="font-bold text-right">{p.dot_pct}%</span>
                          <span className="text-slate-400">Boundary %</span>  <span className="font-bold text-right">{p.boundary_pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full">
                          <div className={`h-full ${c.bar} rounded-full`} style={{ width: `${Math.min(p.boundary_pct * 2, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* WPA */}
            {wpa && (
              <motion.div variants={itemVariants} className="glass-morphism rounded-[2.5rem] p-8">
                <h3 className="text-xl font-display font-bold mb-1">Win Probability Added</h3>
                <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest font-bold">
                  Average WPA per match — how much this player shifts win probability each game on average
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          label: 'Avg WPA / Match',
                          value: wpa.avg_wpa > 0 ? `+${wpa.avg_wpa}` : `${wpa.avg_wpa}`,
                          sub:   `Over ${wpa.matches} matches`,
                          color: wpa.avg_wpa >= 0 ? 'text-emerald-400' : 'text-rose-400',
                        },
                        {
                          label: 'Clutch Avg WPA',
                          value: wpa.clutch_avg_wpa > 0 ? `+${wpa.clutch_avg_wpa}` : `${wpa.clutch_avg_wpa}`,
                          sub:   `When team win% < 30 (${wpa.clutch_matches} matches)`,
                          color: wpa.clutch_avg_wpa >= 0 ? 'text-amber-400' : 'text-rose-400',
                        },
                      ].map(stat => (
                        <div key={stat.label} className="bg-white/5 rounded-2xl p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{stat.label}</p>
                          <p className={`text-3xl font-display font-extrabold ${stat.color}`}>{stat.value}</p>
                          <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white/5 rounded-2xl p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Avg WPA by Phase</p>
                      {Object.entries(wpa.phase_wpa).map(([phase, val]) => {
                        const maxAbs = Math.max(...Object.values(wpa.phase_wpa).map(Math.abs), 0.001);
                        return (
                          <div key={phase} className="flex items-center gap-3 mb-3">
                            <span className="text-sm text-slate-400 w-24">{phase}</span>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${val >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(Math.abs(val) / maxAbs * 100, 100)}%` }} />
                            </div>
                            <span className={`text-sm font-bold w-16 text-right ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {val > 0 ? `+${val}` : val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Top Match Impacts (single match WPA)</p>
                    <div className="space-y-3">
                      {wpa.top_matches?.map((m, i) => (
                        <div key={m.match} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-600 w-5">#{i + 1}</span>
                          <span className="text-xs text-slate-400 flex-1">Match {m.match}</span>
                          <span className={`text-sm font-bold ${m.wpa >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {m.wpa > 0 ? `+${m.wpa}` : m.wpa}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SR + Runs + Wagon Wheel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <motion.div variants={itemVariants} className="lg:col-span-4 glass-morphism rounded-[2.5rem] p-8 flex flex-col min-h-[420px]">
                <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-1"><Zap className="text-indigo-400" /> Strike Rate</h3>
                <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest">vs Pace vs Spin bowling</p>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={matchups?.by_type} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="srGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="type" stroke="#555" tick={{ fill: '#888', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f0f12', border: '1px solid #1e293b', borderRadius: '12px' }} />
                      <Bar dataKey="strike_rate" fill="url(#srGrad)" radius={[6, 6, 0, 0]} barSize={40} name="Strike Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="lg:col-span-4 glass-morphism rounded-[2.5rem] p-8 flex flex-col min-h-[420px]">
                <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-1"><TrendingUp className="text-emerald-400" /> Runs Volume</h3>
                <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest">Total runs scored vs Pace vs Spin</p>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={matchups?.by_type} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="type" stroke="#555" tick={{ fill: '#888', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f0f12', border: '1px solid #1e293b', borderRadius: '12px' }} />
                      <Bar dataKey="runs" fill="url(#runsGrad)" radius={[6, 6, 0, 0]} barSize={40} name="Runs" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="lg:col-span-4 glass-morphism rounded-[2.5rem] p-8 flex flex-col">
                <h3 className="font-display font-bold text-lg mb-1">Wagon Wheel</h3>
                <p className="text-slate-500 text-xs mb-4 uppercase tracking-widest">
                  Ball positions on the field — lines show scoring shots, dots show defensive balls.
                  Sample of 500 balls. <span className="text-emerald-400">Green=4</span>, <span className="text-rose-400">Red=6</span>, <span className="text-blue-400">Blue=1–3</span>
                </p>
                <div className="flex-1 flex items-center justify-center">
                  <WagonWheel balls={wagonBalls} />
                </div>
              </motion.div>
            </div>

            {/* Style matchup matrix */}
            <motion.div variants={itemVariants} className="glass-morphism rounded-[2.5rem] p-8">
              <h3 className="text-xl font-display font-bold mb-1">Style Matchup Matrix</h3>
              <p className="text-slate-500 text-xs mb-1 uppercase tracking-widest font-bold">
                Performance vs every bowling style — sorted by balls faced. SR ≥130 green, ≥100 amber, &lt;100 red. Dismissal % = wickets per 100 balls.
              </p>
              <StyleLegend />
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
                      <th className="pb-3 px-3">Style</th>
                      <th className="pb-3 px-3 text-slate-400 font-normal text-xs normal-case tracking-normal">Full name</th>
                      <th className="pb-3 px-3 text-center">Balls</th>
                      <th className="pb-3 px-3 text-center">Runs</th>
                      <th className="pb-3 px-3 text-center">SR</th>
                      <th className="pb-3 px-3 text-center">Avg</th>
                      <th className="pb-3 px-3 text-center">Dis%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchups?.by_style?.map(s => (
                      <tr key={s.style} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 font-extrabold text-indigo-400">{s.style}</td>
                        <td className="py-3 px-3 text-slate-500 text-xs">{STYLE_NAMES[s.style] ?? '—'}</td>
                        <td className="py-3 px-3 text-center text-slate-400">{s.balls}</td>
                        <td className="py-3 px-3 text-center font-bold">{s.runs}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`font-bold ${s.strike_rate >= 130 ? 'text-emerald-400' : s.strike_rate >= 100 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {s.strike_rate}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">{s.average}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.dismissal_rate > 2 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                            {s.dismissal_rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Dismissals */}
            <motion.div variants={itemVariants} className="glass-morphism rounded-[2.5rem] p-8">
              <h3 className="text-xl font-display font-bold mb-1">Dismissal Breakdown</h3>
              <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest font-bold">
                How this batter gets out — proportion of each dismissal type across career
              </p>
              <div className="flex items-center justify-center min-h-[280px]">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={dismissals} cx="50%" cy="50%" innerRadius={70} outerRadius={95}
                      paddingAngle={8} dataKey="count" nameKey="type" strokeWidth={0}>
                      {dismissals.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f0f12', border: 'none', borderRadius: '12px' }} />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '16px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Wicket Shots Heatmap */}
            {wicketShots && (
              <motion.div variants={itemVariants} className="glass-morphism rounded-[2.5rem] p-8">
                <h3 className="text-xl font-display font-bold mb-1">Dismissal Heatmap</h3>
                <p className="text-slate-500 text-xs mb-8 uppercase tracking-widest font-bold">
                  Shot × Bowling Style matrix — each cell shows how many times this batter was dismissed playing that shot against that bowling style. Darker = more dismissals.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Top Dismissal Shots</p>
                    <div className="space-y-2">
                      {wicketShots.by_shot?.map(s => (
                        <BarRow key={s.shot} label={s.shot.replace(/_/g, ' ')} count={s.count}
                          max={wicketShots.by_shot[0]?.count} color="bg-rose-500" textColor="text-rose-400" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Dismissals by Bowling Style</p>
                    <div className="space-y-2">
                      {wicketShots.by_style?.map(s => (
                        <BarRow key={s.style} label={`${s.style} — ${STYLE_NAMES[s.style] ?? ''}`}
                          count={s.count} max={wicketShots.by_style[0]?.count}
                          color="bg-indigo-500" textColor="text-indigo-400" labelClass="w-52" />
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Shot × Style Matrix</p>
                    <p className="text-xs text-slate-600 mb-4">Each cell = dismissal count. Color intensity scales with count.</p>
                    <div className="overflow-x-auto">
                      <table className="text-xs w-full">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="pb-3 px-3 text-left text-slate-500 font-bold">Shot</th>
                            {[...new Set(wicketShots.heatmap?.map(h => h.bowl_style))].sort().map(style => (
                              <th key={style} className="pb-3 px-3 text-center text-slate-500 font-bold" title={STYLE_NAMES[style]}>{style}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...new Set(wicketShots.heatmap?.map(h => h.shot))].map(shot => {
                            const rowData = wicketShots.heatmap?.filter(h => h.shot === shot);
                            const styles  = [...new Set(wicketShots.heatmap?.map(h => h.bowl_style))].sort();
                            return (
                              <tr key={shot} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-2 px-3 font-medium text-slate-300">{shot.replace(/_/g, ' ')}</td>
                                {styles.map(style => {
                                  const count = rowData.find(h => h.bowl_style === style)?.count || 0;
                                  return (
                                    <td key={style} className="py-2 px-3 text-center">
                                      {count > 0
                                        ? <span className="inline-block w-7 h-7 rounded-lg text-white font-bold leading-7"
                                            style={{ backgroundColor: `rgba(239,68,68,${0.15 + Math.min(count / 5, 1) * 0.75})` }}>{count}</span>
                                        : <span className="text-slate-700">—</span>}
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
          </motion.div>
        )}

        {/* ══════════════ AS BOWLER ══════════════ */}
        {tab === 'bowler' && bowling && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

            {/* Career summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Wickets',   value: bowling.career.wickets,                     color: 'text-indigo-400' },
                { label: 'Economy',   value: bowling.career.economy,                     color: 'text-emerald-400' },
                { label: 'Average',   value: bowling.career.average,                     color: 'text-amber-400' },
                { label: 'Bowl SR',   value: bowling.career.bowling_sr ?? '—',           color: 'text-purple-400' },
                { label: 'Dot %',     value: `${bowling.career.dot_pct}%`,              color: 'text-sky-400' },
                { label: 'Matches',   value: bowling.career.matches,                     color: 'text-slate-300' },
              ].map(s => (
                <motion.div key={s.label} variants={itemVariants} className="glass-morphism rounded-2xl p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{s.label}</p>
                  <p className={`text-3xl font-display font-extrabold ${s.color}`}>{s.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Phase economy + RHB/LHB */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div variants={itemVariants} className="glass-morphism rounded-[2rem] p-8">
                <h3 className="font-display font-bold text-lg mb-1">Phase-wise Economy</h3>
                <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest">
                  Economy rate (runs per 6 balls) in each phase. Lower is better. Also shows wickets and dot ball %.
                </p>
                <div className="space-y-5">
                  {bowling.phases?.map(p => {
                    const c = p.phase === 'Powerplay'
                      ? { text: 'text-indigo-400', bar: 'bg-indigo-500' }
                      : p.phase === 'Middle'
                      ? { text: 'text-emerald-400', bar: 'bg-emerald-500' }
                      : { text: 'text-rose-400',    bar: 'bg-rose-500' };
                    return (
                      <div key={p.phase}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className={`font-extrabold uppercase tracking-wider ${c.text}`}>{p.phase} <span className="text-slate-500 normal-case font-normal">· {p.balls}b · {p.wickets}w · Dot {p.dot_pct}%</span></span>
                          <span className={`font-extrabold ${c.text}`}>{p.economy}</span>
                        </div>
                        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${c.bar} rounded-full`} style={{ width: `${Math.min(p.economy / 14 * 100, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-morphism rounded-[2rem] p-8">
                <h3 className="font-display font-bold text-lg mb-1">vs RHB &amp; LHB</h3>
                <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest">
                  Career bowling stats split by batter handedness — economy, wickets, average, SR conceded, dot %
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {['RHB', 'LHB'].map(hand => {
                    const h = bowling.vs_hand?.[hand];
                    if (!h) return null;
                    const col = hand === 'RHB'
                      ? { text: 'text-indigo-400', bg: 'bg-indigo-500/10' }
                      : { text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
                    return (
                      <div key={hand} className={`rounded-2xl p-5 ${col.bg}`}>
                        <p className={`text-sm font-extrabold uppercase tracking-wider mb-3 ${col.text}`}>{hand}</p>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                          <span className="text-slate-400">Balls</span>         <span className="font-bold text-right">{h.balls}</span>
                          <span className="text-slate-400">Wickets</span>       <span className={`font-extrabold text-right ${col.text}`}>{h.wickets}</span>
                          <span className="text-slate-400">Economy</span>       <span className="font-bold text-right">{h.economy}</span>
                          <span className="text-slate-400">Average</span>       <span className="font-bold text-right">{h.average}</span>
                          <span className="text-slate-400">SR conceded</span>  <span className="font-bold text-right">{h.sr_conceded}</span>
                          <span className="text-slate-400">Dot %</span>         <span className="font-bold text-right">{h.dot_pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Wicket types + shots at wicket */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div variants={itemVariants} className="glass-morphism rounded-[2rem] p-8">
                <h3 className="font-display font-bold text-lg mb-1">Wicket Types</h3>
                <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest">
                  Breakdown of how wickets are taken — caught, bowled, lbw, stumped, run out, etc.
                </p>
                <div className="space-y-2.5">
                  {bowling.wicket_types?.map(w => (
                    <BarRow key={w.type} label={w.type} count={w.count}
                      max={bowling.wicket_types[0]?.count} color="bg-indigo-500" textColor="text-indigo-400" labelClass="w-36" />
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-morphism rounded-[2rem] p-8">
                <h3 className="font-display font-bold text-lg mb-1">Shots at Wicket</h3>
                <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest">
                  What shot the batter was playing when dismissed by this bowler — identifies which deliveries beat the bat
                </p>
                <div className="space-y-2.5">
                  {bowling.wicket_shots?.map(s => (
                    <BarRow key={s.shot} label={s.shot.replace(/_/g, ' ')} count={s.count}
                      max={bowling.wicket_shots[0]?.count} color="bg-rose-500" textColor="text-rose-400" />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Best length + Best line */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div variants={itemVariants} className="glass-morphism rounded-[2rem] p-8">
                <h3 className="font-display font-bold text-lg mb-1">Wicket-Taking Length</h3>
                <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest">
                  Which ball length produces the most wickets. Full = at the batsman's feet; Short = back of length; Yorker = at the base of the stumps.
                </p>
                <div className="space-y-2.5">
                  {bowling.best_length?.map(l => (
                    <BarRow key={l.length} label={l.length.replace(/_/g, ' ')} count={l.wickets}
                      max={bowling.best_length[0]?.wickets} color="bg-amber-500" textColor="text-amber-400" labelClass="w-48" />
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-morphism rounded-[2rem] p-8">
                <h3 className="font-display font-bold text-lg mb-1">Wicket-Taking Line</h3>
                <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest">
                  Which line (direction) produces the most wickets. On the stumps = direct threat to wicket; Outside off stump = invites drives; Down leg = rare wicket ball.
                </p>
                <div className="space-y-2.5">
                  {bowling.best_line?.map(l => (
                    <BarRow key={l.line} label={l.line.replace(/_/g, ' ')} count={l.wickets}
                      max={bowling.best_line[0]?.wickets} color="bg-emerald-500" textColor="text-emerald-400" labelClass="w-48" />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Delivery heatmap */}
            {bowling.delivery_matrix?.length > 0 && (
              <motion.div variants={itemVariants} className="glass-morphism rounded-[2rem] p-8">
                <h3 className="font-display font-bold text-lg mb-1">Wicket Delivery Heatmap</h3>
                <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest">
                  Length × Line matrix — each cell shows wickets taken at that exact combination. Darker indigo = more wickets. The hottest cell is this bowler's most dangerous delivery.
                </p>
                <div className="overflow-x-auto">
                  <table className="text-xs">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="pb-3 pr-6 text-left text-slate-500 font-bold">Length \ Line</th>
                        {[...new Set(bowling.delivery_matrix.map(d => d.line))].sort().map(line => (
                          <th key={line} className="pb-3 px-3 text-center text-slate-500 font-bold whitespace-nowrap">
                            {line.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...new Set(bowling.delivery_matrix.map(d => d.length))].map(length => {
                        const lines   = [...new Set(bowling.delivery_matrix.map(d => d.line))].sort();
                        const maxWkts = Math.max(...bowling.delivery_matrix.map(d => d.wickets));
                        return (
                          <tr key={length} className="border-b border-white/5">
                            <td className="py-3 pr-6 font-medium text-slate-300 whitespace-nowrap">{length.replace(/_/g, ' ')}</td>
                            {lines.map(line => {
                              const w = bowling.delivery_matrix.find(d => d.length === length && d.line === line)?.wickets || 0;
                              return (
                                <td key={line} className="py-3 px-3 text-center">
                                  {w > 0
                                    ? <span className="inline-block w-8 h-8 rounded-lg text-white font-bold leading-8"
                                        style={{ backgroundColor: `rgba(99,102,241,${0.15 + Math.min(w / maxWkts, 1) * 0.8})` }}>{w}</span>
                                    : <span className="text-slate-700">—</span>}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        <footer className="mt-20 pt-10 border-t border-slate-900 flex justify-between items-center text-slate-600 text-xs font-semibold uppercase tracking-[0.2em]">
          <p>© 2025 CricInsight</p>
        </footer>
      </div>
    </div>
  );
};

export default PlayerAnalytics;
