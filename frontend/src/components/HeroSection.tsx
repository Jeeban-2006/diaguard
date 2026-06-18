import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle, ShieldCheck, Mail, Activity, Play, ActivitySquare, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  onStartAssessment: () => void;
  onHowItWorks: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartAssessment,
  onHowItWorks,
}) => {
  const navigate = useNavigate();
  const [videoOpen, setVideoOpen] = React.useState(false);
  const [theme, setTheme] = React.useState('light'); // 'light' or 'dark'

  useEffect(() => {
    // Inject custom font and base transitions
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      
      .diaguard-container {
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .diaguard-container * {
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
      }
      /* Ensure forced overrides don't break dark mode */
      .light .diaguard-container h1, .light .diaguard-container h2, .light .diaguard-container h3, .light .diaguard-container h4 {
        color: #1A1A1A !important;
      }
      .dark .diaguard-container h1, .dark .diaguard-container h2, .dark .diaguard-container h3, .dark .diaguard-container h4 {
        color: #ffffff !important;
      }
      .diaguard-container .force-white h3, .diaguard-container .force-white p, .diaguard-container .force-white li, .diaguard-container .force-white span, .diaguard-container .force-white h4 {
        color: #ffffff !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={theme === 'dark' ? 'dark' : 'light'}>
      <div className={`diaguard-container min-h-screen text-left w-full relative z-10 bg-white dark:bg-[#07130F] text-[#1A1A1A] dark:text-white selection:bg-[#D1FAE5] selection:text-[#0B4635] dark:selection:bg-[#0B4635] dark:selection:text-white`}>
        
        {/* Header */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#07130F]/80 backdrop-blur-[10px] border-b border-[#E5E7EB] dark:border-white/10">
          <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0B4635] dark:bg-[#34D399] flex items-center justify-center text-white dark:text-[#07130F] font-bold text-xl">D</div>
              <span className="font-bold text-xl tracking-tight text-[#1A1A1A] dark:text-white">DiaGuard</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium">
            <a href="#features" className="text-[#1A1A1A] dark:text-gray-300 hover:text-[#0B4635] dark:hover:text-[#34D399]">Features</a>
            <a href="#science" className="text-[#1A1A1A] dark:text-gray-300 hover:text-[#0B4635] dark:hover:text-[#34D399]">Science</a>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-[#1A1A1A] dark:text-white transition-colors flex items-center justify-center"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartAssessment}
              className="bg-[#0B4635] dark:bg-[#34D399] hover:bg-[#083327] dark:hover:bg-[#10B981] text-white dark:text-[#07130F] px-4 md:px-7 py-2.5 md:py-3 rounded-lg font-semibold shadow-sm transition-colors text-sm md:text-base whitespace-nowrap"
            >
              Start Checkup
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-20 px-6 max-w-[1200px] mx-auto bg-white dark:bg-[#07130F]">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="flex flex-col items-start gap-6"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-[#D1FAE5] dark:bg-[#0B4635]/50 text-[#0B4635] dark:text-[#34D399] font-semibold text-sm border border-transparent dark:border-[#34D399]/30">
               <span className="w-2 h-2 rounded-full bg-[#0B4635] dark:bg-[#34D399] animate-pulse"></span>
               AI-Powered Health Intelligence
            </motion.div>
            <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-4xl md:text-5xl lg:text-[56px] leading-[1.15] font-bold tracking-tight">
              Prevent Diabetes <br className="hidden md:block"/> Before It Starts
            </motion.h1>
            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-[#666666] dark:text-gray-400 text-base md:text-lg leading-[1.5] max-w-md">
              Harness clinical-grade AI to assess your personal diabetes risk in
              minutes — backed by 94.7% validated accuracy across 50,000+
              assessments.
            </motion.p>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartAssessment}
                className="w-full sm:w-auto justify-center bg-[#0B4635] dark:bg-[#34D399] hover:bg-[#083327] dark:hover:bg-[#10B981] text-white dark:text-[#07130F] px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2 shadow-sm transition-colors"
              >
                Start Free Assessment <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVideoOpen(true)}
                className="w-full sm:w-auto justify-center border border-[#E5E7EB] dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 text-[#1A1A1A] dark:text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2 shadow-sm transition-colors"
              >
                <Play className="w-5 h-5" /> See How It Works
              </motion.button>
            </motion.div>
          </motion.div>
          <div className="relative mt-8 md:mt-0">
            {/* Main Lifestyle Image: Medical/Health theme */}
            <div className="rounded-[32px] md:rounded-[40px] overflow-hidden aspect-[4/5] relative shadow-lg dark:shadow-2xl dark:shadow-[#34D399]/10">
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800" 
                alt="Patient checking health app" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,70,53,0.3)] dark:from-[rgba(7,19,15,0.8)] to-transparent mix-blend-multiply"></div>
            </div>
            
            {/* Floating UI Card 1 (Hidden on Mobile to prevent overflow) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="hidden md:flex absolute -left-12 bottom-20 bg-white/70 dark:bg-[#0B1B15]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 rounded-3xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] items-center gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#D1FAE5] dark:bg-[#0B4635] flex items-center justify-center text-[#0B4635] dark:text-[#34D399]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">Risk Status</p>
                <p className="text-xl font-bold text-[#0B4635] dark:text-[#34D399]">Normal</p>
              </div>
            </motion.div>
            
             {/* Floating UI Card 2 (Hidden on Mobile to prevent overflow) */}
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.7, duration: 0.5 }}
               whileHover={{ scale: 1.05 }}
               className="hidden md:flex absolute -right-8 top-12 bg-white/70 dark:bg-[#0B1B15]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 rounded-3xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] items-center gap-4 cursor-pointer"
             >
              <div className="w-10 h-10 rounded-full bg-[#F0F7F4] dark:bg-[#0B4635] flex items-center justify-center text-[#0B4635] dark:text-[#34D399]">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">Analysis Complete</p>
                <p className="text-xs text-[#666666] dark:text-gray-400">Just now</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="bg-[#0B4635] dark:bg-[#0B1B15] border-y border-transparent dark:border-white/5 w-full py-12 md:py-16 text-white my-8 md:my-12 force-white">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/20 text-center text-white"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="pt-6 sm:pt-0">
            <h3 className="text-3xl md:text-4xl font-bold mb-2">94.7%</h3>
            <p className="text-[#D1FAE5] dark:text-[#34D399] font-medium text-sm md:text-base">Validated Accuracy</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="pt-6 sm:pt-0">
            <h3 className="text-3xl md:text-4xl font-bold mb-2">50K+</h3>
            <p className="text-[#D1FAE5] dark:text-[#34D399] font-medium text-sm md:text-base">Assessments Completed</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="pt-6 sm:pt-0">
            <h3 className="text-3xl md:text-4xl font-bold mb-2">3 min</h3>
            <p className="text-[#D1FAE5] dark:text-[#34D399] font-medium text-sm md:text-base">To Get Your Results</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Sections */}
      <section id="features" className="py-16 md:py-[120px] px-6 max-w-[1200px] mx-auto overflow-hidden bg-white dark:bg-[#07130F]">
        
        {/* Zig-Zag 1: Image Left, Text Right */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-24 md:mb-32"
        >
          <div className="order-2 md:order-1 relative mt-8 md:mt-0">
             <div className="bg-[#F0F7F4] dark:bg-[#0B1B15] border border-transparent dark:border-white/5 rounded-[24px] p-6 md:p-8 aspect-square flex flex-col justify-center gap-4 relative isolate">
                <motion.div 
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-white/80 dark:bg-[#0E261E]/90 backdrop-blur-lg rounded-[24px] p-5 md:p-6 shadow-[0_10px_25px_rgba(0,0,0,0.08)] dark:shadow-xl border border-white/20 dark:border-white/10 translate-x-2 -translate-y-4 md:translate-x-4 md:-translate-y-8 transition-all"
                >
                  <h4 className="font-bold mb-4 dark:text-white">Metabolic Biomarkers</h4>
                  <div className="space-y-4">
                    {[
                      { icon: 'BG', name: 'Fasting Glucose', status: 'Optimal' },
                      { icon: 'BP', name: 'Blood Pressure', status: 'Normal' },
                      { icon: 'BMI', name: 'Body Mass Index', status: 'Healthy' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center pb-4 border-b border-[#E5E7EB] dark:border-white/10 last:border-0 last:pb-0">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-full bg-[#F0F7F4] dark:bg-[#153B2F] flex items-center justify-center shrink-0">
                            <span className="font-semibold text-xs text-[#1A1A1A] dark:text-white">{item.icon}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#1A1A1A] dark:text-white">{item.name}</p>
                            <p className="text-xs text-[#666666] dark:text-gray-400">Monitored</p>
                          </div>
                        </div>
                        <p className="font-semibold text-[#0B4635] dark:text-[#34D399] bg-[#D1FAE5] dark:bg-[#0B4635] px-2 py-1 rounded text-xs ml-2">{item.status}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
             </div>
          </div>
          <div className="order-1 md:order-2 flex flex-col gap-6">
            <div className="w-12 h-12 rounded-full bg-[#D1FAE5] dark:bg-[#0B4635]/50 border border-transparent dark:border-[#34D399]/30 flex items-center justify-center text-[#0B4635] dark:text-[#34D399] mb-2">
              <ActivitySquare className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-[40px] font-bold leading-tight">AI-Powered Health Analysis</h2>
            <p className="text-[#666666] dark:text-gray-400 text-base md:text-lg leading-relaxed">
              Our ML model analyses over 40 biomarkers against massive clinical databases to predict your metabolic risks. Receive your personalised risk score with a tailored action plan.
            </p>
          </div>
        </motion.div>

        {/* Zig-Zag 2: Text Left, Image Right */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-10 md:gap-16 items-center"
        >
          <div className="flex flex-col gap-6">
            <div className="w-12 h-12 rounded-full bg-[#D1FAE5] dark:bg-[#0B4635]/50 border border-transparent dark:border-[#34D399]/30 flex items-center justify-center text-[#0B4635] dark:text-[#34D399] mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-[40px] font-bold leading-tight">Clinical Grade Privacy</h2>
            <p className="text-[#666666] dark:text-gray-400 text-base md:text-lg leading-relaxed">
              Your health data is highly sensitive. We protect all profiles with HIPAA-compliant, end-to-end 256-bit encryption ensuring zero unauthorized access to your physiological data.
            </p>
          </div>
          <div className="relative">
             <div className="bg-[#0B4635] dark:bg-[#0B1B15] border border-transparent dark:border-[#34D399]/20 rounded-[24px] p-6 md:p-8 aspect-[4/3] flex items-center justify-center relative shadow-lg">
                 <motion.div 
                   whileHover={{ y: -5, scale: 1.02 }}
                   className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-[24px] p-6 md:p-8 border border-white/20 dark:border-white/10 w-11/12 md:w-4/5 shadow-2xl transition-transform force-white"
                 >
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 dark:bg-[#34D399]/20 flex items-center justify-center mb-4 md:mb-6">
                       <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-white dark:text-[#34D399]" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2">Privacy Secured</h3>
                    <p className="text-white/80 dark:text-gray-300 text-xs md:text-sm">All medical inputs are anonymized and instantly encrypted upon transmission.</p>
                 </motion.div>
             </div>
          </div>
        </motion.div>

      </section>

      {/* Science Section */}
      <section id="science" className="py-16 md:py-[120px] px-6 max-w-[1200px] mx-auto bg-gray-50 dark:bg-[#0B1B15] rounded-3xl mb-12 md:mb-24 border border-transparent dark:border-white/5">
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#D1FAE5] dark:bg-[#0B4635]/50 border border-transparent dark:border-[#34D399]/30 text-[#0B4635] dark:text-[#34D399] font-semibold text-xs md:text-sm mb-4 md:mb-6">
            Clinical Technology
          </div>
          <h2 className="text-3xl md:text-[40px] font-bold leading-tight mb-4 md:mb-6">The Science Behind DiaGuard</h2>
          <p className="text-[#666666] dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Our platform merges cutting-edge Machine Learning with established clinical heuristics to deliver the most accurate predictive risk modeling available to the public.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-white dark:bg-[#0E261E] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F0F7F4] dark:bg-[#153B2F] flex items-center justify-center text-[#0B4635] dark:text-[#34D399] mb-4 md:mb-6">
              <ActivitySquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-3">Logistic Regression ML</h3>
            <p className="text-[#666666] dark:text-gray-400 text-sm md:text-base leading-relaxed">
              Trained on vast datasets of metabolic profiles, our AI model isolates hidden patterns in your lifestyle and biomarkers to calculate your exact statistical probability of developing diabetes.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-white dark:bg-[#0E261E] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F0F7F4] dark:bg-[#153B2F] flex items-center justify-center text-[#0B4635] dark:text-[#34D399] mb-4 md:mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-3">Clinical Rule-Based Blending</h3>
            <p className="text-[#666666] dark:text-gray-400 text-sm md:text-base leading-relaxed">
              Because AI can occasionally underestimate severe lifestyle extremes, our engine actively blends predictions with verified medical heuristics—ensuring high-risk factors never go unnoticed.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-white dark:bg-[#0E261E] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F0F7F4] dark:bg-[#153B2F] flex items-center justify-center text-[#0B4635] dark:text-[#34D399] mb-4 md:mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-3">Metabolic Digital Twin</h3>
            <p className="text-[#666666] dark:text-gray-400 text-sm md:text-base leading-relaxed">
              We translate abstract data into a live 3D visual map of your body. Watch your simulated organs dynamically respond to predicted complications based on your precise risk scores.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B4635] dark:bg-[#0B1B15] border-t border-transparent dark:border-white/10 pt-12 md:pt-20 pb-10 force-white">
        <div className="max-w-[1200px] mx-auto px-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-12 md:mb-16">
            
            {/* Brand + Newsletter */}
            <div className="md:col-span-5 md:pr-12">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0B4635] font-bold text-xl">D</div>
                <span className="font-bold text-2xl tracking-tight text-white">DiaGuard</span>
              </div>
              <p className="text-[#D1FAE5] dark:text-gray-400 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                Empowering individuals with AI-driven actionable insights to halt complete progression to diabetes.
              </p>
              <div className="flex flex-col sm:flex-row bg-white/10 dark:bg-white/5 p-1.5 rounded-lg focus-within:ring-2 ring-white/50 dark:ring-[#34D399]/50 transition-all gap-2 sm:gap-0">
                <div className="flex items-center pl-3 text-white/50 hidden sm:flex">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-transparent text-white placeholder-white/50 flex-1 px-3 py-3 sm:py-2 outline-none text-center sm:text-left"
                />
                <button className="bg-white dark:bg-[#34D399] text-[#0B4635] dark:text-[#0B1B15] px-6 py-3 sm:py-2 rounded-md font-semibold hover:bg-[#F0F7F4] dark:hover:bg-[#10B981] transition-colors w-full sm:w-auto">
                  Stay Updated
                </button>
              </div>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 pt-2">
              <div>
                <h4 className="font-semibold text-lg mb-4 md:mb-6 text-white">Product</h4>
                <ul className="space-y-3 md:space-y-4 text-[#D1FAE5] dark:text-gray-400 text-sm md:text-base">
                  <li><a href="#" className="hover:text-white dark:hover:text-[#34D399] transition-colors">Take Assessment</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-[#34D399] transition-colors">Our AI Model</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-[#34D399] transition-colors">Clinical Validation</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-4 md:mb-6 text-white">Company</h4>
                <ul className="space-y-3 md:space-y-4 text-[#D1FAE5] dark:text-gray-400 text-sm md:text-base">
                  <li><a href="#" className="hover:text-white dark:hover:text-[#34D399] transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-[#34D399] transition-colors">Medical Board</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-[#34D399] transition-colors">Contact</a></li>
                </ul>
              </div>
              <div className="col-span-2 md:col-span-1">
                <h4 className="font-semibold text-lg mb-4 md:mb-6 text-white">Legal</h4>
                <ul className="space-y-3 md:space-y-4 text-[#D1FAE5] dark:text-gray-400 text-sm md:text-base">
                  <li><a href="#" className="hover:text-white dark:hover:text-[#34D399] transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-[#34D399] transition-colors">HIPAA Notice</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-[#34D399] transition-colors">Terms of Use</a></li>
                </ul>
              </div>
            </div>

          </div>
          
          <div className="pt-8 border-t border-white/20 text-center text-[#D1FAE5] dark:text-gray-400 text-xs md:text-sm">
            &copy; {new Date().getFullYear()} DiaGuard. All rights reserved. Not intended as a substitute for professional medical advice.
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {videoOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setVideoOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white dark:bg-[#0E261E] border border-transparent dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 mx-4"
              role="dialog"
              aria-modal="true"
            >
              <button 
                onClick={() => setVideoOpen(false)}
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black rounded-full p-2 z-20 transition-colors"
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <div className="aspect-video bg-black flex items-center justify-center">
                <p className="text-white/70">Informational Video Placeholder</p>
                {/* <iframe className="w-full h-full" src="https://www.youtube.com/embed/..." allowFullScreen /> */}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
};

export default HeroSection;
