import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { RiskCardData } from '@/types/dashboard';

// ── Constants ────────────────────────────────────────────────
const RING_RADIUS = 72;
const RING_STROKE_WIDTH = 8;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const ANIMATION_DURATION_MS = 1400;

const RISK_COLORS: Record<string, string> = {
  Low: '#16a34a',
  Medium: '#d97706',
  High: '#dc2626',
  Critical: '#9f1239',
};

const RISK_BG: Record<string, string> = {
  Low: 'rgba(22,163,74,0.12)',
  Medium: 'rgba(217,119,6,0.12)',
  High: 'rgba(220,38,38,0.12)',
  Critical: 'rgba(159,18,57,0.12)',
};

const BREAKDOWN_LABELS = ['Genetic', 'Lifestyle', 'Metabolic'] as const;
const BREAKDOWN_COLORS = ['#6366f1', '#d97706', '#16a34a'];

// ── Cubic ease-out ───────────────────────────────────────────
function cubicEaseOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ── Animated Ring ────────────────────────────────────────────
interface RingProps {
  score: number;
  riskLevel: string;
  shouldAnimate: boolean;
}

const AnimatedRing: React.FC<RingProps> = ({ score, riskLevel, shouldAnimate }) => {
  const pathRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number>(0);
  const color = RISK_COLORS[riskLevel] ?? '#16a34a';

  useEffect(() => {
    if (!shouldAnimate || !pathRef.current) return;

    const el = pathRef.current;
    const targetOffset = RING_CIRCUMFERENCE * (1 - score / 100);
    const startOffset = RING_CIRCUMFERENCE;
    const delta = startOffset - targetOffset;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
      const eased = cubicEaseOut(progress);
      el.style.strokeDashoffset = String(startOffset - delta * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    el.style.strokeDasharray = String(RING_CIRCUMFERENCE);
    el.style.strokeDashoffset = String(RING_CIRCUMFERENCE);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score, shouldAnimate]);

  const size = (RING_RADIUS + RING_STROKE_WIDTH) * 2 + 4;
  const center = size / 2;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ filter: `drop-shadow(0 0 18px ${color}55)` }}
    >
      <svg width={size} height={size} aria-label={`Risk score: ${score} out of 100`}>
        <circle
          cx={center}
          cy={center}
          r={RING_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={RING_STROKE_WIDTH}
        />
        <circle
          ref={pathRef}
          cx={center}
          cy={center}
          r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={RING_STROKE_WIDTH}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            strokeDasharray: RING_CIRCUMFERENCE,
            strokeDashoffset: RING_CIRCUMFERENCE,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          style={{
            fontFamily: 'var(--dg-font-heading)',
            fontSize: '2.25rem',
            fontWeight: 800,
            color: 'var(--dg-text-primary)',
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: 'var(--dg-font-body)',
            fontSize: '0.75rem',
            color: 'var(--dg-text-muted)',
            marginTop: 2,
          }}
        >
          / 100
        </span>
      </div>
    </div>
  );
};

// ── Breakdown bar ────────────────────────────────────────────
interface BreakdownBarProps {
  label: string;
  value: number;
  color: string;
  inView: boolean;
}

const BreakdownBar: React.FC<BreakdownBarProps> = ({ label, value, color, inView }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--dg-text-primary)' }}>
        {value}%
      </span>
    </div>
    <div
      className="relative h-1.5 overflow-hidden rounded-full"
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: inView ? `${value}%` : 0 }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: color }}
      />
    </div>
  </div>
);

// ── Main RiskCard ────────────────────────────────────────────
interface RiskCardProps extends RiskCardData {}

export const RiskCard: React.FC<RiskCardProps> = ({
  score,
  riskLevel,
  trend,
  trendValue,
  lastUpdated,
  breakdown,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const riskColor = RISK_COLORS[riskLevel] ?? '#16a34a';
  const riskBg = RISK_BG[riskLevel] ?? 'rgba(22,163,74,0.12)';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'down' ? '#16a34a' : trend === 'up' ? '#dc2626' : '#64748b';
  const trendLabel = trend === 'down' ? 'Improving' : trend === 'up' ? 'Worsening' : 'Stable';
  const breakdownValues = [breakdown.genetic, breakdown.lifestyle, breakdown.metabolic];

  return (
    <motion.div
      ref={ref}
      className="card-glass relative flex h-full flex-col gap-6 p-6"
      whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Risk level badge */}
      <div
        className="absolute right-5 top-5 rounded-full px-3 py-1"
        style={{ background: riskBg, border: `1px solid ${riskColor}44` }}
      >
        <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', fontWeight: 700, color: riskColor, letterSpacing: '0.06em' }}>
          {riskLevel.toUpperCase()} RISK
        </span>
      </div>

      {/* Header */}
      <div>
        <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)', letterSpacing: '0.08em', fontWeight: 600 }}>
          RISK SCORE
        </p>
        <h2 style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--dg-text-primary)', marginTop: 2 }}>
          Current Assessment
        </h2>
      </div>

      {/* Ring + trend */}
      <div className="flex flex-wrap items-center gap-8">
        <AnimatedRing score={score} riskLevel={riskLevel} shouldAnimate={isInView} />
        <div className="flex flex-col gap-3">
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ background: `${trendColor}15`, border: `1px solid ${trendColor}30`, width: 'fit-content' }}
          >
            <TrendIcon size={14} style={{ color: trendColor }} />
            <span style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.8125rem', fontWeight: 600, color: trendColor }}>
              {trendValue}% {trendLabel}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)' }}>
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="flex flex-col gap-3">
        <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.6875rem', color: 'var(--dg-text-muted)', letterSpacing: '0.08em', fontWeight: 600 }}>
          RISK BREAKDOWN
        </p>
        {BREAKDOWN_LABELS.map((label, i) => (
          <BreakdownBar key={label} label={label} value={breakdownValues[i]} color={BREAKDOWN_COLORS[i]} inView={isInView} />
        ))}
      </div>
    </motion.div>
  );
};

export default RiskCard;
