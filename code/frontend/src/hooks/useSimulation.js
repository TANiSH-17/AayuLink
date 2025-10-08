import { useState, useEffect, useRef } from 'react';

const WARDS = Array.from({ length: 36 }).map((_, i) => {
  const letter = String.fromCharCode(65 + Math.floor(i / 6));
  const num = (i % 6) + 1;
  return { id: `${letter}${num}`, level: 'safe', occupancy: 4 + Math.floor(Math.random() * 5), patients: [] };
});

const PATHOGENS = ['MRSA', 'CRE', 'ESBL'];

export const useSimulation = (initialIsRunning = false) => {
  const [wards, setWards] = useState(WARDS);
  const [log, setLog] = useState([]);
  const [isRunning, setIsRunning] = useState(initialIsRunning);
  const intervalRef = useRef(null);

  const addLog = (message, level = 'info') => {
    setLog(prev => [{ message, level, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 50)]);
  };

  const runTick = () => {
    setWards(prevWards => {
      let newWards = [...prevWards.map(w => ({...w}))]; // Deep copy
      const eventType = Math.random();

      // EVENT: New Patient Admission
      if (eventType < 0.3) {
        const targetWardIndex = Math.floor(Math.random() * newWards.length);
        if (newWards[targetWardIndex].occupancy < 12) {
          newWards[targetWardIndex].occupancy++;
          addLog(`New patient admitted to Ward ${newWards[targetWardIndex].id}.`);
        }
      } 
      // EVENT: Patient Tests Positive
      else if (eventType < 0.5) {
        const atRiskWards = newWards.filter(w => w.level !== 'risk' && w.occupancy > 0);
        if (atRiskWards.length > 0) {
          const targetWardIndex = newWards.indexOf(atRiskWards[Math.floor(Math.random() * atRiskWards.length)]);
          newWards[targetWardIndex].level = 'risk';
          const pathogen = PATHOGENS[Math.floor(Math.random() * PATHOGENS.length)];
          addLog(`ALERT: Patient in Ward ${newWards[targetWardIndex].id} tested positive for ${pathogen}.`, 'critical');
        }
      }
      // EVENT: Patient Movement
      else if (eventType < 0.8) {
         const sourceWardIndex = Math.floor(Math.random() * newWards.length);
         const destWardIndex = Math.floor(Math.random() * newWards.length);
         if (sourceWardIndex !== destWardIndex && newWards[sourceWardIndex].occupancy > 0 && newWards[destWardIndex].occupancy < 12) {
            newWards[sourceWardIndex].occupancy--;
            newWards[destWardIndex].occupancy++;
            // If the moving patient was from a risk ward, the destination is now at risk
            if (newWards[sourceWardIndex].level === 'risk') {
              newWards[destWardIndex].level = 'observe';
              addLog(`High-risk patient moved from Ward ${newWards[sourceWardIndex].id} to ${newWards[destWardIndex].id}.`, 'warning');
            }
         }
      }
      // EVENT: Ward Cleared / Patient Recovers
      else {
        const riskWards = newWards.filter(w => w.level === 'risk');
        if (riskWards.length > 0) {
          const targetWardIndex = newWards.indexOf(riskWards[Math.floor(Math.random() * riskWards.length)]);
          newWards[targetWardIndex].level = 'safe';
          addLog(`Containment successful. Ward ${newWards[targetWardIndex].id} is now safe.`, 'info');
        }
      }
      
      return newWards;
    });
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(runTick, 2000); // Run a simulation tick every 2 seconds
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const reset = () => {
    setWards(WARDS);
    setLog([]);
    addLog('Simulation reset to initial state.');
  };

  return { wards, log, isRunning, setIsRunning, reset };
};