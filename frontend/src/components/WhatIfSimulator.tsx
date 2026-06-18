import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Activity, RefreshCcw, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { explainRisk } from '@/api';
import type { HealthData } from '@/app/DiaGuardApp';

interface WhatIfSimulatorProps {
  baseData: HealthData;
  baseScore: number;
  onSimulate?: (data: HealthData, score: number) => void;
  onReset?: () => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ baseData, baseScore, onSimulate, onReset }) => {
  const [simulatedData, setSimulatedData] = useState<HealthData>(baseData);
  const [simulatedScore, setSimulatedScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger recalculation on simulatedData change (debounced)
  useEffect(() => {
    // Only recalculate if it's different from base
    const isDifferent = Object.keys(baseData).some(k => 
      (baseData as any)[k] !== (simulatedData as any)[k]
    );

    if (!isDifferent) {
      setSimulatedScore(baseScore);
      setError(null);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    
    setLoading(true);
    setError(null);
    timerRef.current = setTimeout(async () => {
      try {
        const result = await explainRisk(simulatedData);
        // Normalize score to 0–100 exactly like DiaGuardApp does
        const rawScore = Number(result?.risk_score ?? result?.data?.risk_score ?? 0);
        const normalizedScore = Number.isFinite(rawScore)
          ? rawScore <= 1 ? rawScore * 100 : rawScore
          : 0;
        const score = Math.max(0, Math.min(100, Math.round(normalizedScore)));
        
        setSimulatedScore(score);
        if (onSimulate) onSimulate(simulatedData, score);
      } catch (err) {
        setError('Failed to calculate simulated score. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [simulatedData, baseData, baseScore]);

  const handleChange = (field: keyof HealthData, value: number | string) => {
    setSimulatedData(prev => ({ ...prev, [field]: value }));
  };

  const reset = () => {
    setSimulatedData(baseData);
    setSimulatedScore(baseScore);
    if (onReset) onReset();
  };

  const currentScore = simulatedScore !== null ? simulatedScore : baseScore;
  const delta = currentScore - baseScore;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6 mt-8 mb-8 relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center text-white">
              <Activity size={16} />
            </div>
            <h3 style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--dg-text-primary)' }}>
              "What-If" Predictive Simulator
            </h3>
          </div>
          <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', color: 'var(--dg-text-muted)' }}>
            Tweak your lifestyle inputs below to see how they impact your metabolic risk.
          </p>
        </div>
        
        <button 
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', color: 'var(--dg-text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <RefreshCcw size={14} />
          Reset to My Values
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Slider: BMI */}
          <div>
             <div className="flex justify-between mb-2">
                <label style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', color: 'var(--dg-text-primary)', fontWeight: 600 }}>BMI</label>
                <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', color: 'var(--dg-primary)', fontWeight: 700 }}>{simulatedData.bmi}</span>
             </div>
             <input 
               type="range" 
               min="15" max="45" step="0.1" 
               value={simulatedData.bmi} 
               onChange={(e) => handleChange('bmi', parseFloat(e.target.value))}
               className="w-full accent-[#16a34a] h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
             />
             <div className="flex justify-between mt-1 text-xs text-gray-500">
               <span>15 (Underweight)</span>
               <span>45 (High Risk)</span>
             </div>
          </div>

          {/* Slider: Sleep Hours */}
          <div>
             <div className="flex justify-between mb-2">
                <label style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', color: 'var(--dg-text-primary)', fontWeight: 600 }}>Sleep Hours</label>
                <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', color: 'var(--dg-primary)', fontWeight: 700 }}>{simulatedData.sleepHours} hrs</span>
             </div>
             <input 
               type="range" 
               min="3" max="12" step="0.5" 
               value={simulatedData.sleepHours} 
               onChange={(e) => handleChange('sleepHours', parseFloat(e.target.value))}
               className="w-full accent-[#16a34a] h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
             />
          </div>

          {/* Activity Level */}
          <div>
             <label style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', color: 'var(--dg-text-primary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Physical Activity</label>
             <div className="flex gap-2">
                {['low', 'medium', 'high'].map(level => (
                  <button 
                    key={level}
                    onClick={() => handleChange('physicalActivity', level)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors"
                    style={{ 
                      background: simulatedData.physicalActivity === level ? 'var(--dg-primary)' : 'rgba(255,255,255,0.05)',
                      color: simulatedData.physicalActivity === level ? '#fff' : 'var(--dg-text-muted)',
                      border: simulatedData.physicalActivity === level ? '1px solid var(--dg-primary)' : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {level}
                  </button>
                ))}
             </div>
          </div>
          
          {/* Stress Level */}
          <div>
             <label style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', color: 'var(--dg-text-primary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Stress Level</label>
             <div className="flex gap-2">
                {['low', 'medium', 'high'].map(level => {
                  // In healthData, stressLevel might be numeric or string depending on form output mapping. Let's assume it maps back to 'low'|'medium'|'high' or we can map numeric.
                  // For DiaGuard, healthData.stressLevel gets converted to numeric 2/5/8 before saving, wait, let's use numeric mapping if needed.
                  // Wait, DiaGuardApp maps stress string to number: 2 (low), 5 (medium), 8 (high) when setting setHealthData.
                  // So we must handle numeric stress levels.
                  const val = level === 'high' ? 8 : level === 'medium' ? 5 : 2;
                  return (
                    <button 
                      key={level}
                      onClick={() => handleChange('stressLevel', val)}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors"
                      style={{ 
                        background: simulatedData.stressLevel === val ? 'var(--dg-primary)' : 'rgba(255,255,255,0.05)',
                        color: simulatedData.stressLevel === val ? '#fff' : 'var(--dg-text-muted)',
                        border: simulatedData.stressLevel === val ? '1px solid var(--dg-primary)' : '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {level}
                    </button>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center relative">
           {loading && (
             <div className="absolute inset-0 bg-[#080c10]/50 backdrop-blur-sm rounded-2xl z-10 flex flex-col items-center justify-center">
               <div className="animate-spin w-8 h-8 border-4 border-[#16a34a] border-t-transparent rounded-full mb-4"></div>
               <p className="text-[#16a34a] font-semibold text-sm animate-pulse">Running Simulation...</p>
             </div>
           )}
           
           <p className="text-gray-400 font-semibold mb-2 text-sm uppercase tracking-wider">Simulated Score</p>
           
           <div className="flex items-baseline gap-1 relative mb-6">
              <motion.span 
                key={currentScore}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-6xl font-bold font-heading text-white"
              >
                {currentScore}
              </motion.span>
              <span className="text-gray-400 font-semibold">%</span>
           </div>

           {delta !== 0 && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${
                 delta < 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
               }`}
             >
                {delta < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                <span>{Math.abs(delta)}% {delta < 0 ? 'Improvement' : 'Increase'}</span>
             </motion.div>
           )}
           {delta === 0 && (
             <div className="px-4 py-2 rounded-full font-semibold text-sm bg-gray-500/20 text-gray-400">
                No change
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
};
