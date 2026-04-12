import React from 'react';

const FIELD_SIZE = 363;
const SVG_SIZE = 320;
const SCALE = SVG_SIZE / FIELD_SIZE;
const CENTER_X = 182 * SCALE;
const CENTER_Y = 182 * SCALE;

const COLORS = {
  0: { stroke: '#475569', dot: '#334155' },
  1: { stroke: '#60a5fa', dot: '#3b82f6' },
  2: { stroke: '#a78bfa', dot: '#8b5cf6' },
  3: { stroke: '#f59e0b', dot: '#d97706' },
  4: { stroke: '#34d399', dot: '#10b981' },
  6: { stroke: '#f87171', dot: '#ef4444' },
};

function getColor(runs) {
  if (runs === 0) return COLORS[0];
  if (runs === 1) return COLORS[1];
  if (runs === 2) return COLORS[2];
  if (runs === 3) return COLORS[3];
  if (runs === 4) return COLORS[4];
  if (runs >= 6) return COLORS[6];
  return COLORS[1];
}

const WagonWheel = ({ balls = [] }) => {
  const fieldUrl = `${import.meta.env.BASE_URL}cricket-field.webp`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-full overflow-hidden" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
        {/* Cricket field background */}
        <img
          src={fieldUrl}
          alt="cricket field"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        {/* SVG overlay */}
        <svg
          width={SVG_SIZE}
          height={SVG_SIZE}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="absolute inset-0"
        >
          {balls.map((ball, i) => {
            const bx = ball.x * SCALE;
            const by = ball.y * SCALE;
            const color = getColor(ball.runs);
            const isDot = ball.runs === 0;
            return (
              <g key={i}>
                {!isDot && (
                  <line
                    x1={CENTER_X} y1={CENTER_Y}
                    x2={bx} y2={by}
                    stroke={color.stroke}
                    strokeWidth={ball.runs >= 6 ? 1.8 : ball.runs === 4 ? 1.5 : 1}
                    strokeOpacity={0.7}
                  />
                )}
                <circle
                  cx={bx} cy={by}
                  r={isDot ? 2 : ball.runs >= 4 ? 4 : 3}
                  fill={color.dot}
                  fillOpacity={isDot ? 0.5 : 0.9}
                />
              </g>
            );
          })}
          {/* Pitch marker */}
          <circle cx={CENTER_X} cy={CENTER_Y} r={5} fill="#fff" fillOpacity={0.8} />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-xs font-bold">
        {[
          { label: 'Dot', color: '#475569' },
          { label: '1–3', color: '#60a5fa' },
          { label: '4', color: '#34d399' },
          { label: '6', color: '#f87171' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
            <span className="text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WagonWheel;
