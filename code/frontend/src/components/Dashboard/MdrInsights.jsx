import React, { useMemo, useState, useEffect } from 'react';
import OutbreakHeatmap from './OutbreakHeatmap';
import WardOccupancy from './WardOccupancy';
import LiveStatsBar from './LiveStatsBar';

// Big list of hospitals across India (lat, lng, intensity 0..1)
const BASE_HOSPITALS = [
  // Delhi–NCR
  { id: 'dl-aiims',   name: 'AIIMS Delhi',              city: 'New Delhi',    lat: 28.5672, lng: 77.2100, intensity: 0.95 },
  { id: 'dl-safdar',  name: 'Safdarjung Hospital',      city: 'New Delhi',    lat: 28.5677, lng: 77.2107, intensity: 0.72 },
  { id: 'dl-lnh',     name: 'Lok Nayak Hospital',       city: 'New Delhi',    lat: 28.6415, lng: 77.2387, intensity: 0.58 },
  { id: 'dl-gtb',     name: 'GTB Hospital',             city: 'Delhi',        lat: 28.6869, lng: 77.3166, intensity: 0.65 },
  { id: 'dl-rml',     name: 'RML Hospital',             city: 'New Delhi',    lat: 28.6267, lng: 77.2055, intensity: 0.38 },
  { id: 'dl-maxsak',  name: 'Max Saket',                city: 'New Delhi',    lat: 28.5285, lng: 77.2194, intensity: 0.32 },
  { id: 'dl-fvk',     name: 'Fortis Vasant Kunj',       city: 'New Delhi',    lat: 28.5278, lng: 77.1502, intensity: 0.28 },
  { id: 'dl-gangaram',name: 'Sir Ganga Ram Hospital',   city: 'New Delhi',    lat: 28.6430, lng: 77.1896, intensity: 0.36 },
  { id: 'dl-apollo',  name: 'Indraprastha Apollo',      city: 'Delhi',        lat: 28.5410, lng: 77.2890, intensity: 0.44 },
  { id: 'dl-venus',   name: 'BLK-Max Rajendra Place',   city: 'Delhi',        lat: 28.6433, lng: 77.1750, intensity: 0.41 },
  { id: 'dl-dwarka1', name: 'Venkateshwar Dwarka',      city: 'Dwarka',       lat: 28.5924, lng: 77.0605, intensity: 0.22 },
  { id: 'dl-dwarka2', name: 'Kalra Hospital Dwarka',    city: 'Dwarka',       lat: 28.5927, lng: 77.0346, intensity: 0.27 },
  { id: 'gg-medanta', name: 'Medanta',                  city: 'Gurugram',     lat: 28.4326, lng: 77.0405, intensity: 0.55 },
  { id: 'gg-artemis', name: 'Artemis',                  city: 'Gurugram',     lat: 28.4142, lng: 77.0797, intensity: 0.33 },
  { id: 'gg-fortis',  name: 'Fortis',                   city: 'Gurugram',     lat: 28.4500, lng: 77.0720, intensity: 0.29 },
  { id: 'no-fortis',  name: 'Fortis Noida',             city: 'Noida',        lat: 28.5667, lng: 77.3242, intensity: 0.35 },
  { id: 'no-max',     name: 'Max Noida',                city: 'Noida',        lat: 28.5901, lng: 77.3295, intensity: 0.24 },
  { id: 'gh-max',     name: 'Max Vaishali',             city: 'Ghaziabad',    lat: 28.6624, lng: 77.3576, intensity: 0.42 },
  { id: 'gh-yashoda', name: 'Yashoda Kaushambi',        city: 'Ghaziabad',    lat: 28.6446, lng: 77.3297, intensity: 0.37 },
  { id: 'fb-qrg',     name: 'QRG',                      city: 'Faridabad',    lat: 28.3927, lng: 77.3153, intensity: 0.26 },
  { id: 'fb-asian',   name: 'Asian Institute',          city: 'Faridabad',    lat: 28.3975, lng: 77.2980, intensity: 0.21 },

  // Mumbai
  { id: 'mb-kem',     name: 'KEM Hospital',             city: 'Mumbai',       lat: 18.9726, lng: 72.8296, intensity: 0.60 },
  { id: 'mb-jaslok',  name: 'Jaslok Hospital',          city: 'Mumbai',       lat: 18.9721, lng: 72.8097, intensity: 0.47 },
  { id: 'mb-tmh',     name: 'Tata Memorial',            city: 'Mumbai',       lat: 19.0236, lng: 72.8424, intensity: 0.52 },
  { id: 'mb-hnh',     name: 'HN Reliance',              city: 'Mumbai',       lat: 18.9389, lng: 72.8278, intensity: 0.33 },

  // Bengaluru
  { id: 'bl-nh',      name: 'Narayana Health',          city: 'Bengaluru',    lat: 12.8612, lng: 77.6762, intensity: 0.50 },
  { id: 'bl-mh',      name: 'Manipal Hospital',         city: 'Bengaluru',    lat: 12.9568, lng: 77.6488, intensity: 0.36 },
  { id: 'bl-fortis',  name: 'Fortis BG Road',           city: 'Bengaluru',    lat: 12.9010, lng: 77.6010, intensity: 0.31 },

  // Hyderabad
  { id: 'hy-apollo',  name: 'Apollo Jubilee Hills',     city: 'Hyderabad',    lat: 17.4300, lng: 78.4073, intensity: 0.46 },
  { id: 'hy-care',    name: 'Care Hospitals',           city: 'Hyderabad',    lat: 17.4180, lng: 78.4480, intensity: 0.29 },

  // Chennai
  { id: 'ch-apollo',  name: 'Apollo Greams Road',       city: 'Chennai',      lat: 13.0615, lng: 80.2649, intensity: 0.48 },
  { id: 'ch-srmc',    name: 'SRMC Porur',               city: 'Chennai',      lat: 13.0411, lng: 80.1680, intensity: 0.30 },

  // Kolkata
  { id: 'ko-sks',     name: 'SSKM Hospital',            city: 'Kolkata',      lat: 22.5362, lng: 88.3435, intensity: 0.43 },
  { id: 'ko-fortis',  name: 'Fortis Anandapur',         city: 'Kolkata',      lat: 22.5141, lng: 88.4190, intensity: 0.32 },

  // Pune
  { id: 'pn-jehangir',name: 'Jehangir Hospital',        city: 'Pune',         lat: 18.5308, lng: 73.8747, intensity: 0.34 },
  { id: 'pn-ruby',    name: 'Ruby Hall Clinic',         city: 'Pune',         lat: 18.5375, lng: 73.8850, intensity: 0.41 },

  // Ahmedabad
  { id: 'ah-cims',    name: 'CIMS',                     city: 'Ahmedabad',    lat: 23.0465, lng: 72.5300, intensity: 0.33 },
  { id: 'ah-sv',      name: 'Sterling Hospital',        city: 'Ahmedabad',    lat: 23.0400, lng: 72.5260, intensity: 0.25 },

  // Jaipur
  { id: 'jp-sms',     name: 'SMS Hospital',             city: 'Jaipur',       lat: 26.9098, lng: 75.8095, intensity: 0.39 },

  // Lucknow
  { id: 'lk-sgpgi',   name: 'SGPGI',                    city: 'Lucknow',      lat: 26.7510, lng: 80.9462, intensity: 0.37 },

  // Kochi
  { id: 'kc-amrita',  name: 'Amrita Hospital',          city: 'Kochi',        lat: 10.0283, lng: 76.3082, intensity: 0.28 },
];

