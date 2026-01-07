import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Activity, 
  Heart, 
  Moon, 
  Brain, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Droplet,
  Scale,
  Calendar
} from 'lucide-react';
import { explainRisk } from "../../api";



interface HealthFormData {
  age: number;
  gender: 'male' | 'female' | 'other';
  bmi: number;
  fastingGlucose: number;
  systolicBP: number;
  diastolicBP: number;
  physicalActivity: 'low' | 'medium' | 'high';
  sleepHours: number;
  stressLevel: number;
}

interface HealthFormProps {
  onClose: () => void;
  onSubmit: (data: HealthFormData) => void;
}

export function HealthForm({ onClose, onSubmit }: HealthFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<HealthFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<HealthFormData>({
    mode: 'onBlur',
    defaultValues: formData
  });

  const steps = [
    { title: 'Basic Info', icon: User, fields: ['age', 'gender'] },
    { title: 'Body Metrics', icon: Scale, fields: ['bmi', 'fastingGlucose'] },
    { title: 'Vital Signs', icon: Heart, fields: ['systolicBP', 'diastolicBP'] },
    { title: 'Lifestyle', icon: Activity, fields: ['physicalActivity', 'sleepHours', 'stressLevel'] }
  ];

const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    const fieldsToValidate = steps[currentStep].fields as Array<keyof HealthFormData>;
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      const currentValues = watch();
      setFormData({ ...formData, ...currentValues });
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onFormSubmit = async (data: HealthFormData) => {
    try {
      setIsSubmitting(true);

    console.log("Sending to backend:", data);

    const result = await explainRisk({
      age: data.age,
      gender: data.gender,
      bmi: data.bmi,
      glucose_mg_dl: data.fastingGlucose,
      systolic_bp: data.systolicBP,
      diastolic_bp: data.diastolicBP,
      exercise_minutes_per_week:
        data.physicalActivity === "high" ? 300 :
        data.physicalActivity === "medium" ? 150 : 60,
      sleep_hours_per_night: data.sleepHours,
      stress_level: data.stressLevel,
    });

    console.log("Backend response:", result);

    onSubmit(data); // optional
  } catch (error) {
    console.error("Backend error:", error);
    alert("Backend connection failed");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-2">Health Assessment</h2>
            <p className="text-blue-100">Help us understand your health profile</p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mt-6 mb-2">
            <div className="flex justify-between text-sm mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all
                      ${isCompleted ? 'bg-white text-green-600' : ''}
                      ${isCurrent ? 'bg-white text-blue-600 ring-4 ring-white/30' : ''}
                      ${!isCompleted && !isCurrent ? 'bg-white/20 text-white' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <Step1BasicInfo
                key="step1"
                register={register}
                errors={errors}
                watch={watch}
              />
            )}
            {currentStep === 1 && (
              <Step2BodyMetrics
                key="step2"
                register={register}
                errors={errors}
                watch={watch}
              />
            )}
            {currentStep === 2 && (
              <Step3VitalSigns
                key="step3"
                register={register}
                errors={errors}
                watch={watch}
              />
            )}
            {currentStep === 3 && (
              <Step4Lifestyle
                key="step4"
                register={register}
                errors={errors}
                watch={watch}
              />
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 mt-8"
          >
            {currentStep > 0 && (
              <motion.button
                type="button"
                onClick={handleBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </motion.button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <motion.button
                type="button"
                onClick={handleNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Assessment
                  </>
                )}
              </motion.button>
            )}
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Step 1: Basic Info
function Step1BasicInfo({ register, errors, watch }: any) {
  const selectedGender = watch('gender');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <label className="flex items-center gap-2 text-gray-700 mb-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Age
        </label>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="number"
          {...register('age', {
            required: 'Age is required',
            min: { value: 18, message: 'Must be at least 18 years old' },
            max: { value: 120, message: 'Please enter a valid age' },
            valueAsNumber: true
          })}
          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none"
          placeholder="Enter your age"
        />
        {errors.age && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.age.message}
          </motion.p>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-gray-700 mb-3">
          <User className="w-5 h-5 text-blue-600" />
          Gender
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['male', 'female', 'other'].map((gender) => (
            <motion.label
              key={gender}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative cursor-pointer rounded-xl border-2 p-4 text-center transition-all
                ${selectedGender === gender 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }
              `}
            >
              <input
                type="radio"
                value={gender}
                {...register('gender', { 
                  required: 'Gender is required',
                  validate: (value: string) => value !== undefined && value !== '' || 'Please select a gender'
                })}
                className="sr-only"
              />
              <span className="capitalize">{gender}</span>
              {selectedGender === gender && (
                <motion.div
                  layoutId="genderSelected"
                  className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.label>
          ))}
        </div>
        {errors.gender && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-2 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.gender.message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

// Step 2: Body Metrics
function Step2BodyMetrics({ register, errors, watch }: any) {
  const bmi = watch('bmi');

  const getBMICategory = (bmiValue: number) => {
    if (!bmiValue) return { label: '', color: '' };
    if (bmiValue < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmiValue < 25) return { label: 'Normal', color: 'text-green-600' };
    if (bmiValue < 30) return { label: 'Overweight', color: 'text-orange-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  const bmiCategory = getBMICategory(bmi);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <label className="flex items-center gap-2 text-gray-700 mb-2">
          <Scale className="w-5 h-5 text-blue-600" />
          BMI (Body Mass Index)
        </label>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="number"
          step="0.1"
          {...register('bmi', {
            required: 'BMI is required',
            min: { value: 10, message: 'Please enter a valid BMI' },
            max: { value: 60, message: 'Please enter a valid BMI' },
            valueAsNumber: true
          })}
          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none"
          placeholder="e.g., 24.5"
        />
        {bmi && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm mt-2 font-medium ${bmiCategory.color}`}
          >
            Category: {bmiCategory.label}
          </motion.p>
        )}
        {errors.bmi && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.bmi.message}
          </motion.p>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-gray-700 mb-2">
          <Droplet className="w-5 h-5 text-blue-600" />
          Fasting Glucose (mg/dL)
        </label>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="number"
          {...register('fastingGlucose', {
            required: 'Fasting glucose is required',
            min: { value: 50, message: 'Please enter a valid glucose level' },
            max: { value: 400, message: 'Please enter a valid glucose level' },
            valueAsNumber: true
          })}
          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none"
          placeholder="e.g., 95"
        />
        <p className="text-xs text-gray-500 mt-1">Normal range: 70-100 mg/dL</p>
        {errors.fastingGlucose && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.fastingGlucose.message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

// Step 3: Vital Signs
function Step3VitalSigns({ register, errors }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <label className="flex items-center gap-2 text-gray-700 mb-3">
          <Heart className="w-5 h-5 text-red-600" />
          Blood Pressure
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Systolic</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="number"
              {...register('systolicBP', {
                required: 'Systolic BP is required',
                min: { value: 70, message: 'Too low' },
                max: { value: 200, message: 'Too high' },
                valueAsNumber: true
              })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:bg-white transition-all outline-none"
              placeholder="120"
            />
            {errors.systolicBP && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs mt-1"
              >
                {errors.systolicBP.message}
              </motion.p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Diastolic</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="number"
              {...register('diastolicBP', {
                required: 'Diastolic BP is required',
                min: { value: 40, message: 'Too low' },
                max: { value: 130, message: 'Too high' },
                valueAsNumber: true
              })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:bg-white transition-all outline-none"
              placeholder="80"
            />
            {errors.diastolicBP && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs mt-1"
              >
                {errors.diastolicBP.message}
              </motion.p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Normal range: 90-120 / 60-80 mmHg</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
      >
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Take blood pressure measurements while resting for most accurate results.
        </p>
      </motion.div>
    </motion.div>
  );
}

// Step 4: Lifestyle
function Step4Lifestyle({ register, errors, watch }: any) {
  const selectedActivity = watch('physicalActivity');
  const sleepHours = watch('sleepHours');
  const stressLevel = watch('stressLevel');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <label className="flex items-center gap-2 text-gray-700 mb-3">
          <Activity className="w-5 h-5 text-green-600" />
          Physical Activity Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'low', label: 'Low', desc: 'Sedentary' },
            { value: 'medium', label: 'Medium', desc: 'Active' },
            { value: 'high', label: 'High', desc: 'Very Active' }
          ].map((activity) => (
            <motion.label
              key={activity.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative cursor-pointer rounded-xl border-2 p-4 text-center transition-all
                ${selectedActivity === activity.value 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }
              `}
            >
              <input
                type="radio"
                value={activity.value}
                {...register('physicalActivity', { 
                  required: 'Activity level is required',
                  validate: (value: string) => value !== undefined && value !== '' || 'Please select an activity level'
                })}
                className="sr-only"
              />
              <div className="font-medium">{activity.label}</div>
              <div className="text-xs text-gray-600 mt-1">{activity.desc}</div>
              {selectedActivity === activity.value && (
                <motion.div
                  layoutId="activitySelected"
                  className="absolute -top-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.label>
          ))}
        </div>
        {errors.physicalActivity && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-2 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.physicalActivity.message}
          </motion.p>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-gray-700 mb-2">
          <Moon className="w-5 h-5 text-indigo-600" />
          Average Sleep Hours per Night
        </label>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="number"
          step="0.5"
          {...register('sleepHours', {
            required: 'Sleep hours is required',
            min: { value: 2, message: 'Please enter a valid number' },
            max: { value: 16, message: 'Please enter a valid number' },
            valueAsNumber: true
          })}
          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:bg-white transition-all outline-none"
          placeholder="e.g., 7.5"
        />
        {sleepHours && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((sleepHours / 12) * 100, 100)}%` }}
            className="h-2 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full mt-2"
          />
        )}
        <p className="text-xs text-gray-500 mt-1">Recommended: 7-9 hours</p>
        {errors.sleepHours && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.sleepHours.message}
          </motion.p>
        )}
      </div>

      <div>
        <label className="flex items-center justify-between text-gray-700 mb-2">
          <span className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Stress Level
          </span>
          <span className="text-2xl font-bold text-purple-600">
            {stressLevel || 0}
          </span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          defaultValue="5"
          {...register('stressLevel', {
            required: 'Stress level is required',
            min: { value: 1, message: 'Minimum stress level is 1' },
            max: { value: 10, message: 'Maximum stress level is 10' },
            valueAsNumber: true
          })}
          className="w-full h-3 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #22c55e 0%, #eab308 50%, #ef4444 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Low (1)</span>
          <span>Moderate (5)</span>
          <span>High (10)</span>
        </div>
        {stressLevel && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`mt-3 p-3 rounded-xl ${
              stressLevel <= 3 ? 'bg-green-100 text-green-800' :
              stressLevel <= 6 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}
          >
            <p className="text-sm font-medium">
              {stressLevel <= 3 ? '✓ Manageable stress level' :
               stressLevel <= 6 ? '⚠ Moderate stress - consider relaxation techniques' :
               '⚠ High stress - consult a healthcare professional'}
            </p>
          </motion.div>
        )}
        {errors.stressLevel && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.stressLevel.message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}