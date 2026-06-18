import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';
import { X, Activity } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  mode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ open, mode: initialMode = 'login', onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  const handleSwitchMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
  };

  const handleSignupSuccess = () => {
    // Switch to login after successful signup
    setMode('login');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 sm:p-6" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-[24px] shadow-2xl w-full max-w-[900px] overflow-hidden flex flex-col md:flex-row relative"
              style={{ minHeight: '600px' }}
            >
              {/* Close Button overlay */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors md:text-white md:bg-white/10 md:hover:bg-white/20"
              >
                <X size={20} className="md:text-[#0B4635]" />
              </button>

              {/* Left Column (Forms) */}
              <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
                 {/* Top Logo (Mobile) */}
                 <div className="md:hidden flex items-center gap-2 mb-8">
                     <div className="w-8 h-8 rounded-full bg-[#0B4635] flex items-center justify-center text-white font-bold">D</div>
                     <span className="font-bold text-xl text-[#1A1A1A]">DiaGuard</span>
                 </div>

                 <motion.div 
                   className="mb-8"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ duration: 0.3 }}
                 >
                    <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                      {mode === 'login' ? 'Welcome back!' : 'Create an account'}
                    </h2>
                    <p className="text-[#666666] text-sm">
                      {mode === 'login' 
                        ? 'Access your health dashboard and AI insights. Let\'s keep you healthy.' 
                        : 'Start your proactive health journey with DiaGuard AI.'}
                    </p>
                 </motion.div>

                <div className="w-full max-w-[360px] mx-auto md:mx-0">
                  <AnimatePresence mode="wait">
                    {mode === 'login' ? (
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <LoginForm onSuccess={onSuccess} onSwitchToSignup={handleSwitchMode} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="signup"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SignupForm onSuccess={handleSignupSuccess} onSwitchToLogin={handleSwitchMode} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column (Illustration/Branding) */}
              <div className="hidden md:flex flex-1 p-8 bg-white basis-[45%]">
                <div className="w-full h-full bg-[#F0F7F4] rounded-[32px] overflow-hidden flex flex-col relative">
                   {/* Logo / Brand Watermark */}
                   <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
                     <div className="w-8 h-8 rounded-full bg-[#0B4635] flex items-center justify-center text-white font-bold">D</div>
                     <span className="font-bold text-xl tracking-tight text-[#0B4635]">DiaGuard</span>
                   </div>

                   {/* Illustration Area */}
                   <div className="flex-1 flex flex-col items-center justify-center p-8 relative isolate">
                      {/* Decorative elements */}
                      <div className="absolute top-1/4 right-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-10 animate-bounce" style={{ animationDuration: '3s' }}>
                         <Activity className="text-[#0B4635]" size={20} />
                      </div>
                      <div className="absolute bottom-1/3 left-10 bg-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between gap-4 z-10 w-48">
                         <div>
                            <p className="text-xs font-semibold text-[#1A1A1A]">Risk Score</p>
                            <p className="text-[10px] text-[#666666]">Optimal Level</p>
                         </div>
                         <div className="w-8 h-8 rounded-full border-4 border-[#D1FAE5] border-t-[#0B4635] flex items-center justify-center text-[10px] font-bold">94%</div>
                      </div>

                      <img 
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600" 
                        alt="Health monitoring" 
                        className="w-4/5 object-cover rounded-[24px] shadow-2xl z-0"
                      />
                   </div>

                   {/* Bottom Text Area */}
                   <motion.div 
                     className="p-8 pb-12 text-center relative z-10"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ duration: 0.3, delay: 0.1 }}
                   >
                      <div className="flex gap-2 justify-center mb-6">
                         <div className="w-2 h-2 rounded-full bg-[#0B4635]"></div>
                         <div className="w-2 h-2 rounded-full bg-[#0B4635]/20"></div>
                         <div className="w-2 h-2 rounded-full bg-[#0B4635]/20"></div>
                      </div>
                      <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2 leading-tight">
                        Make your health monitoring <br/> easier with <span className="text-[#0B4635]">DiaGuard AI</span>
                      </h3>
                   </motion.div>
                </div>
              </div>
              
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}