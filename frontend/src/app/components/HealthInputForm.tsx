import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { getCurrentUser, getProfile, signOut } from '@/services/authService';

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
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        if (user) {
          const profile = await getProfile(user.id);
          if (profile?.full_name) {
            setUserName(profile.full_name);
          } else {
            setUserName(user.email?.split('@')[0] || 'User');
          }
        }
      } catch (err) {
        console.error('Failed to load user', err);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

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
  const progress = Math.round((filledFields / totalFields) * 100);

  const personalInfoComplete = formValues.age && formValues.gender;
  const healthMetricsComplete = formValues.bmi && formValues.fastingGlucose && formValues.systolicBP && formValues.diastolicBP;
  const lifestyleComplete = formValues.physicalActivity && formValues.sleepHours && formValues.stressLevel;

  const isFormFullyComplete = !!personalInfoComplete && !!healthMetricsComplete && !!lifestyleComplete && Object.keys(errors).length === 0;

  const onFormSubmit = async (data: HealthFormData) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSubmit(data);
    setIsSubmitting(false);
  };

  const getBMICategory = (bmi: number) => {
    if (!bmi) return { label: '', color: '' };
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-orange-500' };
    if (bmi < 25) return { label: 'Normal', color: 'text-[#0B4635]' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  const getGlucoseStatus = (glucose: number) => {
    if (!glucose) return { label: '', color: '' };
    if (glucose < 100) return { label: 'Normal', color: 'text-[#0B4635]' };
    if (glucose < 126) return { label: 'Pre-diabetic', color: 'text-orange-500' };
    return { label: 'Diabetic range', color: 'text-red-500' };
  };

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-['Plus_Jakarta_Sans'] flex flex-col md:flex-row relative">
      <style>{`
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>
      
      {/* ── Left Sidebar: Sticky Progress Dashboard ── */}
      <div className="w-full md:w-[400px] lg:w-[480px] md:fixed md:h-screen bg-[#F0F7F4] flex flex-col justify-between border-r border-[#E5E7EB] p-8 md:p-12 z-20 overflow-y-auto">
         <div>
            <div className="flex items-center justify-between mb-16">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-[#0B4635] flex items-center justify-center text-white font-bold">D</div>
                 <span className="font-bold text-xl text-[#1A1A1A]">DiaGuard</span>
               </div>
               <button onClick={handleLogout} className="text-[#666666] hover:text-[#0B4635] transition-colors p-2" title="Sign Out">
                 <LogOut className="w-5 h-5" />
               </button>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
              className="text-4xl font-bold text-[#1A1A1A] leading-tight mb-4"
            >
              Let's assess your health, <br/>
              <span className="text-[#0B4635]">{userName || 'Guest'}!</span>
            </motion.h1>
            
            <p className="text-[#666666] mb-12 text-lg">
              Fill out your metrics carefully. Our clinical AI needs accurate data to formulate your risk prediction.
            </p>

            {/* Progress Circular Indicator */}
            <div className="flex items-center gap-6 mb-12 bg-white p-6 rounded-[24px] shadow-sm border border-[#E5E7EB]">
               <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="#F0F7F4" strokeWidth="8" />
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="#0B4635" strokeWidth="8" strokeDasharray="226.2" strokeDashoffset={226.2 - (226.2 * progress) / 100} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[#0B4635] font-bold text-xl">{progress}%</span>
               </div>
               <div>
                  <h3 className="font-bold text-[#1A1A1A] text-lg">Overall Progress</h3>
                  <p className="text-sm text-[#666666]">{filledFields} of {totalFields} fields completed</p>
               </div>
            </div>

            {/* Step Navigation Menu */}
            <nav className="flex flex-col gap-2">
               <a href="#section-personal" className={`flex items-center justify-between p-4 rounded-2xl transition-all ${personalInfoComplete ? 'bg-[#D1FAE5] text-[#0B4635]' : 'hover:bg-black/5'}`}>
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${personalInfoComplete ? 'bg-[#0B4635] text-white' : 'bg-white text-[#666666] shadow-sm border border-[#E5E7EB]'}`}>
                        {personalInfoComplete ? <CheckCircle className="w-5 h-5" /> : <User className="w-5 h-5" />}
                     </div>
                     <span className="font-semibold">Personal Info</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
               </a>
               <a href="#section-health" className={`flex items-center justify-between p-4 rounded-2xl transition-all ${healthMetricsComplete ? 'bg-[#D1FAE5] text-[#0B4635]' : 'hover:bg-black/5'}`}>
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${healthMetricsComplete ? 'bg-[#0B4635] text-white' : 'bg-white text-[#666666] shadow-sm border border-[#E5E7EB]'}`}>
                        {healthMetricsComplete ? <CheckCircle className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                     </div>
                     <span className="font-semibold">Health Metrics</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
               </a>
               <a href="#section-lifestyle" className={`flex items-center justify-between p-4 rounded-2xl transition-all ${lifestyleComplete ? 'bg-[#D1FAE5] text-[#0B4635]' : 'hover:bg-black/5'}`}>
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lifestyleComplete ? 'bg-[#0B4635] text-white' : 'bg-white text-[#666666] shadow-sm border border-[#E5E7EB]'}`}>
                        {lifestyleComplete ? <CheckCircle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                     </div>
                     <span className="font-semibold">Lifestyle Factors</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
               </a>
            </nav>
         </div>

         {/* Footer Disclaimer */}
         <div className="mt-12 pt-8 border-t border-[#0B4635]/10">
            <p className="text-xs text-[#0B4635]/60 text-center">
              Protected by end-to-end encryption. Your medical data is securely anonymized for AI analysis.
            </p>
         </div>
      </div>

      {/* ── Right Content: Scrolling Form ── */}
      <div className="flex-1 md:ml-[400px] lg:ml-[480px] bg-white min-h-screen">
        <form onSubmit={handleSubmit(onFormSubmit)} className="max-w-3xl mx-auto px-6 py-12 md:py-24 flex flex-col gap-16">
          
          {/* Section 1: Personal Information */}
          <motion.div id="section-personal" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="scroll-mt-24">
             <div className="mb-8 flex items-end gap-4 border-b border-[#E5E7EB] pb-4">
               <div className="w-12 h-12 rounded-2xl bg-[#D1FAE5] flex items-center justify-center text-[#0B4635]">
                 <User className="w-6 h-6" />
               </div>
               <div>
                 <h2 className="text-3xl font-bold text-[#1A1A1A]">Personal Info</h2>
                 <p className="text-[#666666]">Basic demographic indicators.</p>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField label="Age" icon={Calendar} required error={errors.age?.message} isValid={!errors.age && !!formValues.age}>
                  <input
                    type="number"
                    {...register('age', {
                      required: 'Age is required',
                      min: { value: 18, message: 'Must be at least 18' },
                      max: { value: 100, message: 'Must be 100 or less' },
                      valueAsNumber: true
                    })}
                    className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl focus:border-[#0B4635] focus:ring-1 focus:ring-[#0B4635] focus:bg-white transition-all outline-none text-[#1A1A1A]"
                    placeholder="Enter your age"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Biological Gender" icon={User} required error={errors.gender?.message} isValid={!errors.gender && !!formValues.gender}>
                    <div className="grid grid-cols-3 gap-4">
                      {['male', 'female', 'other'].map((gender) => (
                        <label key={gender} className={`relative cursor-pointer rounded-2xl border p-4 text-center transition-all ${formValues.gender === gender ? 'border-[#0B4635] bg-[#F0F7F4] text-[#0B4635] ring-1 ring-[#0B4635]' : 'border-[#E5E7EB] hover:border-black/20 bg-white'}`}>
                          <input type="radio" value={gender} {...register('gender', { required: 'Gender is required' })} className="sr-only" onClick={() => trigger('gender')} />
                          <span className="capitalize font-semibold">{gender}</span>
                          {formValues.gender === gender && <CheckCircle className="w-5 h-5 text-[#0B4635] absolute top-3 right-3" />}
                        </label>
                      ))}
                    </div>
                  </FormField>
                </div>
             </div>
          </motion.div>

          {/* Section 2: Health Metrics */}
          <motion.div id="section-health" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="scroll-mt-24">
             <div className="mb-8 flex items-end gap-4 border-b border-[#E5E7EB] pb-4">
               <div className="w-12 h-12 rounded-2xl bg-[#D1FAE5] flex items-center justify-center text-[#0B4635]">
                 <Heart className="w-6 h-6" />
               </div>
               <div>
                 <h2 className="text-3xl font-bold text-[#1A1A1A]">Health Metrics</h2>
                 <p className="text-[#666666]">Physiological measurements.</p>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField label="Body Mass Index (BMI)" icon={Scale} required error={errors.bmi?.message} isValid={!errors.bmi && !!formValues.bmi} hint={formValues.bmi ? getBMICategory(formValues.bmi).label : undefined} hintColor={formValues.bmi ? getBMICategory(formValues.bmi).color : undefined}>
                  <input
                    type="number" step="0.1"
                    {...register('bmi', { required: 'BMI is required', min: { value: 10, message: 'Min 10' }, max: { value: 60, message: 'Max 60' }, valueAsNumber: true })}
                    className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl focus:border-[#0B4635] focus:ring-1 focus:ring-[#0B4635] focus:bg-white transition-all outline-none text-[#1A1A1A]"
                    placeholder="e.g., 24.5"
                  />
                </FormField>

                <FormField label="Fasting Glucose (mg/dL)" icon={Droplet} required error={errors.fastingGlucose?.message} isValid={!errors.fastingGlucose && !!formValues.fastingGlucose} hint={formValues.fastingGlucose ? getGlucoseStatus(formValues.fastingGlucose).label : undefined} hintColor={formValues.fastingGlucose ? getGlucoseStatus(formValues.fastingGlucose).color : undefined}>
                  <input
                    type="number"
                    {...register('fastingGlucose', { required: 'Glucose required', min: { value: 60, message: 'Min 60' }, max: { value: 300, message: 'Max 300' }, valueAsNumber: true })}
                    className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl focus:border-[#0B4635] focus:ring-1 focus:ring-[#0B4635] focus:bg-white transition-all outline-none text-[#1A1A1A]"
                    placeholder="e.g., 95"
                  />
                </FormField>

                <div className="md:col-span-2 bg-[#F8FAFC] p-6 rounded-[24px] border border-[#E5E7EB]">
                   <FormField label="Blood Pressure (mmHg)" icon={Heart} required error={errors.systolicBP?.message || errors.diastolicBP?.message} isValid={!errors.systolicBP && !errors.diastolicBP && !!formValues.systolicBP && !!formValues.diastolicBP}>
                     <div className="grid grid-cols-2 gap-6 mt-4">
                       <div>
                         <label className="text-sm font-semibold text-[#666666] mb-2 block">Systolic (Upper)</label>
                         <input
                           type="number"
                           {...register('systolicBP', { required: 'Required', min: 80, max: 200, valueAsNumber: true })}
                           className="w-full px-5 py-4 bg-white border border-[#E5E7EB] rounded-2xl focus:border-[#0B4635] focus:ring-1 focus:ring-[#0B4635] transition-all outline-none text-[#1A1A1A]"
                           placeholder="120"
                         />
                       </div>
                       <div>
                         <label className="text-sm font-semibold text-[#666666] mb-2 block">Diastolic (Lower)</label>
                         <input
                           type="number"
                           {...register('diastolicBP', { required: 'Required', min: 50, max: 120, valueAsNumber: true })}
                           className="w-full px-5 py-4 bg-white border border-[#E5E7EB] rounded-2xl focus:border-[#0B4635] focus:ring-1 focus:ring-[#0B4635] transition-all outline-none text-[#1A1A1A]"
                           placeholder="80"
                         />
                       </div>
                     </div>
                   </FormField>
                </div>
             </div>
          </motion.div>

          {/* Section 3: Lifestyle */}
          <motion.div id="section-lifestyle" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="scroll-mt-24">
             <div className="mb-8 flex items-end gap-4 border-b border-[#E5E7EB] pb-4">
               <div className="w-12 h-12 rounded-2xl bg-[#D1FAE5] flex items-center justify-center text-[#0B4635]">
                 <Activity className="w-6 h-6" />
               </div>
               <div>
                 <h2 className="text-3xl font-bold text-[#1A1A1A]">Lifestyle</h2>
                 <p className="text-[#666666]">Daily habits and routine.</p>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                   <FormField label="Physical Activity Level" icon={Activity} required error={errors.physicalActivity?.message} isValid={!errors.physicalActivity && !!formValues.physicalActivity}>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                       {[
                         { value: 'low', label: 'Low', desc: 'Minimal exercise' },
                         { value: 'medium', label: 'Medium', desc: 'Regular light activity' },
                         { value: 'high', label: 'High', desc: 'Frequent vigorous exercise' }
                       ].map((activity) => (
                         <label key={activity.value} className={`relative block cursor-pointer rounded-2xl border p-5 transition-all ${formValues.physicalActivity === activity.value ? 'border-[#0B4635] bg-[#F0F7F4] ring-1 ring-[#0B4635]' : 'border-[#E5E7EB] hover:border-black/20 bg-white'}`}>
                           <input type="radio" value={activity.value} {...register('physicalActivity', { required: 'Required' })} className="sr-only" onClick={() => trigger('physicalActivity')} />
                           <span className="font-bold text-[#1A1A1A] block mb-1">{activity.label}</span>
                           <span className="text-sm text-[#666666]">{activity.desc}</span>
                           {formValues.physicalActivity === activity.value && <CheckCircle className="w-5 h-5 text-[#0B4635] absolute top-4 right-4" />}
                         </label>
                       ))}
                     </div>
                   </FormField>
                </div>

                <FormField label="Sleep (Hours per night)" icon={Moon} required error={errors.sleepHours?.message} isValid={!errors.sleepHours && !!formValues.sleepHours}>
                  <input
                    type="number" step="0.5"
                    {...register('sleepHours', { 
                      required: 'Required', 
                      min: { value: 0, message: 'Min 0 hours' }, 
                      max: { value: 24, message: 'Max 24 hours' }, 
                      valueAsNumber: true 
                    })}
                    className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl focus:border-[#0B4635] focus:ring-1 focus:ring-[#0B4635] focus:bg-white transition-all outline-none text-[#1A1A1A]"
                    placeholder="e.g., 7.5"
                  />
                </FormField>

                <div className="md:col-span-2 mt-4">
                   <FormField label="Stress Level" icon={Brain} required error={errors.stressLevel?.message} isValid={!errors.stressLevel && !!formValues.stressLevel}>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                       {[
                         { value: 'low', label: 'Low', desc: 'Well-managed, minimal' },
                         { value: 'medium', label: 'Medium', desc: 'Moderate, occasional' },
                         { value: 'high', label: 'High', desc: 'Frequent or chronic' }
                       ].map((stress) => (
                         <label key={stress.value} className={`relative block cursor-pointer rounded-2xl border p-5 transition-all ${formValues.stressLevel === stress.value ? 'border-[#0B4635] bg-[#F0F7F4] ring-1 ring-[#0B4635]' : 'border-[#E5E7EB] hover:border-black/20 bg-white'}`}>
                           <input type="radio" value={stress.value} {...register('stressLevel', { required: 'Required' })} className="sr-only" onClick={() => trigger('stressLevel')} />
                           <span className="font-bold text-[#1A1A1A] block mb-1">{stress.label}</span>
                           <span className="text-sm text-[#666666]">{stress.desc}</span>
                           {formValues.stressLevel === stress.value && <CheckCircle className="w-5 h-5 text-[#0B4635] absolute top-4 right-4" />}
                         </label>
                       ))}
                     </div>
                   </FormField>
                </div>
             </div>
          </motion.div>

          {/* Submit Action Area */}
          <div className="mt-8 pt-8 border-t border-[#E5E7EB]">
             <motion.button
                type="submit"
                disabled={!isFormFullyComplete || isSubmitting}
                whileHover={isFormFullyComplete && !isSubmitting ? { scale: 1.02 } : {}}
                whileTap={isFormFullyComplete && !isSubmitting ? { scale: 0.98 } : {}}
                className={`
                  w-full py-5 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300
                  ${isFormFullyComplete && !isSubmitting
                    ? 'bg-[#0B4635] text-white hover:bg-[#083327] hover:shadow-xl cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    Predict My Diabetes Risk <Sparkles className="w-5 h-5" />
                  </>
                )}
              </motion.button>
              
              {!isFormFullyComplete && filledFields > 0 && (
                <p className="mt-4 text-center text-sm font-semibold text-orange-500 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Please complete all required fields
                </p>
              )}
          </div>
        </form>
      </div>

    </div>
  );
}

// Reusable Field Component
function FormField({ 
  label, icon: Icon, required, error, isValid, hint, hintColor, children 
}: { 
  label: string; icon: any; required?: boolean; error?: string; isValid?: boolean; hint?: string; hintColor?: string; children: React.ReactNode; 
}) {
  return (
    <div>
      <label className="flex items-center gap-2 font-bold text-[#1A1A1A] mb-3">
        {label}
        {required && <span className="text-[#0B4635]">*</span>}
        {isValid && <CheckCircle className="w-4 h-4 text-[#0B4635] ml-auto" />}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-sm mt-2 flex items-center gap-1 font-semibold">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}
      {hint && !error && (
        <p className={`text-sm mt-2 font-bold ${hintColor || 'text-[#0B4635]'}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
