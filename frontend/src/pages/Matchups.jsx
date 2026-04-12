import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Swords, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ── Shared table headers / row renderers ─────────────────────────

const BatterVsBowlerTable = ({ rows, good }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <th className="pb-3 px-3">Bowler</th>
          <th className="pb-3 px-3 text-center">Balls</th>
          <th className="pb-3 px-3 text-center">Runs</th>
          <th className="pb-3 px-3 text-center">SR</th>
          <th className="pb-3 px-3 text-center">Avg</th>
          <th className="pb-3 px-3 text-center">Dis%</th>
        </tr>
      </thead>
      <tbody>
        {rows?.map((b) => (
          <tr key={b.bowler} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <td className="py-3 px-3 font-bold">{b.bowler}</td>
            <td className="py-3 px-3 text-center text-slate-400">{b.balls}</td>
            <td className="py-3 px-3 text-center font-bold">{b.runs}</td>
            <td className="py-3 px-3 text-center">
              <span className={`font-extrabold ${good ? 'text-emerald-400' : 'text-rose-400'}`}>{b.strike_rate}</span>
            </td>
            <td className="py-3 px-3 text-center">{b.average}</td>
            <td className="py-3 px-3 text-center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${b.dismissal_rate > 2 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                {b.dismissal_rate}%
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StyleTable = ({ rows, good }) => (
  <div className="space-y-2">
    {rows?.map((s) => {
      const max = Math.max(...(rows.map(r => r.strike_rate)));
      return (
        <div key={s.style} className="flex items-center gap-3 py-2 border-b border-white/5">
          <span className="w-12 text-xs font-extrabold text-slate-300">{s.style}</span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${good ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${(s.strike_rate / (max || 1)) * 100}%` }}
            />
          </div>
          <span className={`text-xs font-extrabold w-12 text-right ${good ? 'text-emerald-400' : 'text-rose-400'}`}>SR {s.strike_rate}</span>
          <span className="text-xs text-slate-500 w-16 text-right">{s.balls}b · {s.dismissal_rate}%dis</span>
        </div>
      );
    })}
  </div>
);

const BowlerVsBatterTable = ({ rows, good }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <th className="pb-3 px-3">Batter</th>
          <th className="pb-3 px-3 text-center">Balls</th>
          <th className="pb-3 px-3 text-center">Runs</th>
          <th className="pb-3 px-3 text-center">Wkts</th>
          <th className="pb-3 px-3 text-center">Econ</th>
          <th className="pb-3 px-3 text-center">SR Con</th>
        </tr>
      </thead>
      <tbody>
        {rows?.map((b) => (
          <tr key={b.batter} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <td className="py-3 px-3 font-bold">{b.batter}</td>
            <td className="py-3 px-3 text-center text-slate-400">{b.balls}</td>
            <td className="py-3 px-3 text-center font-bold">{b.runs_conceded}</td>
            <td className="py-3 px-3 text-center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${b.wickets > 0 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-slate-500'}`}>
                {b.wickets}w
              </span>
            </td>
            <td className="py-3 px-3 text-center">
              <span className={`font-extrabold ${good ? 'text-emerald-400' : 'text-rose-400'}`}>{b.economy}</span>
            </td>
            <td className="py-3 px-3 text-center text-slate-400">{b.strike_rate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Main component ────────────────────────────────────────────────

const Matchups = () => {
  const { name: playerName } = useParams();
  const [matchups, setMatchups] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('batter');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/player/${encodeURIComponent(playerName)}/matchups`)
      .then(res => res.json())
      .then(data => { setMatchups(data); setLoading(false); });
  }, [playerName]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">Loading battle data...</p>
    </div>
  );

  const hasBowlerData = matchups?.bowler && Object.keys(matchups.bowler).length > 0;

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <header className="mb-4">
        <h2 className="text-4xl font-display font-extrabold flex items-center gap-4">
          <Swords className="text-primary w-10 h-10" /> {playerName} — Matchup Intelligence
        </h2>
        <p className="text-slate-400 mt-2 text-sm">Head-to-head records, strengths & vulnerabilities</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { key: 'batter', label: 'As Batter' },
          ...(hasBowlerData ? [{ key: 'bowler', label: 'As Bowler' }] : []),
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-3 px-5 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
              tab === t.key
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── AS BATTER ── */}
      {tab === 'batter' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

          {/* Good / Bad vs Bowlers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-morphism rounded-[2rem] p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-emerald-400 w-5 h-5" />
                <div>
                  <h3 className="font-display font-bold text-lg">Favoured Bowlers</h3>
                  <p className="text-slate-500 text-xs uppercase tracking-widest">Top 10 — high SR, low dismissal rate</p>
                </div>
              </div>
              <BatterVsBowlerTable rows={matchups?.batter?.good_vs_bowlers} good />
            </div>

            <div className="glass-morphism rounded-[2rem] p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingDown className="text-rose-400 w-5 h-5" />
                <div>
                  <h3 className="font-display font-bold text-lg">Tough Bowlers</h3>
                  <p className="text-slate-500 text-xs uppercase tracking-widest">Top 10 — low SR, high dismissal rate</p>
                </div>
              </div>
              <BatterVsBowlerTable rows={matchups?.batter?.bad_vs_bowlers} good={false} />
            </div>
          </div>

          {/* Good / Bad vs Styles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-morphism rounded-[2rem] p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-emerald-400 w-5 h-5" />
                <div>
                  <h3 className="font-display font-bold text-lg">Favoured Bowling Styles</h3>
                  <p className="text-slate-500 text-xs uppercase tracking-widest">Top 5 by SR − dismissal penalty</p>
                </div>
              </div>
              <StyleTable rows={matchups?.batter?.good_vs_styles} good />
            </div>

            <div className="glass-morphism rounded-[2rem] p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingDown className="text-rose-400 w-5 h-5" />
                <div>
                  <h3 className="font-display font-bold text-lg">Tough Bowling Styles</h3>
                  <p className="text-slate-500 text-xs uppercase tracking-widest">Bottom 5 by SR − dismissal penalty</p>
                </div>
              </div>
              <StyleTable rows={matchups?.batter?.bad_vs_styles} good={false} />
            </div>
          </div>

          {/* Pace vs Spin charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-morphism rounded-[2rem] p-8">
              <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                <Activity className="text-indigo-400 w-5 h-5" /> Strike Rate vs Type
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={matchups?.by_type} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="type" stroke="#555" tick={{ fill: '#888', fontWeight: 700, fontSize: 11 }} />
                    <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f0f12', border: 'none', borderRadius: '12px' }} />
                    <Bar dataKey="strike_rate" fill="#6366f1" radius={[8, 8, 0, 0]} name="Strike Rate" barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-morphism rounded-[2rem] p-8">
              <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                <TrendingUp className="text-emerald-400 w-5 h-5" /> Runs Volume vs Type
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={matchups?.by_type} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="type" stroke="#555" tick={{ fill: '#888', fontWeight: 700, fontSize: 11 }} />
                    <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f0f12', border: 'none', borderRadius: '12px' }} />
                    <Bar dataKey="runs" fill="#10b981" radius={[8, 8, 0, 0]} name="Runs" barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Full style matrix */}
          <div className="glass-morphism rounded-[2rem] p-8">
            <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
              <Activity className="text-primary w-5 h-5" /> Style Matchup Matrix
            </h3>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-6">All bowling styles — sorted by balls faced</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <th className="pb-3 px-3">Style</th>
                    <th className="pb-3 px-3 text-center">Balls</th>
                    <th className="pb-3 px-3 text-center">Runs</th>
                    <th className="pb-3 px-3 text-center">SR</th>
                    <th className="pb-3 px-3 text-center">Avg</th>
                    <th className="pb-3 px-3 text-center">Dis%</th>
                  </tr>
                </thead>
                <tbody>
                  {matchups?.by_style?.map((s) => (
                    <tr key={s.style} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-bold text-indigo-400">{s.style}</td>
                      <td className="py-3 px-3 text-center text-slate-400">{s.balls}</td>
                      <td className="py-3 px-3 text-center font-bold">{s.runs}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${s.strike_rate >= 130 ? 'text-emerald-400' : s.strike_rate >= 100 ? 'text-amber-400' : 'text-rose-400'}`}>{s.strike_rate}</span>
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
          </div>
        </motion.div>
      )}

      {/* ── AS BOWLER ── */}
      {tab === 'bowler' && hasBowlerData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

          {/* RHB vs LHB */}
          <div className="glass-morphism rounded-[2rem] p-8">
            <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
              <Users className="text-indigo-400 w-5 h-5" /> vs RHB &amp; LHB
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['RHB', 'LHB'].map(hand => {
                const h = matchups?.bowler?.vs_hand?.[hand];
                if (!h) return null;
                const color = hand === 'RHB' ? 'text-indigo-400' : 'text-emerald-400';
                const bg    = hand === 'RHB' ? 'bg-indigo-500/10' : 'bg-emerald-500/10';
                return (
                  <div key={hand} className={`rounded-2xl p-6 ${bg} space-y-4`}>
                    <p className={`text-sm font-extrabold uppercase tracking-widest ${color}`}>{hand}</p>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <span className="text-slate-400">Balls</span>      <span className="font-bold text-right">{h.balls}</span>
                      <span className="text-slate-400">Runs conceded</span><span className="font-bold text-right">{h.runs_conceded}</span>
                      <span className="text-slate-400">Wickets</span>    <span className={`font-extrabold text-right ${color}`}>{h.wickets}</span>
                      <span className="text-slate-400">Economy</span>    <span className="font-bold text-right">{h.economy}</span>
                      <span className="text-slate-400">SR conceded</span><span className="font-bold text-right">{h.strike_rate}</span>
                      <span className="text-slate-400">Average</span>    <span className="font-bold text-right">{h.average}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Good / Bad vs Batters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-morphism rounded-[2rem] p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-emerald-400 w-5 h-5" />
                <div>
                  <h3 className="font-display font-bold text-lg">Dominated Batters</h3>
                  <p className="text-slate-500 text-xs uppercase tracking-widest">Top 10 — low economy, high wickets</p>
                </div>
              </div>
              <BowlerVsBatterTable rows={matchups?.bowler?.good_vs_batters} good />
            </div>

            <div className="glass-morphism rounded-[2rem] p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingDown className="text-rose-400 w-5 h-5" />
                <div>
                  <h3 className="font-display font-bold text-lg">Tough Batters</h3>
                  <p className="text-slate-500 text-xs uppercase tracking-widest">Top 10 — high economy, low wickets</p>
                </div>
              </div>
              <BowlerVsBatterTable rows={matchups?.bowler?.bad_vs_batters} good={false} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Matchups;
