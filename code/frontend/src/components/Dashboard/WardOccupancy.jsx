import React, { useMemo, useState } from 'react';

const LEVELS = ['safe', 'observe', 'risk'];

// deterministic pseudo-random from a string (hospital id)
function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    // xorshift-ish
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateWardsForHospital(hospitalId) {
  const rnd = hashSeed(hospitalId || 'default');
  // A..F × 1..6 = 36 wards
  const letters = ['A','B','C','D','E','F'];
  const wards = [];
  for (const L of letters) {
    for (let n = 1; n <= 6; n++) {
      const r = rnd();
      const level = r > 0.72 ? 'risk' : r > 0.42 ? 'observe' : 'safe';
      const occ   = 4 + Math.floor(rnd() * 9); // 4..12
      wards.push({ id: `${L}${n}`, level, occupancy: occ });
    }
  }
  return wards;
}

const levelBadge = (level) =>
  level === 'risk'
    ? 'bg-red-100 text-red-700 border border-red-200'
    : level === 'observe'
    ? 'bg-amber-100 text-amber-700 border border-amber-200'
    : 'bg-emerald-100 text-emerald-700 border border-emerald-200';

const barColor = (level) =>
  level === 'risk' ? 'bg-red-500' : level === 'observe' ? 'bg-amber-500' : 'bg-emerald-500';

export default function WardOccupancy({ selectedHospital }) {
  const hospitalName = selectedHospital?.name || '—';
  const hospitalId   = selectedHospital?.id || 'default';

  const allWards = useMemo(() => generateWardsForHospital(hospitalId), [hospitalId]);
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return allWards;
    return allWards.filter(w => w.level === filter);
  }, [allWards, filter]);

  const counts = useMemo(() => ({
    total: allWards.length,
    risk: allWards.filter(w => w.level === 'risk').length,
    observe: allWards.filter(w => w.level === 'observe').length,
    safe: allWards.filter(w => w.level === 'safe').length
  }), [allWards]);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Ward Occupancy &amp; Risk</h3>
          <div className="text-sm text-slate-600">
            Hospital:&nbsp;<span className="font-semibold text-slate-800">{hospitalName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded-md bg-red-100 text-red-700 border border-red-200">Risk: {counts.risk}</span>
            <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-700 border border-amber-200">Observe: {counts.observe}</span>
            <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">Safe: {counts.safe}</span>
            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">Total: {counts.total}</span>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm"
            aria-label="Filter wards"
          >
            <option value="all">All Wards</option>
            <option value="risk">Risk</option>
            <option value="observe">Observe</option>
            <option value="safe">Safe</option>
          </select>
        </div>
      </div>

      {/* full-width, tidy grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
        {filtered.map((w) => (
          <div
            key={w.id}
            className="rounded-xl border p-4 ring-1 ring-black/5 hover:shadow-md transition-shadow bg-white"
            style={{ overflow: 'visible' }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-gray-800 leading-tight">
                <div className="text-xs text-gray-500">Ward</div>
                <div className="text-lg">{w.id}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-md whitespace-nowrap ${levelBadge(w.level)}`}>
                {w.level.toUpperCase()}
              </span>
            </div>

            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">Occupancy</div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full">
                <div
                  className={`h-2.5 rounded-full ${barColor(w.level)}`}
                  style={{ width: `${Math.min(100, (w.occupancy / 12) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">{w.occupancy}/12 beds</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