// Simple forecast engine: transforms current intensity (0..1) into a 7-day risk score
function forecastFromIntensity(intensity) {
  // non-linear lift: make high intensities much more likely to stay high
  const base = Math.pow(intensity, 1.15);
  // small deterministic “variance” by bucketing base
  const bump = (Math.round(base * 100) % 7) * 0.01; // 0..0.06
  const score = Math.min(1, base + bump);
  let level = 'Low';
  if (score >= 0.7) level = 'High';
  else if (score >= 0.45) level = 'Medium';
  return { score, level };
}

export default function MdrInsights() {
  const hospitals = useMemo(
    () =>
      BASE_HOSPITALS.map(h => {
        const forecast = forecastFromIntensity(h.intensity);
        return { ...h, forecast };
      }),
    []
  );

  const [selected, setSelected] = useState(null);

  // default: highest intensity
  useEffect(() => {
    if (!selected) {
      const top = [...hospitals].sort((a, b) => b.intensity - a.intensity)[0];
      setSelected(top);
    }
  }, [selected, hospitals]);

  const handleSelectHospital = (h) => setSelected(h);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">MDR Insights</h2>

      {/* Live KPIs */}
      <LiveStatsBar hospitals={hospitals} />

      {/* Animated heatmap with forecasting halos */}
      <OutbreakHeatmap
        hospitals={hospitals}
        selected={selected}
        onSelectHospital={handleSelectHospital}
        live // turn on live “breathing” animation
      />

      {/* Per-hospital wards */}
      <WardOccupancy selectedHospital={selected} />
    </div>
  );
}
