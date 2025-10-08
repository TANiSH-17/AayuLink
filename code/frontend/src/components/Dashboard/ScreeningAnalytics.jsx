import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Activity, TestTube } from "lucide-react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

// --- Seeded Random for stable mock data ---
function makeSeededRand(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-bold text-slate-800 mb-1">{label}</p>
        {payload.map((pld, i) => (
          <div key={i} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value.toFixed(1)}${pld.unit || ""}`}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- KPI Card ---
const KpiCard = ({ title, value, icon, color }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-all relative z-10"
  >
    <div
      className={`flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-xl ${color.bg}`}
    >
      {React.cloneElement(icon, { className: `h-6 w-6 ${color.text}` })}
    </div>
    <div>
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="text-3xl font-bold text-slate-800 mt-1">{value}</div>
    </div>
  </motion.div>
);

// --- Pathogen List ---
const PathogenList = ({ data, colors }) => (
  <div className="space-y-3 relative z-10">
    {data.map((entry, index) => {
      const total = data.reduce((acc, curr) => acc + curr.value, 0);
      const percentage = (entry.value / total) * 100;
      return (
        <div key={entry.name}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-slate-700">{entry.name}</span>
            <span className="text-slate-500">{percentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              style={{ backgroundColor: colors[index % colors.length] }}
            />
          </div>
        </div>
      );
    })}
  </div>
);

export default function ScreeningAnalytics() {
  const [timeRange, setTimeRange] = useState(30);

  // --- Particles Init ---
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const { dailyData, pathogenData, kpiValues } = useMemo(() => {
    const rand = makeSeededRand(1337);
    const now = new Date();

    const fullDailyData = Array.from({ length: 30 }).map((_, idx) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - idx));
      const label = d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      return {
        day: label,
        screenings: Math.floor(rand() * 120) + 40,
        positivePct: Math.round((0.08 + rand() * 0.22) * 1000) / 10,
      };
    });

    const rawPathogens = { MRSA: 36, CRE: 22, ESBL: 18, VRE: 9, Others: 15 };
    const pathogenData = Object.entries(rawPathogens).map(([name, value]) => ({
      name,
      value,
    }));

    const kpiValues = {
      totalScreenings: fullDailyData
        .slice(-7)
        .reduce((a, b) => a + b.screenings, 0),
      avgPositive: Math.round(
        fullDailyData.reduce((a, b) => a + b.positivePct, 0) /
          fullDailyData.length
      ),
      topPathogen: pathogenData[0].name,
    };

    return { dailyData: fullDailyData, pathogenData, kpiValues };
  }, []);

  const visibleData = dailyData.slice(-timeRange);
  const PATHOGEN_COLORS = ["#14b8a6", "#06b6d4", "#3b82f6", "#22c55e", "#f59e0b"];

  return (
    <div className="relative min-h-screen rounded-3xl p-6 bg-gradient-to-br from-[#f9fbfc] to-[#eef7f9] overflow-hidden">
      {/* --- Glowing Pulsing Particles Background --- */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: false,
          background: { color: "transparent" },
          particles: {
            number: { value: 80, density: { enable: true, area: 900 } },
            color: { value: ["#06b6d4", "#14b8a6", "#3b82f6", "#22c55e", "#0b3c5d"] },
            shape: { type: "circle" },
            opacity: {
              value: 0.8,
              random: true,
              anim: { enable: true, speed: 1, opacity_min: 0.3, sync: false },
            },
            size: {
              value: { min: 3, max: 7 },
              random: true,
              anim: { enable: true, speed: 2, size_min: 2, sync: true },
            },
            move: { enable: true, speed: 1.2, random: true, straight: false, outModes: { default: "out" } },
            links: { enable: true, distance: 130, color: "#06b6d4", opacity: 0.4, width: 1.2 },
          },
          interactivity: {
            events: { onHover: { enable: true, mode: "repulse" }, onClick: { enable: true, mode: "push" }, resize: true },
            modes: { repulse: { distance: 120 }, push: { quantity: 4 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 h-full w-full z-0"
      />

      {/* --- Dashboard content --- */}
      <div className="relative z-10 space-y-8">
        {/* --- Title & Range Filter --- */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-[#0b3c5d]">
            National Screening Analytics
          </h2>
          <div className="flex items-center bg-slate-100 p-1 rounded-lg shadow-inner">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  timeRange === days
                    ? "bg-white text-[#0b3c5d] shadow-sm"
                    : "text-slate-600 hover:bg-white/70"
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* --- KPI Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <KpiCard
            title="Screenings (Last 7 days)"
            value={kpiValues.totalScreenings}
            icon={<Activity />}
            color={{ bg: "bg-cyan-100", text: "text-cyan-600" }}
          />
          <KpiCard
            title="Avg. Positive % (30 days)"
            value={`${kpiValues.avgPositive}%`}
            icon={<TrendingUp />}
            color={{ bg: "bg-emerald-100", text: "text-emerald-600" }}
          />
          <KpiCard
            title="Top Pathogen"
            value={kpiValues.topPathogen}
            icon={<TestTube />}
            color={{ bg: "bg-rose-100", text: "text-rose-600" }}
          />
        </div>

        {/* --- Charts Row --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Screenings per Day */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative z-10"
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Screenings per Day
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visibleData} syncId="analyticsSync">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0fdfa" }} />
                  <Bar
                    dataKey="screenings"
                    name="Screenings"
                    fill="#14b8a6"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* MDR Positive % */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative z-10"
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              MDR Positive %
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visibleData} syncId="analyticsSync">
                  <defs>
                    <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis unit="%" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0fdfa" }} />
                  <Area
                    type="monotone"
                    dataKey="positivePct"
                    name="Positive Rate"
                    stroke="#06b6d4"
                    fill="url(#colorPositive)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* --- Pathogen Distribution --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative z-10"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Pathogen Distribution
          </h3>
          <PathogenList data={pathogenData} colors={PATHOGEN_COLORS} />
        </motion.div>
      </div>
    </div>
  );
}
