import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../lib/leaflet.heat';

const gradient = {
  0.00: '#06b6d410',
  0.30: '#22c55e90',
  0.55: '#f59e0b90',
  0.80: '#ef4444c0',
  1.00: '#dc2626'
};

function addPulseMarker(map, h, onClick, isActive) {
  const dot = L.circleMarker([h.lat, h.lng], {
    radius: isActive ? 8 : 6,
    color: isActive ? '#0ea5e9' : '#0891b2',
    weight: isActive ? 2 : 1,
    fillColor: isActive ? '#38bdf8' : '#22d3ee',
    fillOpacity: 0.9
  }).addTo(map);

  dot.bindTooltip(
    `<div style="font-weight:700">${h.name}</div><div style="color:#64748b;font-size:12px">${h.city || ''}</div>`,
    { direction: 'top' }
  );
  dot.on('click', () => onClick && onClick(h));

  // optional forecast halo (High/Medium)
  let halo;
  if (h.forecast?.level === 'High' || h.forecast?.level === 'Medium') {
    halo = L.circle([h.lat, h.lng], {
      radius: 1800,
      color: h.forecast.level === 'High' ? '#ef4444' : '#f59e0b',
      opacity: 0.9,
      fillOpacity: 0.08,
      weight: 2,
    }).addTo(map);
  }

  // soft pulse
  let r = isActive ? 8 : 6;
  let grow = true;
  let op = 0.9;
  const timer = setInterval(() => {
    r += grow ? 0.4 : -0.4;
    op += grow ? 0.01 : -0.01;
    if (r > (isActive ? 11 : 9)) grow = false;
    if (r < (isActive ? 8 : 6)) grow = true;
    dot.setRadius(r);
    dot.setStyle({ fillOpacity: Math.max(0.6, Math.min(1, op)) });
  }, 90);

  return () => {
    clearInterval(timer);
    map.removeLayer(dot);
    if (halo) map.removeLayer(halo);
  };
}

export default function OutbreakHeatmap({ hospitals = [], selected, onSelectHospital, live = true }) {
  const mapRef = useRef(null);
  const heatRef = useRef(null);
  const markersCleanupRef = useRef([]);
  const [isLive, setIsLive] = useState(!!live);
  const liveTimerRef = useRef(null);
  const baseIntensitiesRef = useRef(hospitals.map(h => h.intensity));

  // init
  useEffect(() => {
    const map = L.map('mdr-heatmap', {
      center: [22.5, 79], // center India
      zoom: 5,
      zoomControl: true,
      attributionControl: false
    });
    mapRef.current = map;

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 19 }
    ).addTo(map);

    // initial heat
    const points = hospitals.map(h => [h.lat, h.lng, h.intensity]);
    const heat = L.heatLayer(points, {
      radius: 28, blur: 22, maxZoom: 17, max: 1.0, gradient
    }).addTo(map);
    heatRef.current = heat;

    // markers with forecasting halos
    markersCleanupRef.current = hospitals.map(h =>
      addPulseMarker(map, h, onSelectHospital, selected && selected.id === h.id)
    );

    // legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
      const div = L.DomUtil.create('div');
      div.innerHTML = `
        <div style="
          background:#ffffff;
          color:#0f172a;
          padding:10px 12px;
          border-radius:12px;
          box-shadow:0 10px 30px rgba(2,6,23,.08);
          font-size:12px;
          border:1px solid #e5e7eb;
        ">
          <div style="font-weight:700;margin-bottom:6px;">Outbreak Intensity</div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="height:8px;width:160px;border-radius:999px;background:linear-gradient(90deg,#06b6d4,#22c55e,#f59e0b,#ef4444,#dc2626)"></div>
            <div style="display:flex;gap:6px;color:#475569">
              <span>Low</span><span>•</span><span>High</span>
            </div>
          </div>
        </div>`;
      return div;
    };
    legend.addTo(map);

    return () => {
      markersCleanupRef.current.forEach(fn => fn && fn());
      if (heatRef.current) map.removeLayer(heatRef.current);
      map.remove();
    };
  }, []); // once

  // re-draw markers when selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersCleanupRef.current.forEach(fn => fn && fn());
    markersCleanupRef.current = hospitals.map(h =>
      addPulseMarker(map, h, onSelectHospital, selected && selected.id === h.id)
    );
  }, [selected, hospitals, onSelectHospital]);

  // live “breathing” heat animation
  useEffect(() => {
    if (!isLive) {
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
      liveTimerRef.current = null;
      return;
    }
    const heat = heatRef.current;
    if (!heat) return;

    let t = 0;
    const id = setInterval(() => {
      t += 0.09;
      const pts = hospitals.map((h, i) => {
        const base = baseIntensitiesRef.current[i] ?? h.intensity ?? 0.2;
        // a gentle +/-5% wave per point, phase-shifted by index
        const wave = 1 + 0.05 * Math.sin(t + i * 0.8);
        const val = Math.max(0, Math.min(1, base * wave));
        return [h.lat, h.lng, val];
      });
      heat.setLatLngs(pts);
    }, 450);

    liveTimerRef.current = id;
    return () => {
      clearInterval(id);
      liveTimerRef.current = null;
    };
  }, [isLive, hospitals]);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold">Outbreak Heatmap</h3>
          {selected && (
            <div className="text-sm text-slate-600">
              Selected:&nbsp;<span className="font-semibold text-slate-800">{selected.name}</span>
              {selected.city ? `, ${selected.city}` : ''}
              {selected.forecast?.level && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                  selected.forecast.level === 'High'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : selected.forecast.level === 'Medium'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  Forecast: {selected.forecast.level}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(v => !v)}
            className={`text-sm px-3 py-1.5 rounded-lg border ${
              isLive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
            title="Toggle live animation"
          >
            {isLive ? '⏸️ Pause Live' : '▶️ Go Live'}
          </button>
        </div>
      </div>
      <div id="mdr-heatmap" className="w-full h-[420px] rounded-xl overflow-hidden" />
    </div>
  );
}
