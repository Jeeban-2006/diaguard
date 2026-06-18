import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Activity, Moon, Heart, Brain, Salad, Zap, Dumbbell, Scale, Info,
  ArrowRight, CheckCircle2, X, Menu, Bell, Utensils, TrendingDown, TrendingUp,
  Download, Share2, Settings as SettingsIcon, User, History as HistoryIcon,
  ChevronRight, BarChart2, Shield, Pill, Calendar, Users, Footprints, ChevronDown, ChevronUp
} from 'lucide-react';
import { RiskCard } from '@/components/RiskCard';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { DigitalTwin } from '@/components/DigitalTwin';
import { MedicalReportPDF } from '@/components/MedicalReportPDF';
import { AIChatbot } from '@/components/AIChatbot';
import { getAssessments } from '@/services/assessmentHistoryService';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { getCurrentUser, getProfile } from '@/services/authService';
import type { HealthData } from '@/app/DiaGuardApp';
import type { RiskCardData } from '@/types/dashboard';

type NavSection = 'Overview' | 'History' | 'Reports' | 'Settings';

// ── Types ─────────────────────────────────────────────────────
interface DashboardProps {
  onClose: () => void;
  healthData: HealthData;
  riskScore: number;
  riskStage: 'Normal' | 'Pre-diabetic' | 'High Risk';
}

// ── Icon map ──────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Activity, Moon, Heart, Brain, Salad, Users, Zap, Dumbbell, Scale, Utensils, Footprints,
};

// ── Risk colour maps ──────────────────────────────────────────
const STAGE_TO_LEVEL: Record<string, 'Low' | 'Medium' | 'High'> = {
  Normal: 'Low',
  'Pre-diabetic': 'Medium',
  'High Risk': 'High',
};

const STAGE_COLOR: Record<string, string> = {
  Normal: '#16a34a',
  'Pre-diabetic': '#d97706',
  'High Risk': '#dc2626',
};

// ── Animation variants ────────────────────────────────────────
const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};
const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ── Sparkline SVG ─────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const W = 56, H = 24;
  const step = W / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${H - ((v - min) / range) * H}`).join(' ');
  return (
    <svg width={W} height={H} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ── Custom Recharts Tooltip ───────────────────────────────────
const ChartTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(8,12,16,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(16px)' }}>
      <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#4ade80' }}>
        {payload[0].value}
        <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)', marginLeft: 4 }}>/ 100</span>
      </p>
    </div>
  );
};

// ── Metric Card ───────────────────────────────────────────────
const MetricCardItem: React.FC<{
  label: string; value: string; unit: string;
  iconName: string; iconColor: string;
  status: string; statusColor: string;
  sparkline: number[];
}> = ({ label, value, unit, iconName, iconColor, status, statusColor, sparkline }) => {
  const Icon = ICON_MAP[iconName] ?? Activity;
  return (
    <motion.div className="card-glass flex flex-col gap-3 p-4" variants={FADE_UP} whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: `${iconColor}18`, border: `1px solid ${iconColor}30` }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        <Sparkline data={sparkline} color={iconColor} />
      </div>
      <div>
        <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)' }}>{label}</p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--dg-text-primary)', lineHeight: 1 }}>{value}</span>
          <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.6875rem', color: 'var(--dg-text-muted)' }}>{unit}</span>
        </div>
      </div>
      <div className="rounded-full px-2 py-0.5 w-fit" style={{ background: `${statusColor}18`, border: `1px solid ${statusColor}30` }}>
        <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.6875rem', fontWeight: 600, color: statusColor }}>{status}</span>
      </div>
    </motion.div>
  );
};

// ── Quick Stat Card ───────────────────────────────────────────
const QuickStatCard: React.FC<{ label: string; value: string; subtext: string; dotColor: string }> = ({ label, value, subtext, dotColor }) => (
  <motion.div className="card-glass flex flex-col gap-2 p-4" variants={FADE_UP} whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}>
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ background: dotColor, display: 'block', flexShrink: 0 }} />
      <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>{label.toUpperCase()}</p>
    </div>
    <p style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--dg-text-primary)' }}>{value}</p>
    <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)' }}>{subtext}</p>
  </motion.div>
);

// ── Risk Factor Card ──────────────────────────────────────────
const RiskFactorCard: React.FC<{
  name: string; iconName: string; impact: 'High' | 'Medium' | 'Low';
  percentage: number; explanation: string; action: string; inView: boolean;
}> = ({ name, iconName, impact, percentage, explanation, action, inView }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = ICON_MAP[iconName] ?? Activity;
  const impactColor = impact === 'High' ? '#dc2626' : impact === 'Medium' ? '#d97706' : '#16a34a';
  return (
    <motion.div className="card-glass relative flex flex-col gap-3 overflow-hidden p-4" variants={FADE_UP} whileHover={{ scale: 1.015, transition: { duration: 0.2 } }} onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} style={{ color: impactColor }} />
          <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--dg-text-primary)' }}>{name}</span>
        </div>
        <span className="rounded-full px-2 py-0.5" style={{ background: `${impactColor}18`, border: `1px solid ${impactColor}40`, fontFamily: 'var(--dg-font-body)', fontSize: '0.6875rem', fontWeight: 700, color: impactColor }}>
          {impact}
        </span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: inView ? `${percentage}%` : 0 }} transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }} className="absolute inset-y-0 left-0 rounded-full" style={{ background: impactColor }} />
      </div>
      <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)', lineHeight: 1.5 }}>{explanation}</p>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }} transition={{ duration: 0.2 }} className="flex items-center gap-1" aria-hidden={!hovered}>
        <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 }}>{action}</span>
        <ArrowRight size={12} style={{ color: '#4ade80' }} />
      </motion.div>
    </motion.div>
  );
};

// ── Recommendation Card ───────────────────────────────────────
const RecommendationCard: React.FC<{
  title: string; description: string; items: string[];
  iconName: string; gradientFrom: string; gradientTo: string;
}> = ({ title, description, items, iconName, gradientFrom, gradientTo }) => {
  const Icon = ICON_MAP[iconName] ?? Activity;
  return (
    <motion.div className="card-glass flex flex-col gap-4 p-5" variants={FADE_UP} whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${gradientFrom}30, ${gradientTo}15)`, border: `1px solid ${gradientFrom}30` }}>
        <Icon size={20} style={{ color: gradientFrom }} />
      </div>
      <div>
        <h3 style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--dg-text-primary)' }}>{title}</h3>
        <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.8125rem', color: 'var(--dg-text-muted)', marginTop: 4, lineHeight: 1.6 }}>{description}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle2 size={14} style={{ color: gradientFrom, flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.8125rem', color: 'var(--dg-text-muted)', lineHeight: 1.5 }}>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

