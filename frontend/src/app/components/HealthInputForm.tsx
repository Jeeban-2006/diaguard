<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> a3a9ef4 (Still working)
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Activity, 
  Heart, 
  Moon, 
  Brain, 
  Scale,
  Droplet,
  Calendar,
  Gauge,
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { FormBackground3D } from './FormBackground3D';

interface HealthFormData {
  age: number;
  gender: 'male' | 'female' | 'other';
  bmi: number;
  fastingGlucose: number;
  systolicBP: number;
  diastolicBP: number;
  physicalActivity: 'low' | 'medium' | 'high';
  sleepHours: number;
  stressLevel: 'low' | 'medium' | 'high';
}

interface HealthInputFormProps {
  onSubmit: (data: HealthFormData) => void;
}

export function HealthInputForm({ onSubmit }: HealthInputFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    watch,
    trigger
  } = useForm<HealthFormData>({
    mode: 'onChange',
    defaultValues: {
      physicalActivity: undefined,
      gender: undefined,
      stressLevel: undefined
    }
  });

  const formValues = watch();

  // Calculate progress
  const totalFields = 9;
  const filledFields = Object.keys(dirtyFields).length;
  const progress = (filledFields / totalFields) * 100;

  // Check which sections are complete
  const personalInfoComplete = formValues.age && formValues.gender;
  const healthMetricsComplete = formValues.bmi && formValues.fastingGlucose && formValues.systolicBP && formValues.diastolicBP;
  const lifestyleComplete = formValues.physicalActivity && formValues.sleepHours && formValues.stressLevel;

  const onFormSubmit = async (data: HealthFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSubmit(data);
    setIsSubmitting(false);
  };

  const getBMICategory = (bmi: number) => {
    if (!bmi) return { label: '', color: '' };
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  const getGlucoseStatus = (glucose: number) => {
    if (!glucose) return { label: '', color: '' };
    if (glucose < 100) return { label: 'Normal', color: 'text-green-600' };
    if (glucose < 126) return { label: 'Pre-diabetic', color: 'text-orange-600' };
    return { label: 'Diabetic range', color: 'text-red-600' };
  };

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (!systolic || !diastolic) return { label: '', color: '' };
    if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: 'text-green-600' };
    if (systolic < 130 && diastolic < 80) return { label: 'Elevated', color: 'text-yellow-600' };
    if (systolic < 140 || diastolic < 90) return { label: 'High (Stage 1)', color: 'text-orange-600' };
    return { label: 'High (Stage 2)', color: 'text-red-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* 3D Background */}
      <FormBackground3D />

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                DiaGuard AI Health Assessment
              </h1>
              <p className="text-gray-600 mt-1">Complete all fields to receive your personalized diabetes risk analysis</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <div className="text-right">
                <p className="text-sm text-gray-600">AI-Powered</p>
                <p className="font-bold text-gray-900">Risk Prediction</p>
              </div>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700 font-medium">Form Progress</span>
              <span className="text-blue-600 font-bold">{Math.round(progress)}% Complete</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-600 to-green-600 rounded-full relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>

            {/* Section Indicators */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <SectionIndicator
                title="Personal Info"
                complete={!!personalInfoComplete}
                icon={User}
              />
              <SectionIndicator
                title="Health Metrics"
                complete={!!healthMetricsComplete}
                icon={Heart}
              />
              <SectionIndicator
                title="Lifestyle Factors"
                complete={!!lifestyleComplete}
                icon={Activity}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Section 1: Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border-2 border-blue-100 p-6"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-600">Basic demographic data</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Age */}
                <FormField
                  label="Age"
                  icon={Calendar}
                  required
                  error={errors.age?.message}
                  isValid={!errors.age && !!formValues.age}
                >
                  <input
                    type="number"
                    {...register('age', {
                      required: 'Age is required',
                      min: { value: 18, message: 'Must be at least 18' },
                      max: { value: 100, message: 'Must be 100 or less' },
                      valueAsNumber: true
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none"
                    placeholder="Enter your age"
                    onFocus={() => setCurrentSection('age')}
                  />
                </FormField>

                {/* Gender */}
                <FormField
                  label="Gender"
                  icon={User}
                  required
                  error={errors.gender?.message}
                  isValid={!errors.gender && !!formValues.gender}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {['male', 'female', 'other'].map((gender) => (
                      <label
                        key={gender}
                        className={`
                          relative cursor-pointer rounded-xl border-2 p-3 text-center transition-all
                          ${formValues.gender === gender 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          value={gender}
                          {...register('gender', { 
                            required: 'Gender is required',
                            validate: (value) => value !== undefined || 'Please select a gender'
                          })}
                          className="sr-only"
                          onClick={() => trigger('gender')}
                        />
                        <span className="capitalize font-medium text-sm">{gender}</span>
                        {formValues.gender === gender && (
                          <CheckCircle className="w-4 h-4 text-blue-600 absolute -top-1 -right-1" />
                        )}
                      </label>
                    ))}
                  </div>
                </FormField>
              </div>
            </motion.div>

            {/* Section 2: Health Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border-2 border-red-100 p-6"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Health Metrics</h2>
                  <p className="text-sm text-gray-600">Key health indicators</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* BMI */}
                <FormField
                  label="BMI (Body Mass Index)"
                  icon={Scale}
                  required
                  error={errors.bmi?.message}
                  isValid={!errors.bmi && !!formValues.bmi}
                  hint={formValues.bmi ? getBMICategory(formValues.bmi).label : undefined}
                  hintColor={formValues.bmi ? getBMICategory(formValues.bmi).color : undefined}
                >
                  <input
                    type="number"
                    step="0.1"
                    {...register('bmi', {
                      required: 'BMI is required',
                      min: { value: 10, message: 'Minimum BMI is 10' },
                      max: { value: 60, message: 'Maximum BMI is 60' },
                      valueAsNumber: true
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:bg-white transition-all outline-none"
                    placeholder="e.g., 24.5"
                    onFocus={() => setCurrentSection('bmi')}
                  />
                </FormField>

                {/* Fasting Glucose */}
                <FormField
                  label="Fasting Glucose (mg/dL)"
                  icon={Droplet}
                  required
                  error={errors.fastingGlucose?.message}
                  isValid={!errors.fastingGlucose && !!formValues.fastingGlucose}
                  hint={formValues.fastingGlucose ? getGlucoseStatus(formValues.fastingGlucose).label : undefined}
                  hintColor={formValues.fastingGlucose ? getGlucoseStatus(formValues.fastingGlucose).color : undefined}
                >
                  <input
                    type="number"
                    {...register('fastingGlucose', {
                      required: 'Fasting glucose is required',
                      min: { value: 60, message: 'Minimum is 60 mg/dL' },
                      max: { value: 200, message: 'Maximum is 200 mg/dL' },
                      valueAsNumber: true
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:bg-white transition-all outline-none"
                    placeholder="e.g., 95"
                    onFocus={() => setCurrentSection('glucose')}
                  />
                </FormField>

                {/* Blood Pressure */}
                <FormField
                  label="Blood Pressure (mmHg)"
                  icon={Heart}
                  required
                  error={errors.systolicBP?.message || errors.diastolicBP?.message}
                  isValid={!errors.systolicBP && !errors.diastolicBP && !!formValues.systolicBP && !!formValues.diastolicBP}
                  hint={formValues.systolicBP && formValues.diastolicBP ? getBPStatus(formValues.systolicBP, formValues.diastolicBP).label : undefined}
                  hintColor={formValues.systolicBP && formValues.diastolicBP ? getBPStatus(formValues.systolicBP, formValues.diastolicBP).color : undefined}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Systolic</label>
                      <input
                        type="number"
                        {...register('systolicBP', {
                          required: 'Required',
                          min: { value: 80, message: 'Min 80' },
                          max: { value: 200, message: 'Max 200' },
                          valueAsNumber: true
                        })}
                        className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:bg-white transition-all outline-none"
                        placeholder="120"
                        onFocus={() => setCurrentSection('bp')}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Diastolic</label>
                      <input
                        type="number"
                        {...register('diastolicBP', {
                          required: 'Required',
                          min: { value: 50, message: 'Min 50' },
                          max: { value: 120, message: 'Max 120' },
                          valueAsNumber: true
                        })}
                        className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:bg-white transition-all outline-none"
                        placeholder="80"
                        onFocus={() => setCurrentSection('bp')}
                      />
                    </div>
                  </div>
                </FormField>
              </div>
            </motion.div>

            {/* Section 3: Lifestyle Factors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border-2 border-green-100 p-6"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-100">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Lifestyle Factors</h2>
                  <p className="text-sm text-gray-600">Daily habits and routine</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Physical Activity */}
                <FormField
                  label="Physical Activity Level"
                  icon={Activity}
                  required
                  error={errors.physicalActivity?.message}
                  isValid={!errors.physicalActivity && !!formValues.physicalActivity}
                >
                  <div className="space-y-2">
                    {[
                      { value: 'low', label: 'Low', desc: 'Minimal exercise, mostly sedentary' },
                      { value: 'medium', label: 'Medium', desc: 'Regular light-moderate activity' },
                      { value: 'high', label: 'High', desc: 'Frequent vigorous exercise' }
                    ].map((activity) => (
                      <label
                        key={activity.value}
                        className={`
                          block cursor-pointer rounded-xl border-2 p-3 transition-all
                          ${formValues.physicalActivity === activity.value 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          value={activity.value}
                          {...register('physicalActivity', { 
                            required: 'Physical activity level is required',
                            validate: (value) => value !== undefined || 'Please select an activity level'
                          })}
                          className="sr-only"
                          onClick={() => trigger('physicalActivity')}
                        />
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900 block">{activity.label}</span>
                            <span className="text-xs text-gray-600">{activity.desc}</span>
                          </div>
                          {formValues.physicalActivity === activity.value && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </FormField>

                {/* Sleep Hours */}
                <FormField
                  label="Average Sleep Hours"
                  icon={Moon}
                  required
                  error={errors.sleepHours?.message}
                  isValid={!errors.sleepHours && !!formValues.sleepHours}
                  hint={formValues.sleepHours ? `${formValues.sleepHours} hours per night` : undefined}
                  hintColor="text-indigo-600"
                >
                  <input
                    type="number"
                    step="0.5"
                    {...register('sleepHours', {
                      required: 'Sleep hours is required',
                      min: { value: 3, message: 'Minimum is 3 hours' },
                      max: { value: 12, message: 'Maximum is 12 hours' },
                      valueAsNumber: true
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:bg-white transition-all outline-none"
                    placeholder="e.g., 7.5"
                    onFocus={() => setCurrentSection('sleep')}
                  />
                </FormField>

                {/* Stress Level */}
                <FormField
                  label="Stress Level"
                  icon={Brain}
                  required
                  error={errors.stressLevel?.message}
                  isValid={!errors.stressLevel && !!formValues.stressLevel}
                >
                  <div className="space-y-2">
                    {[
                      { value: 'low', label: 'Low', desc: 'Well-managed, minimal stress' },
                      { value: 'medium', label: 'Medium', desc: 'Moderate, occasional stress' },
                      { value: 'high', label: 'High', desc: 'Frequent or chronic stress' }
                    ].map((stress) => (
                      <label
                        key={stress.value}
                        className={`
                          block cursor-pointer rounded-xl border-2 p-3 transition-all
                          ${formValues.stressLevel === stress.value 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          value={stress.value}
                          {...register('stressLevel', { 
                            required: 'Stress level is required',
                            validate: (value) => value !== undefined || 'Please select a stress level'
                          })}
                          className="sr-only"
                          onClick={() => trigger('stressLevel')}
                        />
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900 block">{stress.label}</span>
                            <span className="text-xs text-gray-600">{stress.desc}</span>
                          </div>
                          {formValues.stressLevel === stress.value && (
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </FormField>
              </div>
            </motion.div>
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col items-center"
          >
            <motion.button
              type="submit"
              disabled={!isValid || isSubmitting}
              whileHover={isValid && !isSubmitting ? { scale: 1.02 } : {}}
              whileTap={isValid && !isSubmitting ? { scale: 0.98 } : {}}
              className={`
                w-full max-w-md px-8 py-5 rounded-2xl font-bold text-lg
                flex items-center justify-center gap-3 shadow-lg
                transition-all duration-300
                ${isValid && !isSubmitting
                  ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:shadow-xl cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Your Data...
                </>
              ) : (
                <>
                  <TrendingUp className="w-6 h-6" />
                  Predict My Diabetes Risk
                  <Sparkles className="w-6 h-6" />
                </>
              )}
            </motion.button>

            {!isValid && filledFields > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-red-600 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Please complete all required fields to continue
              </motion.p>
            )}

            {isValid && !isSubmitting && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-green-600 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                All fields complete! Ready to predict your risk
              </motion.p>
            )}
          </motion.div>
        </form>
      </div>

      {/* Footer Disclaimer */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500 text-center">
            This assessment is for informational purposes only and does not constitute medical advice. 
            Please consult with a healthcare professional for proper diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable Field Component
function FormField({ 
  label, 
  icon: Icon, 
  required, 
  error, 
  isValid, 
  hint, 
  hintColor, 
  children 
}: { 
  label: string; 
  icon: any; 
  required?: boolean; 
  error?: string; 
  isValid?: boolean; 
  hint?: string;
  hintColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-gray-700 font-medium">
          <Icon className="w-4 h-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
        {isValid && (
          <CheckCircle className="w-5 h-5 text-green-600" />
        )}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-1 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm mt-1 font-medium ${hintColor || 'text-gray-600'}`}
        >
          {hint}
        </motion.p>
      )}
    </div>
  );
}

// Section Indicator Component
function SectionIndicator({ 
  title, 
  complete, 
  icon: Icon 
}: { 
  title: string; 
  complete: boolean; 
  icon: any;
}) {
  return (
    <div className={`
      flex items-center gap-2 p-3 rounded-xl transition-all
      ${complete 
        ? 'bg-green-100 border-2 border-green-500' 
        : 'bg-gray-100 border-2 border-gray-300'
      }
    `}>
      <div className={`
        p-2 rounded-lg
        ${complete ? 'bg-green-500' : 'bg-gray-400'}
      `}>
        {complete ? (
          <CheckCircle className="w-4 h-4 text-white" />
        ) : (
          <Icon className="w-4 h-4 text-white" />
        )}
      </div>
      <span className={`text-sm font-medium ${complete ? 'text-green-700' : 'text-gray-600'}`}>
        {title}
      </span>
    </div>
  );
}
