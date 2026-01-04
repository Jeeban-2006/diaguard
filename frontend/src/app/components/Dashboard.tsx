<<<<<<< HEAD
=======
import React from 'react';
>>>>>>> a3a9ef4 (Still working)
import { motion } from 'motion/react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Heart, 
  Brain, 
  Moon, 
  Utensils,
  AlertCircle,
  CheckCircle,
  Info,
  Download,
<<<<<<< HEAD
  Calendar
=======
  Calendar,
  LucideIcon
>>>>>>> a3a9ef4 (Still working)
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface DashboardProps {
  onClose: () => void;
  healthData: {
    age: number;
    gender: string;
    bmi: number;
    fastingGlucose: number;
    systolicBP: number;
    diastolicBP: number;
    physicalActivity: string;
    sleepHours: number;
    stressLevel: number;
  };
  riskScore: number;
  riskStage: 'Normal' | 'Pre-diabetic' | 'High Risk';
}

export function Dashboard({ onClose, healthData, riskScore, riskStage }: DashboardProps) {
  // Generate mock trend data for the past 12 months
  const trendData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (11 - i));
    const monthName = month.toLocaleDateString('en-US', { month: 'short' });
    
    // Simulate a trend based on current risk score
    const baseScore = riskScore;
    const variation = Math.random() * 10 - 5; // Random variation ±5
    const score = Math.max(0, Math.min(100, baseScore + variation - (i * 0.5))); // Slight improvement over time
    
    return {
      month: monthName,
      score: Math.round(score)
    };
  });

  // Calculate feature contributions based on health data
  const featureContributions = [
    {
      name: 'Fasting Glucose',
      value: healthData.fastingGlucose > 100 ? 
        Math.min(((healthData.fastingGlucose - 100) / 100) * 100, 100) : 
        -Math.min(((100 - healthData.fastingGlucose) / 30) * 50, 50),
      icon: Activity,
      color: healthData.fastingGlucose > 100 ? '#ef4444' : '#22c55e'
    },
    {
      name: 'BMI',
      value: healthData.bmi > 25 ? 
        Math.min(((healthData.bmi - 25) / 10) * 100, 100) : 
        -Math.min(((25 - healthData.bmi) / 7) * 50, 50),
      icon: Activity,
      color: healthData.bmi > 25 ? '#f59e0b' : '#22c55e'
    },
    {
      name: 'Blood Pressure',
      value: healthData.systolicBP > 130 ? 
        Math.min(((healthData.systolicBP - 130) / 70) * 100, 100) : 
        -Math.min(((130 - healthData.systolicBP) / 40) * 50, 50),
      icon: Heart,
      color: healthData.systolicBP > 130 ? '#ef4444' : '#22c55e'
    },
    {
      name: 'Physical Activity',
      value: healthData.physicalActivity === 'low' ? 40 : 
             healthData.physicalActivity === 'medium' ? -20 : -40,
      icon: Activity,
      color: healthData.physicalActivity === 'low' ? '#f59e0b' : '#22c55e'
    },
    {
      name: 'Sleep Quality',
      value: healthData.sleepHours < 7 ? 
        Math.min(((7 - healthData.sleepHours) / 5) * 100, 100) : 
        -Math.min(((healthData.sleepHours - 7) / 2) * 30, 30),
      icon: Moon,
      color: healthData.sleepHours < 7 ? '#f59e0b' : '#22c55e'
    },
    {
      name: 'Stress Level',
      value: healthData.stressLevel > 6 ? 
        Math.min((healthData.stressLevel / 10) * 100, 100) : 
        -Math.min(((6 - healthData.stressLevel) / 6) * 50, 50),
      icon: Brain,
      color: healthData.stressLevel > 6 ? '#ef4444' : '#22c55e'
    }
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  // Generate personalized recommendations
<<<<<<< HEAD
  const recommendations = [];
=======
  interface Recommendation {
    icon: LucideIcon;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }
  const recommendations: Recommendation[] = [];
>>>>>>> a3a9ef4 (Still working)
  if (healthData.fastingGlucose > 100) {
    recommendations.push({
      icon: Utensils,
      title: 'Monitor Blood Sugar',
      description: 'Your fasting glucose is elevated. Focus on low-glycemic foods and reduce sugar intake.',
      priority: 'high'
    });
  }
  if (healthData.bmi > 25) {
    recommendations.push({
      icon: Activity,
      title: 'Weight Management',
      description: 'Consider a balanced diet and regular exercise to achieve a healthier BMI.',
      priority: healthData.bmi > 30 ? 'high' : 'medium'
    });
  }
  if (healthData.physicalActivity === 'low') {
    recommendations.push({
      icon: Activity,
      title: 'Increase Physical Activity',
      description: 'Aim for at least 150 minutes of moderate aerobic activity per week.',
      priority: 'high'
    });
  }
  if (healthData.sleepHours < 7) {
    recommendations.push({
      icon: Moon,
      title: 'Improve Sleep Hygiene',
      description: 'Prioritize 7-9 hours of quality sleep per night to support metabolic health.',
      priority: 'medium'
    });
  }
  if (healthData.stressLevel > 6) {
    recommendations.push({
      icon: Brain,
      title: 'Manage Stress',
      description: 'Practice stress-reduction techniques like meditation, yoga, or deep breathing.',
      priority: 'medium'
    });
  }
  if (healthData.systolicBP > 130) {
    recommendations.push({
      icon: Heart,
      title: 'Monitor Blood Pressure',
      description: 'Your blood pressure is elevated. Reduce sodium intake and stay physically active.',
      priority: 'high'
    });
  }

  // If low risk, add positive recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      {
        icon: CheckCircle,
        title: 'Maintain Healthy Lifestyle',
        description: 'Keep up your current healthy habits with regular exercise and balanced nutrition.',
        priority: 'low'
      },
      {
        icon: Calendar,
        title: 'Regular Checkups',
        description: 'Continue annual health screenings to monitor your wellbeing.',
        priority: 'low'
      }
    );
  }

  const getRiskColor = () => {
    if (riskStage === 'Normal') return { bg: 'from-green-500 to-emerald-600', text: 'text-green-700', badge: 'bg-green-100' };
    if (riskStage === 'Pre-diabetic') return { bg: 'from-yellow-500 to-orange-600', text: 'text-yellow-700', badge: 'bg-yellow-100' };
    return { bg: 'from-red-500 to-rose-600', text: 'text-red-700', badge: 'bg-red-100' };
  };

  const colors = getRiskColor();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="min-h-screen p-4 flex items-start justify-center py-8">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${colors.bg} p-6 text-white relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">DiaGuard AI Dashboard</h1>
                <p className="text-white/90">Personalized Diabetes Risk Analysis</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export Report
              </motion.button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Top Section: Risk Score + Stage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk Score Circle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Diabetes Risk Score</h2>
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Background circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="#e5e7eb"
                        strokeWidth="16"
                        fill="none"
                      />
                      {/* Animated progress circle */}
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke={`url(#gradient-${riskStage})`}
                        strokeWidth="16"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: 553 }}
                        animate={{ strokeDashoffset: 553 - (553 * riskScore) / 100 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        style={{ strokeDasharray: 553 }}
                      />
                      <defs>
                        <linearGradient id={`gradient-${riskStage}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={riskStage === 'Normal' ? '#22c55e' : riskStage === 'Pre-diabetic' ? '#f59e0b' : '#ef4444'} />
                          <stop offset="100%" stopColor={riskStage === 'Normal' ? '#10b981' : riskStage === 'Pre-diabetic' ? '#ea580c' : '#dc2626'} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                        className={`text-5xl font-bold ${colors.text}`}
                      >
                        {riskScore}
                      </motion.span>
                      <span className="text-gray-600 text-sm">out of 100</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Risk Stage Badge + Key Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Risk Classification</h2>
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className={`${colors.badge} ${colors.text} px-6 py-4 rounded-xl text-center border-2 ${riskStage === 'Normal' ? 'border-green-200' : riskStage === 'Pre-diabetic' ? 'border-yellow-200' : 'border-red-200'}`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {riskStage === 'Normal' ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        <AlertCircle className="w-8 h-8" />
                      )}
                      <span className="text-2xl font-bold">{riskStage}</span>
                    </div>
                    <p className="text-sm">
                      {riskStage === 'Normal' && 'Your diabetes risk is within healthy range'}
                      {riskStage === 'Pre-diabetic' && 'Early intervention can prevent progression'}
                      {riskStage === 'High Risk' && 'Immediate attention recommended'}
                    </p>
                  </motion.div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={Activity}
                    label="BMI"
                    value={healthData.bmi.toFixed(1)}
                    color="text-blue-600"
                  />
                  <StatCard
                    icon={Heart}
                    label="Blood Pressure"
                    value={`${healthData.systolicBP}/${healthData.diastolicBP}`}
                    color="text-red-600"
                  />
                </div>
              </motion.div>
            </div>

            {/* Risk Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">12-Month Risk Trend</h2>
                <div className="flex items-center gap-2 text-sm">
                  {trendData[11].score < trendData[0].score ? (
                    <>
                      <TrendingDown className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">Improving</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-medium">Attention Needed</span>
                    </>
                  )}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '8px 12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke={riskStage === 'Normal' ? '#22c55e' : riskStage === 'Pre-diabetic' ? '#f59e0b' : '#ef4444'}
                    strokeWidth={3}
                    dot={{ fill: '#fff', stroke: riskStage === 'Normal' ? '#22c55e' : riskStage === 'Pre-diabetic' ? '#f59e0b' : '#ef4444', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Feature Contributions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200"
            >
              <div className="flex items-center gap-2 mb-6">
                <Info className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">AI Explainability - Risk Factors</h2>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                Understanding which health metrics contribute most to your diabetes risk score
              </p>
              <div className="space-y-4">
                {featureContributions.map((feature, index) => {
                  const FeatureIcon = feature.icon;
                  const isNegative = feature.value < 0;
                  const absValue = Math.abs(feature.value);
                  
                  return (
                    <motion.div
                      key={feature.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FeatureIcon className="w-5 h-5" style={{ color: feature.color }} />
                          <span className="font-medium text-gray-700">{feature.name}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: feature.color }}>
                          {isNegative ? '-' : '+'}{absValue.toFixed(0)}
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${absValue}%` }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: feature.color }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Lifestyle Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Personalized Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, index) => {
                  const RecIcon = rec.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ y: -4 }}
                      className={`p-5 rounded-xl border-2 transition-all ${
                        rec.priority === 'high' 
                          ? 'bg-red-50 border-red-200' 
                          : rec.priority === 'medium'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          rec.priority === 'high' 
                            ? 'bg-red-100' 
                            : rec.priority === 'medium'
                            ? 'bg-yellow-100'
                            : 'bg-green-100'
                        }`}>
                          <RecIcon className={`w-5 h-5 ${
                            rec.priority === 'high' 
                              ? 'text-red-600' 
                              : rec.priority === 'medium'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{rec.title}</h3>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-xs text-gray-500 pt-4"
            >
              <p>
                This assessment is for informational purposes only and does not constitute medical advice. 
                Please consult with a healthcare professional for proper diagnosis and treatment.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white p-4 rounded-xl border-2 border-gray-200"
    >
      <Icon className={`w-6 h-6 mb-2 ${color}`} />
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`font-bold ${color}`}>{value}</p>
    </motion.div>
  );
}
