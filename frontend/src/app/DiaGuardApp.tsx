import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/HeroSection';
import { Dashboard } from '@/components/Dashboard';
import { HealthInputForm } from '@/app/components/HealthInputForm';
import AuthModal from '@/app/components/AuthModal';
import { explainRisk } from '@/api';
import { getCurrentUser, updatePassword } from '@/services/authService';
import { saveAssessment } from '@/services/assessmentHistoryService';
import { supabase } from '@/lib/supabase';

// ── Types (mirrors HealthInputForm's output) ─────────────────
export interface HealthData {
  age: number;
  gender: string;
  bmi: number;
  fastingGlucose: number;
  systolicBP: number;
  diastolicBP: number;
  physicalActivity: 'low' | 'medium' | 'high';
  sleepHours: number;
  stressLevel: number; // converted to numeric (2/5/8)
}

type View = 'hero' | 'form' | 'dashboard';

export const DiaGuardApp: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('hero');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [riskScore, setRiskScore] = useState(0);
  const [riskStage, setRiskStage] = useState<'Normal' | 'Pre-diabetic' | 'High Risk'>('Normal');
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Passwords reset states
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
    
    // Listen for password recovery events
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetModal(true);
      }
    });

    // Fallback URL hash check
    if (window.location.hash.includes('type=recovery')) {
      setShowResetModal(true);
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    const user = await getCurrentUser();
    setIsAuthenticated(!!user);
  }

  // Handle "Start Assessment" button click
  const handleStartAssessment = async () => {
    const user = await getCurrentUser();
    if (!user) {
      // User not logged in - show login modal
      setShowAuthModal(true);
    } else {
      // User is logged in - proceed to form
      setView('form');
    }
  };

  // After successful login, proceed to form
  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    setIsAuthenticated(true);
    setView('form');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long');
      return;
    }

    setIsResetting(true);
    setResetError('');

    const result = await updatePassword(newPassword);

    if (result.success) {
      setShowResetModal(false);
      setNewPassword('');
      alert('Password updated successfully! You can now continue.');
      checkAuth();
    } else {
      setResetError(result.error?.message || 'Failed to update password');
    }

    setIsResetting(false);
  };

  const handleFormSubmit = async (data: any) => {
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      const result = await explainRisk(data);

      // Normalize score to 0–100
      const rawScore = Number(result?.risk_score ?? result?.data?.risk_score ?? 0);
      const normalizedScore = Number.isFinite(rawScore)
        ? rawScore <= 1 ? rawScore * 100 : rawScore
        : 0;
      const score = Math.max(0, Math.min(100, Math.round(normalizedScore)));

      // Map risk stage
      const apiStage = String(result?.risk_stage ?? '').toLowerCase();
      let stage: 'Normal' | 'Pre-diabetic' | 'High Risk' = 'Normal';
      if (apiStage === 'pre-diabetic') stage = 'Pre-diabetic';
      else if (apiStage === 'high-risk' || apiStage === 'high risk') stage = 'High Risk';

      // Convert stress string → number for dashboard
      const stressValue = data.stressLevel === 'high' ? 8 : data.stressLevel === 'medium' ? 5 : 2;

      // Save to Supabase (user must be logged in to reach this point)
      try {
        const user = await getCurrentUser();
        if (user) {
          await saveAssessment(result);
        }
      } catch (err) {
        console.error('Error saving assessment:', err);
        // Non-blocking — don't fail the whole flow
      }

      setHealthData({ ...data, stressLevel: stressValue });
      setRiskScore(score);
      setRiskStage(stage);
      setView('dashboard');
    } catch (err) {
      setAnalyzeError('Could not connect to the AI backend. Make sure the Django server is running at http://127.0.0.1:8000');
      console.error('explainRisk error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={view !== 'form' ? 'diaguard' : ''} style={{ minHeight: '100vh' }}>
      <AnimatePresence mode="wait">

        {/* ── Hero ──────────────────────────────────────── */}
        {view === 'hero' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <HeroSection
              onStartAssessment={handleStartAssessment}
              onHowItWorks={() => setHowItWorksOpen(true)}
            />
          </motion.div>
        )}

        {/* ── Health Input Form ─────────────────────────── */}
        {view === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Error banner */}
            {analyzeError && (
              <div
                style={{
                  background: 'rgba(220,38,38,0.12)',
                  border: '1px solid rgba(220,38,38,0.4)',
                  borderRadius: 12,
                  padding: '12px 20px',
                  margin: '16px auto',
                  maxWidth: 600,
                  fontFamily: 'var(--dg-font-body)',
                  fontSize: '0.875rem',
                  color: '#f87171',
                  textAlign: 'center',
                }}
              >
                ⚠️ {analyzeError}
              </div>
            )}

            {/* Analyzing overlay — shows while API is in-flight */}
            {isAnalyzing ? (
              <div
                className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
                style={{ background: 'var(--dg-bg-base)' }}
              >
                {/* Spinning ring */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    border: '4px solid rgba(22,163,74,0.2)',
                    borderTopColor: '#16a34a',
                    borderRadius: '50%',
                    animation: 'spin 0.9s linear infinite',
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--dg-text-primary)', marginBottom: 8 }}>
                    Analyzing Your Health Data
                  </p>
                  <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', color: 'var(--dg-text-muted)' }}>
                    Our AI model is processing 47 biomarkers…
                  </p>
                </div>
              </div>
            ) : (
              <HealthInputForm onSubmit={handleFormSubmit} />
            )}
          </motion.div>
        )}

        {/* ── Dashboard ─────────────────────────────────── */}
        {view === 'dashboard' && healthData && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Dashboard
              onClose={() => setView('hero')}
              healthData={healthData}
              riskScore={riskScore}
              riskStage={riskStage}
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Auth Modal ─────────────────────────────────── */}
      <AuthModal
        open={showAuthModal}
        mode="login"
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* ── "How It Works" modal ───────────────────────── */}
      <AnimatePresence>
        {howItWorksOpen && (
          <motion.div
            key="hiw"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={() => setHowItWorksOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="card-glass flex max-w-md flex-col gap-5 p-8"
              style={{ margin: '0 16px' }}
            >
              <h2 style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--dg-text-primary)' }}>
                How DiaGuard AI Works
              </h2>
              <ol className="flex flex-col gap-4">
                {[
                  'Complete a 3-minute health profile covering lifestyle, genetics & metabolic markers.',
                  'Our ML model (XGBoost + neural ensemble) analyses 47 biomarkers against clinical data from 50,000+ assessments.',
                  'Receive your personalised risk score with plain-English explanations and a tailored action plan.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: 'var(--dg-primary)', marginTop: 1 }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', color: 'var(--dg-text-muted)', lineHeight: 1.65 }}>
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              <button
                className="btn-primary mt-1"
                onClick={() => { setHowItWorksOpen(false); handleStartAssessment(); }}
              >
                Try It Now →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reset Password Modal ───────────────────────── */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center"
              style={{ margin: '0 16px' }}
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Set New Password
              </h2>
              <p className="text-gray-600 mb-6">
                Please enter your new password to complete the reset process.
              </p>
              
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder="New Password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 bg-gray-50 bg-white"
                    required
                  />
                </div>
                
                {resetError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-left">
                    {resetError}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex justify-center"
                >
                  {isResetting ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiaGuardApp;
