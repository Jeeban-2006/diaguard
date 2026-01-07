import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, AlertTriangle, TrendingUp, Heart, Activity, Award, X } from 'lucide-react';

interface ResultsModalProps {
  onClose: () => void;
  riskLevel: 'low' | 'moderate' | 'high';
}

export function ResultsModal({ onClose, riskLevel }: ResultsModalProps) {
  const riskData = {
    low: {
      percentage: 15,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      icon: CheckCircle,
      title: 'Low Risk',
      message: 'Great news! Your diabetes risk is low.',
      recommendations: [
        'Maintain your current healthy lifestyle',
        'Continue regular physical activity',
        'Keep up with balanced nutrition',
        'Annual health checkups recommended'
      ]
    },
    moderate: {
      percentage: 45,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      icon: AlertTriangle,
      title: 'Moderate Risk',
      message: 'You have moderate diabetes risk. Early intervention can help.',
      recommendations: [
        'Increase physical activity to 150 min/week',
        'Focus on whole foods and reduce sugar intake',
        'Monitor blood glucose levels regularly',
        'Consult with a healthcare provider'
      ]
    },
    high: {
      percentage: 75,
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      icon: AlertTriangle,
      title: 'High Risk',
      message: 'Action needed. High diabetes risk detected.',
      recommendations: [
        'Schedule immediate consultation with a healthcare provider',
        'Start a structured exercise program',
        'Work with a nutritionist for meal planning',
        'Regular blood glucose monitoring essential'
      ]
    }
  };

  const data = riskData[riskLevel];
  const Icon = data.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${data.color} p-8 text-white relative overflow-hidden`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"
          />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="inline-block mb-4"
            >
              <Icon className="w-20 h-20 mx-auto" />
            </motion.div>
            <h2 className="text-4xl font-bold mb-2">Assessment Complete</h2>
            <p className="text-white/90 text-lg">{data.message}</p>
          </motion.div>
        </div>

        {/* Risk Meter */}
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex justify-between items-end mb-3">
              <span className="text-gray-700 font-medium">Diabetes Risk Score</span>
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                className={`text-4xl font-bold ${data.textColor}`}
              >
                {data.percentage}%
              </motion.span>
            </div>
            
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.percentage}%` }}
                transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${data.color} rounded-full relative`}
              >
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-white/30"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
                  }}
                />
              </motion.div>
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Low Risk</span>
              <span>Moderate</span>
              <span>High Risk</span>
            </div>
          </motion.div>

          {/* Risk Category Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className={`${data.bgColor} border-2 border-${riskLevel === 'low' ? 'green' : riskLevel === 'moderate' ? 'yellow' : 'red'}-200 rounded-2xl p-6 mb-6`}
          >
            <h3 className={`text-2xl font-bold ${data.textColor} mb-2`}>{data.title}</h3>
            <p className="text-gray-700">
              Based on your health metrics, we've calculated your diabetes risk profile. 
              This assessment uses advanced AI algorithms to analyze multiple health factors.
            </p>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Personalized Recommendations
            </h3>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold"
                  >
                    {index + 1}
                  </motion.div>
                  <p className="text-gray-700 flex-1 pt-1">{rec}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="grid grid-cols-3 gap-4 mt-8"
          >
            <MetricCard
              icon={Heart}
              label="Health Score"
              value="8.5/10"
              color="text-red-600"
              delay={1.6}
            />
            <MetricCard
              icon={Activity}
              label="Activity Level"
              value="Good"
              color="text-green-600"
              delay={1.7}
            />
            <MetricCard
              icon={Award}
              label="Progress"
              value="+12%"
              color="text-blue-600"
              delay={1.8}
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9 }}
            className="flex gap-4 mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Download Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Book Consultation
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-xs text-gray-500 text-center mt-6"
          >
            This assessment is for informational purposes only and does not replace professional medical advice.
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  delay 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  color: string; 
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={{ y: -5 }}
      className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl text-center border-2 border-gray-200"
    >
      <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </motion.div>
  );
}
