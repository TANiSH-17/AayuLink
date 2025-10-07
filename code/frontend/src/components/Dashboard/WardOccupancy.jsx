import React, { useMemo, useState } from 'react';

function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateWardsForHospital(hospitalId) {
  const rnd = hashSeed(hospitalId || 'default');
  const letters = ['A','B','C','D','E','F'];
  const wards = [];
  for (const L of letters) {
    for (let n = 1; n <= 6; n++) {
      const r = rnd();
      const level = r > 0.72 ? 'risk' : r > 0.42 ? 'observe' : 'safe';
      const occ   = 4 + Math.floor(rnd() * 9);
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

export default function WardOccupancy({ selectedHospital, onWardSelect = () => {}, selectedWard = '' }) {
  const hospitalId   = selectedHospital?.id || 'default';
  const allWards = useMemo(() => generateWardsForHospital(hospitalId), [hospitalId]);
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return allWards;
    return allWards.filter(w => w.level === filter);
  }, [allWards, filter]);

  return (
    <div>
      <div className="flex items-center justify-end gap-3 mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-2 py-1.5 text-sm bg-white"
          aria-label="Filter wards"
        >
          <option value="all">All Wards</option>
          <option value="risk">Risk</option>
          <option value="observe">Observe</option>
          <option value="safe">Safe</option>
        </select>
      </div>

      {/* --- CORRECTED: Reverted to a standard responsive grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filtered.map((w) => (
          <div
            key={w.id}
            onClick={() => onWardSelect(w.id)}
            className={`rounded-xl border p-4 ring-1 ring-black/5 transition-all bg-white cursor-pointer
              ${selectedWard === w.id 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md hover:ring-blue-300'
              }`
            }
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