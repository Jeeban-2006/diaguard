// ============================================================
// DiaGuard AI — TypeScript Interfaces for Dashboard
// ============================================================

export interface RiskCardData {
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  lastUpdated: string;
  breakdown: {
    genetic: number;
    lifestyle: number;
    metabolic: number;
  };
}

export interface MetricCard {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  status: 'Normal' | 'Low' | 'High' | 'Elevated';
  iconName: string;
  iconColor: string;
  sparkline: number[];
}

export interface RiskHistoryPoint {
  month: string;
  score: number;
}

export interface RiskFactor {
  id: string;
  name: string;
  iconName: string;
  impact: 'High' | 'Medium' | 'Low';
  percentage: number;
  explanation: string;
  action: string;
  color: string;
}

export interface Recommendation {
  id: string;
  category: 'Diet' | 'Exercise' | 'Sleep';
  title: string;
  description: string;
  items: string[];
  gradientFrom: string;
  gradientTo: string;
  iconName: string;
}

export interface QuickStat {
  id: string;
  label: string;
  value: string;
  subtext: string;
  status: 'ok' | 'warning' | 'info';
}
