import React, { useEffect, useMemo, useState } from 'react';

// tiny count-up without extra deps
function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.round(target * (0.2 + 0.8 * p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export default function LiveStatsBar({ hospitals = [] }) {
  const stats = useMemo(() => {
    const total = hospitals.length;
    const hotspots = hospitals.filter(h => (h.intensity ?? h.baseIntensity ?? 0) >= 0.6).length;
    const forecastHigh = hospitals.filter(h => h.forecast?.level === 'High').length;
    // synthetic: “screenings today” looks lively but is deterministic
    const screeningsToday = total * 9 + hotspots * 7 + forecastHigh * 5;
    return { total, hotspots, forecastHigh, screeningsToday };
  }, [hospitals]);

  const cTotal = useCountUp(stats.total);
  const cHot = useCountUp(stats.hotspots);
  const cHigh = useCountUp(stats.forecastHigh);
  const cScr = useCountUp(stats.screeningsToday);

  const Card = ({ label, value, accent }) => (
    <div className="rounded-2xl border bg-white shadow-sm px-5 py-4 flex items-center justify-between">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card label="Active Hospitals" value={cTotal} accent="text-slate-800" />
      <Card label="Current Hotspots" value={cHot} accent="text-amber-600" />
      <Card label="Forecast: High Risk" value={cHigh} accent="text-red-600" />
      <Card label="Screenings Today" value={cScr} accent="text-emerald-600" />
    </div>
  );
}
