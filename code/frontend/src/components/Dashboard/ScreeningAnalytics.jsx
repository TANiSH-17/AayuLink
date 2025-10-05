import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

// simple deterministic generator so the charts look stable every reload
function makeSeededRand(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export default function ScreeningAnalytics() {
  const { barData, lineData, pieData } = useMemo(() => {
    // BAR: screenings per day (last 14 days)
    const randBar = makeSeededRand(7);
    const now = new Date();
    const barData = Array.from({ length: 14 }).map((_, idx) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (13 - idx));
      const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const total = Math.floor(randBar() * 120) + 40; // 40..160
      return { day: label, screenings: total };
    });

    // LINE: positive % over last 30 days
    const randLine = makeSeededRand(21);
    const lineData = Array.from({ length: 30 }).map((_, idx) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - idx));
      const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const pct = Math.round((0.08 + randLine() * 0.22) * 1000) / 10; // 8%..30%
      return { day: label, positivePct: pct };
    });

    // PIE: pathogen distribution
    const raw = { MRSA: 36, CRE: 22, ESBL: 18, VRE: 9, Others: 15 };
    const pieData = Object.entries(raw).map(([name, value]) => ({ name, value }));

    return { barData, lineData, pieData };
  }, []);

  const PIE_COLORS = ['#ef4444', '#6366f1', '#10b981', '#f59e0b', '#0ea5e9'];

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="text-xs text-slate-500">Screenings (7 days)</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            {barData.slice(-7).reduce((a,b)=>a+b.screenings,0)}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="text-xs text-slate-500">Avg. Positive % (30 days)</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            {Math.round(lineData.reduce((a,b)=>a+b.positivePct,0)/lineData.length)}%
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="text-xs text-slate-500">Top Pathogen</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            MRSA
          </div>
        </div>
      </div>

      {/* Bar + Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Screenings per Day</h3>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="screenings" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">MDR Positive % (Last 30 Days)</h3>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis unit="%" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="positivePct" dot={false} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie */}
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Pathogen Distribution</h3>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