// ── Navbar ────────────────────────────────────────────────────
const NAV_ITEMS: NavSection[] = ['Overview', 'History', 'Reports', 'Settings'];
const Navbar: React.FC<{ onClose: () => void; active: NavSection; onNav: (s: NavSection) => void; onProfile: () => void; onNotif: () => void; profile: any; profileLoading: boolean }> = ({ onClose, active, onNav, onProfile, onNotif, profile, profileLoading }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full" style={{ background: 'rgba(8,12,16,0.88)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--dg-primary)' }}>
            <span style={{ fontFamily: 'var(--dg-font-heading)', fontWeight: 800, fontSize: '0.875rem', color: '#fff' }}>D</span>
          </div>
          <span style={{ fontFamily: 'var(--dg-font-heading)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--dg-text-primary)' }}>DiaGuard AI</span>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((link) => (
            <button key={link} onClick={() => onNav(link)}
              style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', fontWeight: active === link ? 600 : 400, color: active === link ? '#fff' : 'var(--dg-text-muted)', background: active === link ? 'rgba(22,163,74,0.18)' : 'none', border: active === link ? '1px solid rgba(22,163,74,0.3)' : '1px solid transparent', borderRadius: 30, cursor: 'pointer', padding: '5px 14px', transition: 'all 0.2s' }}>{link}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={onNotif} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }} aria-label="Notifications">
            <Bell size={15} style={{ color: 'var(--dg-text-muted)' }} />
          </button>
          <button onClick={onProfile} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #16a34a, #4ade80)', fontFamily: 'var(--dg-font-heading)', fontWeight: 700, fontSize: '0.75rem', color: '#fff', border: 'none', cursor: 'pointer' }}>
             {profileLoading ? <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> : profile?.initials ?? 'U'}
          </button>
          <button onClick={onClose} className="hidden items-center gap-1 rounded-full px-3 py-1.5 md:flex" style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)', fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', fontWeight: 600, color: '#f87171', cursor: 'pointer' }}>
            <X size={13} /> Close
          </button>
          <button className="flex items-center justify-center md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dg-text-primary)' }}>
            <Menu size={20} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="border-t px-4 py-3 md:hidden" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(8,12,16,0.95)' }}>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((link) => (
              <button key={link} onClick={() => { onNav(link); setMenuOpen(false); }}
                style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.9375rem', color: active === link ? '#4ade80' : 'var(--dg-text-primary)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{link}
              </button>
            ))}
            <button onClick={onClose} style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.9375rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '10px 0', marginTop: 4 }}>Close Dashboard</button>
          </nav>
        </div>
      )}
    </header>
  );
};

// ── History Panel ─────────────────────────────────────────────
const HistoryPanel: React.FC<{ riskScore: number; riskStage: string }> = ({ riskScore, riskStage }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        if (u) {
          const { data } = await getAssessments(u.id, 1);
          setRecords(data ?? []);
        }
      } catch { /* not logged in */ }
      setLoading(false);
    })();
  }, []);
  const stageColor: Record<string, string> = { normal: '#16a34a', 'pre-diabetic': '#d97706', 'high-risk': '#dc2626' };
  const today = new Date();
  // Merge real records + current session as first entry
  const allRows = [
    { id: 'current', created_at: today.toISOString(), risk_score: riskScore, risk_stage: riskStage.toLowerCase() },
    ...records.filter(r => r.risk_stage !== riskStage.toLowerCase()),
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <HistoryIcon size={18} style={{ color: 'var(--dg-primary)' }} />
        <h2 style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--dg-text-primary)' }}>Assessment History</h2>
      </div>
      {loading ? (
        <div style={{ color: 'var(--dg-text-muted)', fontFamily: 'var(--dg-font-body)', padding: 32, textAlign: 'center' }}>Loading history…</div>
      ) : allRows.length === 0 ? (
        <div className="card-glass p-8 text-center" style={{ color: 'var(--dg-text-muted)', fontFamily: 'var(--dg-font-body)' }}>No past assessments found. Sign in to save your history.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {allRows.map((r, i) => {
            const color = stageColor[r.risk_stage] ?? '#16a34a';
            const date = new Date(r.created_at);
            return (
              <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="card-glass flex items-center justify-between p-4 cursor-pointer"
                whileHover={{ scale: 1.008, transition: { duration: 0.15 } }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${color}18`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--dg-font-heading)', fontWeight: 700, fontSize: '0.75rem', color }}>{Math.round(r.risk_score)}%</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--dg-font-heading)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--dg-text-primary)', textTransform: 'capitalize' }}>{r.risk_stage.replace('-', ' ')}</p>
                    <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)' }}>{date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full px-3 py-1" style={{ background: `${color}18`, border: `1px solid ${color}30`, fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', fontWeight: 600, color }}>Risk {Math.round(r.risk_score)}</span>
                  <ChevronRight size={16} style={{ color: 'var(--dg-text-muted)' }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

// ── Reports Panel ─────────────────────────────────────────────
const ReportsPanel: React.FC<{ riskScore: number; riskStage: string; healthData: HealthData }> = ({ riskScore, riskStage, healthData }) => {
  const stageColor: Record<string, string> = { Normal: '#16a34a', 'Pre-diabetic': '#d97706', 'High Risk': '#dc2626' };
  const color = stageColor[riskStage] ?? '#16a34a';
  const handleDownload = () => {
    const lines = [
      'DiaGuard AI — Assessment Report',
      '================================',
      `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      `Risk Score: ${Math.round(riskScore)} / 100`,
      `Risk Stage: ${riskStage}`,
      '',
      'Health Metrics',
      '--------------',
      `Age: ${healthData.age}`,
      `Gender: ${healthData.gender}`,
      `BMI: ${healthData.bmi}`,
      `Fasting Glucose: ${healthData.fastingGlucose} mg/dL`,
      `Blood Pressure: ${healthData.systolicBP}/${healthData.diastolicBP} mmHg`,
      `Physical Activity: ${healthData.physicalActivity}`,
      `Sleep Hours: ${healthData.sleepHours} hrs/night`,
      `Stress Level: ${healthData.stressLevel <= 3 ? 'Low' : healthData.stressLevel <= 6 ? 'Medium' : 'High'}`,
      '',
      '* This report is for informational purposes only. Consult a healthcare professional.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `diaguard-report-${Date.now()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };
  const reportCards = [
    { icon: BarChart2, title: 'Full Risk Report', desc: 'Complete assessment with all biomarkers', color: '#6366f1', action: 'Download TXT', onClick: handleDownload },
    { icon: Shield, title: 'Wellness Summary', desc: 'Your key health stats at a glance', color: '#16a34a', action: 'Share Link', onClick: () => navigator.clipboard?.writeText(window.location.href).then(() => alert('Link copied!')) },
    { icon: Calendar, title: 'Monthly Trend', desc: '12-month projected risk trajectory', color: '#f59e0b', action: 'Export CSV', onClick: () => alert('CSV export coming soon') },
    { icon: Pill, title: 'Recommendations PDF', desc: 'Your personalised action plan', color: '#ec4899', action: 'Generate', onClick: () => alert('PDF generation coming soon') },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Download size={18} style={{ color: 'var(--dg-primary)' }} />
        <h2 style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--dg-text-primary)' }}>Reports & Exports</h2>
      </div>
      {/* Summary banner */}
      <div className="card-glass flex items-center gap-4 p-5" style={{ border: `1px solid ${color}30` }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${color}18`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--dg-font-heading)', fontWeight: 800, fontSize: '1rem', color }}>{Math.round(riskScore)}%</span>
        </div>
        <div>
          <p style={{ fontFamily: 'var(--dg-font-heading)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--dg-text-primary)' }}>Latest Assessment — {riskStage}</p>
          <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.8125rem', color: 'var(--dg-text-muted)', marginTop: 2 }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reportCards.map((c) => (
          <motion.div key={c.title} className="card-glass flex flex-col gap-3 p-5" whileHover={{ scale: 1.012, transition: { duration: 0.15 } }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${c.color}18`, border: `1px solid ${c.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <c.icon size={20} style={{ color: c.color }} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--dg-font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--dg-text-primary)' }}>{c.title}</p>
              <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.8125rem', color: 'var(--dg-text-muted)', marginTop: 3 }}>{c.desc}</p>
            </div>
            <button onClick={c.onClick} className="flex items-center gap-2 mt-auto" style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.8125rem', fontWeight: 600, color: c.color, background: `${c.color}12`, border: `1px solid ${c.color}30`, borderRadius: 30, padding: '6px 14px', cursor: 'pointer', width: 'fit-content', transition: 'all 0.2s' }}>
              <Download size={13} /> {c.action}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ── Settings Panel ────────────────────────────────────────────
const SettingsPanel: React.FC = () => {
  const [notif, setNotif] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const Toggle: React.FC<{ on: boolean; onChange: () => void }> = ({ on, onChange }) => (
    <button onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: on ? 'var(--dg-primary)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' }} />
    </button>
  );
  const rows = [
    { label: 'Email Notifications', desc: 'Receive risk alerts and tips via email', val: notif, set: () => setNotif(!notif) },
    { label: 'Assessment Reminders', desc: 'Monthly reminders to re-assess your risk', val: reminders, set: () => setReminders(!reminders) },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <SettingsIcon size={18} style={{ color: 'var(--dg-primary)' }} />
        <h2 style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--dg-text-primary)' }}>Settings</h2>
      </div>
      <div className="card-glass flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--dg-text-muted)', letterSpacing: '0.06em', padding: '12px 16px' }}>NOTIFICATIONS</p>
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between" style={{ padding: '14px 16px' }}>
            <div>
              <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--dg-text-primary)' }}>{r.label}</p>
              <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)', marginTop: 2 }}>{r.desc}</p>
            </div>
            <Toggle on={r.val} onChange={r.set} />
          </div>
        ))}
      </div>
      <div className="card-glass flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--dg-text-muted)', letterSpacing: '0.06em', padding: '12px 16px' }}>UNITS</p>
        <div className="flex items-center justify-between" style={{ padding: '14px 16px' }}>
          <div>
            <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--dg-text-primary)' }}>Measurement Units</p>
            <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)', marginTop: 2 }}>BMI, blood pressure display format</p>
          </div>
          <div className="flex rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.05)', gap: 2 }}>
            {(['metric','imperial'] as const).map(u => (
              <button key={u} onClick={() => setUnits(u)} style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.8125rem', fontWeight: 600, padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: units === u ? 'var(--dg-primary)' : 'transparent', color: units === u ? '#fff' : 'var(--dg-text-muted)', textTransform: 'capitalize', transition: 'all 0.2s' }}>{u}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="card-glass flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--dg-text-muted)', letterSpacing: '0.06em', padding: '12px 16px' }}>DATA & PRIVACY</p>
        {['Delete All Assessments', 'Export My Data', 'Privacy Policy'].map(item => (
          <button key={item} className="flex items-center justify-between" style={{ padding: '14px 16px', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.9rem', fontWeight: 600, color: item === 'Delete All Assessments' ? '#f87171' : 'var(--dg-text-primary)' }}>{item}</span>
            <ChevronRight size={16} style={{ color: 'var(--dg-text-muted)' }} />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ── Slide-in Panel (Notifications / Profile) ──────────────────
const SlidePanel: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 60 }} />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(380px, 100vw)', background: 'rgba(10,14,18,0.97)', borderLeft: '1px solid rgba(255,255,255,0.08)', zIndex: 61, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily: 'var(--dg-font-heading)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--dg-text-primary)' }}>{title}</span>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={15} style={{ color: 'var(--dg-text-muted)' }} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>{children}</div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ── Helpers ───────────────────────────────────────────────────
function genTrend(baseScore: number): { month: string; score: number }[] {
  return Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (11 - i));
    const variation = (Math.random() * 10 - 5) - i * 0.5;
    return {
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      score: Math.max(0, Math.min(100, Math.round(baseScore + variation))),
    };
  });
}

type Period = '3M' | '6M' | '12M';

// ── Main Dashboard ────────────────────────────────────────────
export const Dashboard: React.FC<DashboardProps> = ({ onClose, healthData, riskScore, riskStage }) => {
  const [activeSection, setActiveSection] = useState<NavSection>('Overview');
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const [simulatedData, setSimulatedData] = useState<HealthData | null>(null);
  const [simulatedScore, setSimulatedScore] = useState<number | null>(null);

  const displayData = simulatedData ?? healthData;
  const displayScore = simulatedScore ?? riskScore;
  const displayStage = simulatedScore !== null ? (simulatedScore >= 70 ? 'High Risk' : simulatedScore >= 40 ? 'Pre-diabetic' : 'Normal') : riskStage;

  const [profile, setProfile] = useState<{ name: string; email: string; initials: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        if (u) {
          const p = await getProfile(u.id);
          const name = p?.full_name || 'Anonymous User';
          const email = u.email || '';
          const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
          setProfile({ name, email, initials });
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setProfileLoading(false);
      }
    })();
  }, []);
  const [period, setPeriod] = useState<Period>('12M');
  const factorsRef = useRef<HTMLDivElement>(null);
  const factorsInView = useInView(factorsRef, { once: true, margin: '-80px' });

  // ── Derived data from real healthData ─────────────────────
  const stageColor = displayStage.toLowerCase().includes('high') ? '#dc2626' : displayStage.toLowerCase().includes('pre') ? '#d97706' : '#16a34a';
  const riskLevel = STAGE_TO_LEVEL[displayStage.toLowerCase().replace(' ', '-')] ?? 'Low';

  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('DiaGuard_Report.pdf');
      toast.success('PDF downloaded successfully');
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error('Failed to generate PDF: ' + err?.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Trend history (generated from score)
  const fullTrend = useMemo(() => genTrend(displayScore), [displayScore]);
  const PERIOD_DATA: Record<Period, typeof fullTrend> = {
    '12M': fullTrend,
    '6M': fullTrend.slice(6),
    '3M': fullTrend.slice(9),
  };

  // RiskCard data
  const riskCardData: RiskCardData = {
    score: displayScore,
    riskLevel,
    trend: fullTrend[11].score < fullTrend[0].score ? 'down' : 'up',
    trendValue: Math.abs(fullTrend[11].score - fullTrend[0].score),
    lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    breakdown: {
      genetic: 42, // not available from form, keep illustrative
      lifestyle: displayData.physicalActivity === 'low' ? 65 : displayData.physicalActivity === 'medium' ? 35 : 15,
      metabolic: displayData.fastingGlucose > 100 ? 75 : displayData.fastingGlucose > 80 ? 40 : 20,
    },
  };

  // Health Metrics
  const bmiStatus = displayData.bmi < 18.5 ? { label: 'Underweight', color: '#6366f1' } : displayData.bmi < 25 ? { label: 'Normal', color: '#16a34a' } : displayData.bmi < 30 ? { label: 'Overweight', color: '#d97706' } : { label: 'Obese', color: '#dc2626' };
  const glucoseStatus = displayData.fastingGlucose < 100 ? { label: 'Normal', color: '#16a34a' } : displayData.fastingGlucose < 126 ? { label: 'Elevated', color: '#d97706' } : { label: 'High', color: '#dc2626' };
  const bpStatus = displayData.systolicBP < 120 ? { label: 'Normal', color: '#16a34a' } : displayData.systolicBP < 130 ? { label: 'Elevated', color: '#d97706' } : { label: 'High', color: '#dc2626' };
  const sleepStatus = displayData.sleepHours >= 7 && displayData.sleepHours <= 9 ? { label: 'Normal', color: '#16a34a' } : { label: 'Low', color: '#d97706' };

  const metrics = [
    { label: 'BMI', value: displayData.bmi.toFixed(1), unit: 'kg/m²', iconName: 'Scale', iconColor: '#6366f1', status: bmiStatus.label, statusColor: bmiStatus.color, sparkline: [22, 22.5, 23, displayData.bmi - 0.5, displayData.bmi] },
    { label: 'Sleep Hours', value: displayData.sleepHours.toFixed(1), unit: 'hrs/night', iconName: 'Moon', iconColor: '#8b5cf6', status: sleepStatus.label, statusColor: sleepStatus.color, sparkline: [6, 6.5, displayData.sleepHours - 0.5, displayData.sleepHours] },
    { label: 'Blood Glucose', value: String(displayData.fastingGlucose), unit: 'mg/dL', iconName: 'Activity', iconColor: '#f59e0b', status: glucoseStatus.label, statusColor: glucoseStatus.color, sparkline: [90, 95, displayData.fastingGlucose - 5, displayData.fastingGlucose] },
    { label: 'Blood Pressure', value: `${displayData.systolicBP}/${displayData.diastolicBP}`, unit: 'mmHg', iconName: 'Heart', iconColor: '#ef4444', status: bpStatus.label, statusColor: bpStatus.color, sparkline: [115, 118, displayData.systolicBP - 3, displayData.systolicBP] },
  ];

  // Quick stats
  const nextAssessDate = new Date();
  nextAssessDate.setDate(nextAssessDate.getDate() + 30);
  const quickStats = [
    { label: 'Next Assessment Due', value: nextAssessDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), subtext: 'In 30 days', dotColor: '#6366f1' },
    { label: 'Risk Stage', value: displayStage, subtext: displayStage.toLowerCase().includes('normal') ? 'Within healthy range' : displayStage.toLowerCase().includes('pre') ? 'Early intervention advised' : 'Immediate attention recommended', dotColor: stageColor },
  ];

  // Risk Factors (computed from real health data)
  const riskFactors = [
    displayData.fastingGlucose > 100 && { name: 'Fasting Glucose', iconName: 'Activity', impact: displayData.fastingGlucose > 126 ? 'High' : 'Medium' as 'High' | 'Medium', percentage: Math.min(((displayData.fastingGlucose - 70) / 130) * 100, 100), explanation: 'Elevated fasting glucose is a key predictor of insulin resistance and T2DM.', action: 'Reduce refined carbs & sugar' },
    displayData.bmi > 25 && { name: 'Body Weight (BMI)', iconName: 'Scale', impact: displayData.bmi > 30 ? 'High' : 'Medium' as 'High' | 'Medium', percentage: Math.min(((displayData.bmi - 18) / 22) * 100, 100), explanation: 'Excess adipose tissue increases insulin resistance and metabolic strain.', action: 'Target 5–10% weight reduction' },
    displayData.systolicBP > 130 && { name: 'Blood Pressure', iconName: 'Heart', impact: displayData.systolicBP > 140 ? 'High' : 'Medium' as 'High' | 'Medium', percentage: Math.min(((displayData.systolicBP - 90) / 110) * 100, 100), explanation: 'Hypertension and diabetes frequently co-occur, compounding cardiovascular risk.', action: 'Reduce sodium, increase potassium' },
    displayData.physicalActivity === 'low' && { name: 'Physical Activity', iconName: 'Dumbbell', impact: 'High' as 'High', percentage: 72, explanation: 'Sedentary lifestyle significantly raises insulin resistance.', action: 'Aim for 150 min/week moderate activity' },
    displayData.sleepHours < 7 && { name: 'Sleep Quality', iconName: 'Moon', impact: 'Medium' as 'Medium', percentage: 55, explanation: 'Less than 7 hours of sleep disrupts glucose metabolism and raises cortisol.', action: 'Target 7–9 hours nightly' },
    displayData.stressLevel > 6 && { name: 'Stress Levels', iconName: 'Brain', impact: 'Medium' as 'Medium', percentage: Math.min((displayData.stressLevel / 10) * 100, 100), explanation: 'Chronic stress elevates cortisol, raising blood glucose levels.', action: 'Try meditation or deep-breathing daily' },
    // Always include a positive factor
    { name: 'Physical Activity', iconName: 'Dumbbell', impact: displayData.physicalActivity === 'high' ? 'Low' : displayData.physicalActivity === 'medium' ? 'Low' : 'High' as 'High' | 'Low', percentage: displayData.physicalActivity === 'high' ? 15 : displayData.physicalActivity === 'medium' ? 35 : 72, explanation: displayData.physicalActivity === 'high' ? 'Your exercise level is protective — keep it up!' : displayData.physicalActivity === 'medium' ? 'Moderate activity. Increasing intensity would further reduce risk.' : 'Sedentary lifestyle significantly raises insulin resistance.', action: displayData.physicalActivity === 'high' ? 'Maintain current routine' : 'Add 30 min daily walks' },
  ].filter(Boolean).slice(0, 6) as { name: string; iconName: string; impact: 'High' | 'Medium' | 'Low'; percentage: number; explanation: string; action: string }[];

  // Deduplicate (physicalActivity appears twice intentionally above)
  const seenNames = new Set<string>();
  const uniqueFactors = riskFactors.filter(f => !seenNames.has(f.name) && seenNames.add(f.name));

  // Recommendations based on top issues
  const recommendations: { title: string; description: string; items: string[]; iconName: string; gradientFrom: string; gradientTo: string }[] = [];
  if (displayData.fastingGlucose > 100 || displayData.bmi > 25) {
    recommendations.push({ title: 'Nutrition Plan', description: 'Small dietary shifts can significantly cut your glucose and BMI.', items: ['Replace white rice with quinoa or brown rice', 'Add leafy greens to every main meal', 'Limit added sugars to under 25g per day'], iconName: 'Salad', gradientFrom: '#16a34a', gradientTo: '#4ade80' });
  }
  if (displayData.physicalActivity === 'low' || displayData.physicalActivity === 'medium') {
    recommendations.push({ title: 'Movement Plan', description: '30 minutes of moderate activity 5× per week reduces risk by up to 58%.', items: ['Brisk walk or jog for 30 min each morning', 'Resistance training twice per week', 'Take stairs and walk after meals'], iconName: 'Dumbbell', gradientFrom: '#f59e0b', gradientTo: '#fde68a' });
  }
  if (displayData.sleepHours < 7 || displayData.stressLevel > 5) {
    recommendations.push({ title: 'Sleep & Stress', description: 'Quality sleep resets your insulin response and lowers cortisol overnight.', items: [`Target ${displayData.sleepHours < 7 ? '7–9 hours' : 'consistent'} of uninterrupted sleep`, 'No screens 30 minutes before bed', 'Practice 10 min of deep breathing daily'], iconName: 'Moon', gradientFrom: '#8b5cf6', gradientTo: '#c4b5fd' });
  }
  // Fallback if all metrics are healthy
  if (recommendations.length === 0) {
    recommendations.push(
      { title: 'Maintain Healthy Diet', description: 'You are in the healthy range. Keep up your excellent habits.', items: ['Continue eating whole foods', 'Stay hydrated with 8+ glasses of water daily', 'Keep annual fasting glucose checks'], iconName: 'Salad', gradientFrom: '#16a34a', gradientTo: '#4ade80' },
      { title: 'Stay Active', description: 'Your activity level is already protecting you.', items: ['Keep up your current exercise routine', 'Add flexibility training weekly', 'Monitor heart rate during workouts'], iconName: 'Dumbbell', gradientFrom: '#6366f1', gradientTo: '#a5b4fc' },
    );
  }

  // Notifications data
  const notifications = [
    { id: 1, icon: '🩸', title: 'Glucose Check Due', desc: 'Your 30-day fasting glucose check is tomorrow.', time: '2h ago', unread: true },
    { id: 2, icon: '🏃', title: 'Activity Goal', desc: 'You reached your weekly exercise target!', time: '1d ago', unread: true },
    { id: 3, icon: '📊', title: 'Risk Updated', desc: `Your latest risk score is ${Math.round(displayScore)}% — ${displayStage}.`, time: 'Just now', unread: false },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="min-h-screen w-full" style={{ background: 'var(--dg-bg-base)', fontFamily: 'var(--dg-font-body)' }}>
      <Navbar onClose={onClose} active={activeSection} onNav={setActiveSection} onProfile={() => setShowProfile(true)} onNotif={() => setShowNotif(true)} profile={profile} profileLoading={profileLoading} />

      {/* ── Notification slide panel ─────────────── */}
      <SlidePanel open={showNotif} onClose={() => setShowNotif(false)} title="Notifications">
        <div className="flex flex-col gap-3">
          {notifications.map(n => (
            <div key={n.id} className="flex items-start gap-3 rounded-xl p-3" style={{ background: n.unread ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${n.unread ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{n.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--dg-font-body)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--dg-text-primary)' }}>{n.title}</p>
                <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)', marginTop: 2 }}>{n.desc}</p>
              </div>
              <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.6875rem', color: 'var(--dg-text-muted)', flexShrink: 0 }}>{n.time}</span>
            </div>
          ))}
        </div>
      </SlidePanel>

      {/* ── Profile slide panel ──────────────────── */}
      <SlidePanel open={showProfile} onClose={() => setShowProfile(false)} title="Profile">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3 py-4">
            {profileLoading ? (
               <div className="flex flex-col items-center gap-3">
                 <div className="animate-pulse w-16 h-16 rounded-full bg-white/10"></div>
                 <div className="animate-pulse h-5 w-24 bg-white/10 rounded mt-1"></div>
                 <div className="animate-pulse h-4 w-32 bg-white/10 rounded mt-1"></div>
               </div>
            ) : (
               <>
                 <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--dg-font-heading)', fontWeight: 800, fontSize: '1.5rem', color: '#fff' }}>{profile?.initials ?? 'U'}</div>
                 <div style={{ textAlign: 'center' }}>
                   <p style={{ fontFamily: 'var(--dg-font-heading)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--dg-text-primary)' }}>{profile?.name ?? 'Anonymous User'}</p>
                   <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.8125rem', color: 'var(--dg-text-muted)', marginTop: 2 }}>{profile?.email}</p>
                 </div>
               </>
            )}
          </div>
          {[['Age', `${healthData.age} years`], ['Gender', healthData.gender], ['BMI', `${healthData.bmi}`], ['Risk Stage', riskStage]].map(([k,v]) => (
            <div key={k} className="flex justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
              <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', color: 'var(--dg-text-muted)' }}>{k}</span>
              <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--dg-text-primary)', textTransform: 'capitalize' }}>{v}</span>
            </div>
          ))}
        </div>
      </SlidePanel>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">

        {/* ── Non-Overview sections ─────────────────── */}
        {activeSection === 'History' && <HistoryPanel key="history" riskScore={riskScore} riskStage={riskStage} />}
        {activeSection === 'Reports' && <ReportsPanel key="reports" riskScore={riskScore} riskStage={riskStage} healthData={healthData} />}
        {activeSection === 'Settings' && <SettingsPanel key="settings" />}

        {activeSection === 'Overview' && (
        <motion.div key="overview" variants={STAGGER} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="flex flex-col gap-8">
          
          <div className="flex justify-end">
            <button 
              onClick={handleExportPDF} 
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-sm font-semibold"
            >
              {isExporting ? <span className="animate-spin w-4 h-4 border-2 border-white/50 border-t-white rounded-full"></span> : <Download size={16} />}
              {isExporting ? 'Generating...' : 'Export PDF Report'}
            </button>
          </div>

          {/* ── A: Top Row ───────────────────────────────── */}
          <section>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <motion.div variants={FADE_UP} className="lg:col-span-2">
                <RiskCard {...riskCardData} />
              </motion.div>
              <div className="flex flex-col gap-4">
                {quickStats.map((s) => <QuickStatCard key={s.label} {...s} />)}
              </div>
            </div>
          </section>

          {/* ── A2: Metabolic Digital Twin ─────────────────── */}
          <section>
            <DigitalTwin complications={{
               kidney_risk: displayScore / 100 * 0.8, // Fallback mock mapping, ideally fetched from API history if available
               eye_risk: displayScore / 100 * 0.5,
               nerve_risk: displayScore / 100 * 0.6,
               cardiovascular_risk: displayScore / 100 * 0.9,
            }} />
          </section>

          {/* ── B: Health Metrics ────────────────────────── */}
          <section>
            <h2 style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--dg-text-primary)', marginBottom: 16 }}>Health Metrics</h2>
            <motion.div variants={STAGGER} className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {metrics.map((m) => <MetricCardItem key={m.label} {...m} />)}
            </motion.div>
          </section>

          {/* ── C: Risk Trend Chart ──────────────────────── */}
          <section className="card-glass p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--dg-text-primary)' }}>12-Month Risk Trend</h2>
                <div className="mt-1 flex items-center gap-2">
                  {fullTrend[11].score < fullTrend[0].score
                    ? <><TrendingDown size={15} style={{ color: '#16a34a' }} /><span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: '#16a34a' }}>Improving trend</span></>
                    : <><TrendingUp size={15} style={{ color: '#dc2626' }} /><span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: '#dc2626' }}>Attention needed</span></>
                  }
                </div>
              </div>
              <div className="flex rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {(['3M', '6M', '12M'] as Period[]).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)} style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.8125rem', fontWeight: 600, padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: period === p ? stageColor : 'transparent', color: period === p ? '#fff' : 'var(--dg-text-muted)' }} aria-pressed={period === p}>{p}</button>
                ))}
              </div>
            </div>
            <div style={{ height: 'clamp(200px, 25vw, 280px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PERIOD_DATA[period]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={stageColor} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={stageColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontFamily: 'var(--dg-font-body)', fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontFamily: 'var(--dg-font-body)', fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="score" stroke={stageColor} strokeWidth={2.5} fill="url(#riskGradient)" dot={false} isAnimationActive animationDuration={900} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

              {/* What-If Simulator Collapsible */}
              <div className="mt-8 mb-4">
                <button 
                  onClick={() => setShowSimulator(!showSimulator)}
                  className="w-full card-glass p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#16a34a]/20 flex items-center justify-center text-[#4ade80]">
                      <Activity size={20} />
                    </div>
                    <div className="text-left">
                      <h3 style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--dg-text-primary)' }}>What-If Simulator</h3>
                      <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.8125rem', color: 'var(--dg-text-muted)' }}>Predict how lifestyle changes impact your score</p>
                    </div>
                  </div>
                  <div className="text-[#4ade80]">
                    {showSimulator ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {showSimulator && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <WhatIfSimulator 
                        baseData={healthData} 
                        baseScore={riskScore} 
                        onSimulate={(data, score) => {
                          setSimulatedData(data);
                          setSimulatedScore(score);
                        }}
                        onReset={() => {
                          setSimulatedData(null);
                          setSimulatedScore(null);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

          {/* ── D: Risk Factors ──────────────────────────── */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <h2 style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--dg-text-primary)' }}>Top Risk Factors</h2>
              <Info size={15} style={{ color: 'var(--dg-text-muted)' }} />
            </div>
            <motion.div ref={factorsRef} variants={STAGGER} initial="hidden" animate={factorsInView ? 'visible' : 'hidden'} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {uniqueFactors.map((f) => (
                <RiskFactorCard key={f.name} {...f} inView={factorsInView} />
              ))}
            </motion.div>
          </section>

          {/* ── E: Recommendations ───────────────────────── */}
          <section>
            <h2 style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--dg-text-primary)', marginBottom: 16 }}>Personalised Recommendations</h2>
            <motion.div variants={STAGGER} className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {recommendations.map((r) => <RecommendationCard key={r.title} {...r} />)}
            </motion.div>
          </section>

          {/* ── Disclaimer ───────────────────────────────── */}
          <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)', textAlign: 'center', paddingBottom: 16, lineHeight: 1.6 }}>
            This assessment is for informational purposes only and does not constitute medical advice. Please consult a healthcare professional for proper diagnosis and treatment.
          </p>

        </motion.div>
        )}
        </AnimatePresence>
      </main>
      
      {/* Hidden PDF Template */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <MedicalReportPDF 
          ref={pdfRef} 
          healthData={healthData} 
          riskScore={riskScore} 
          riskStage={riskStage} 
          profile={profile}
          date={new Date().toLocaleDateString()}
        />
      </div>

      {/* Floating AI Chatbot */}
      <AIChatbot healthData={displayData} riskScore={displayScore} />

    </motion.div>
  );
};

export default Dashboard;
