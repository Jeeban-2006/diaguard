<<<<<<< HEAD
import { Activity, Brain, Heart, MapPin, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
=======
import React, { useState } from 'react';
import { Activity, Brain, Heart, MapPin, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AuthModal from './AuthModal';
import FeatureCards from './FeatureCards';
>>>>>>> a3a9ef4 (Still working)

interface UIOverlayProps {
  currentZone: string | null;
  onNavigate: (zone: string) => void;
  onOpenForm: () => void;
<<<<<<< HEAD
}

export function UIOverlay({ currentZone, onNavigate, onOpenForm }: UIOverlayProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [minimapVisible, setMinimapVisible] = useState(true);
=======
  onOpenHowItWorks: () => void;
}

export function UIOverlay({ currentZone, onNavigate, onOpenForm, onOpenHowItWorks }: UIOverlayProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [minimapVisible, setMinimapVisible] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
>>>>>>> a3a9ef4 (Still working)

  return (
    <>
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 p-6 bg-gradient-to-b from-white/90 to-transparent backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              DiaGuard AI
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <NavButton label="Hero" zone="hero" currentZone={currentZone} onNavigate={onNavigate} />
            <NavButton label="Features" zone="features" currentZone={currentZone} onNavigate={onNavigate} />
<<<<<<< HEAD
            <NavButton label="How It Works" zone="how-it-works" currentZone={currentZone} onNavigate={onNavigate} />
=======
            <button
              onClick={onOpenHowItWorks}
              className="px-4 py-2 rounded-lg transition-all hover:bg-gray-100 text-gray-700"
            >
              How It Works
            </button>
            <button
              onClick={() => { setAuthMode('login'); setAuthOpen(true); }}
              className="px-4 py-2 rounded-lg transition-all hover:bg-gray-100 text-gray-700"
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setAuthOpen(true); }}
              className="px-4 py-2 rounded-lg transition-all bg-gradient-to-r from-blue-600 to-green-600 text-white"
            >
              Sign Up
            </button>
>>>>>>> a3a9ef4 (Still working)
            <NavButton label="Get Started" zone="cta" currentZone={currentZone} onNavigate={onNavigate} primary />
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/50 backdrop-blur-sm"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 p-4 bg-white/90 backdrop-blur-md rounded-2xl"
            >
              <div className="flex flex-col gap-2">
                <MobileNavButton label="Hero" zone="hero" onNavigate={onNavigate} setMenuOpen={setMenuOpen} />
                <MobileNavButton label="Features" zone="features" onNavigate={onNavigate} setMenuOpen={setMenuOpen} />
<<<<<<< HEAD
                <MobileNavButton label="How It Works" zone="how-it-works" onNavigate={onNavigate} setMenuOpen={setMenuOpen} />
=======
                <button
                  onClick={() => {
                    onOpenHowItWorks();
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-lg text-left transition-all hover:bg-gray-100 text-gray-700"
                >
                  How It Works
                </button>
>>>>>>> a3a9ef4 (Still working)
                <MobileNavButton label="Get Started" zone="cta" onNavigate={onNavigate} setMenuOpen={setMenuOpen} primary />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Zone Content */}
      <AnimatePresence mode="wait">
        {currentZone === 'hero' && <HeroContent onNavigate={onNavigate} />}
<<<<<<< HEAD
        {currentZone?.startsWith('feature-') && <FeatureContent zone={currentZone} />}
        {currentZone?.startsWith('step-') && <StepContent zone={currentZone} />}
=======
        {currentZone === 'features' && <FeatureCards />}
        {currentZone?.startsWith('feature-') && <FeatureContent zone={currentZone} />}
>>>>>>> a3a9ef4 (Still working)
        {currentZone === 'cta' && <CTAContent onOpenForm={onOpenForm} />}
      </AnimatePresence>

      {/* Minimap */}
      <AnimatePresence>
        {minimapVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Navigation</span>
                <button
                  onClick={() => setMinimapVisible(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative w-48 h-48 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-2">
                <MinimapDot position="center" label="Hero" active={currentZone === 'hero'} onClick={() => onNavigate('hero')} />
                <MinimapDot position="top" label="Features" active={currentZone?.includes('feature')} onClick={() => onNavigate('features')} />
                <MinimapDot position="bottom" label="Steps" active={currentZone?.includes('step')} onClick={() => onNavigate('how-it-works')} />
                <MinimapDot position="right" label="CTA" active={currentZone === 'cta'} onClick={() => onNavigate('cta')} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip for interactions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-6 left-6 z-40 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl max-w-xs"
      >
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Explore the Environment</p>
            <p className="text-xs text-gray-600 mt-1">
              Click on objects to navigate • Drag to rotate • Scroll to zoom
            </p>
          </div>
        </div>
      </motion.div>

      {/* Reopen minimap button */}
      {!minimapVisible && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setMinimapVisible(true)}
          className="fixed bottom-6 right-6 z-40 p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-colors"
        >
          <MapPin className="w-6 h-6" />
        </motion.button>
      )}
    </>
  );
}

function NavButton({ 
  label, 
  zone, 
  currentZone, 
  onNavigate, 
  primary 
}: { 
  label: string; 
  zone: string; 
  currentZone: string | null; 
  onNavigate: (zone: string) => void;
  primary?: boolean;
}) {
  const isActive = currentZone === zone || currentZone?.includes(zone);
  
  return (
    <button
      onClick={() => onNavigate(zone)}
      className={`
        px-4 py-2 rounded-lg transition-all
        ${primary 
          ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:shadow-lg' 
          : isActive 
            ? 'bg-blue-100 text-blue-700' 
            : 'hover:bg-gray-100 text-gray-700'
        }
      `}
    >
      {label}
    </button>
  );
}

function MobileNavButton({ 
  label, 
  zone, 
  onNavigate, 
  setMenuOpen,
  primary 
}: { 
  label: string; 
  zone: string; 
  onNavigate: (zone: string) => void;
  setMenuOpen: (open: boolean) => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={() => {
        onNavigate(zone);
        setMenuOpen(false);
      }}
      className={`
        w-full px-4 py-3 rounded-lg text-left transition-all
        ${primary 
          ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white' 
          : 'hover:bg-gray-100 text-gray-700'
        }
      `}
    >
      {label}
    </button>
  );
}

function HeroContent({ onNavigate }: { onNavigate: (zone: string) => void }) {
  return (
    <motion.div
      key="hero"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none"
    >
      <div className="max-w-2xl mx-auto text-center px-6 pointer-events-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl"
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            AI-Powered Diabetes Prevention
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Take control of your health with intelligent risk assessment and personalized lifestyle recommendations.
          </p>
          <button
            onClick={() => onNavigate('cta')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
          >
            Check Your Diabetes Risk
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FeatureContent({ zone }: { zone: string }) {
  const features: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
    'feature-risk-prediction': {
      title: 'Risk Prediction',
      description: 'Advanced machine learning algorithms analyze your health data to provide accurate diabetes risk assessments.',
      icon: <Activity className="w-12 h-12 text-blue-600" />
    },
    'feature-lifestyle-recommendations': {
      title: 'Lifestyle Recommendations',
      description: 'Receive personalized diet, exercise, and lifestyle suggestions tailored to your unique health profile.',
      icon: <Heart className="w-12 h-12 text-green-600" />
    },
    'feature-explainable-ai': {
      title: 'Explainable AI',
      description: 'Understand the reasoning behind every prediction with transparent, interpretable AI insights.',
      icon: <Brain className="w-12 h-12 text-purple-600" />
    }
  };

  const feature = features[zone];
  if (!feature) return null;

  return (
    <motion.div
      key={zone}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl max-w-md pointer-events-auto">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">{feature.icon}</div>
          <h3 className="text-3xl font-bold mb-4 text-gray-900">{feature.title}</h3>
          <p className="text-gray-700 leading-relaxed">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

<<<<<<< HEAD
function StepContent({ zone }: { zone: string }) {
  const steps: Record<string, { title: string; description: string }> = {
    'step-1': {
      title: 'Step 1: Input Your Data',
      description: 'Share your health metrics, lifestyle habits, and medical history through our secure platform.'
    },
    'step-2': {
      title: 'Step 2: AI Analysis',
      description: 'Our advanced algorithms process your data to identify risk factors and patterns.'
    },
    'step-3': {
      title: 'Step 3: Get Your Results',
      description: 'Receive a comprehensive risk assessment with actionable recommendations for prevention.'
    }
  };

  const step = steps[zone];
  if (!step) return null;

  return (
    <motion.div
      key={zone}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.5 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl max-w-md pointer-events-auto">
        <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          {step.title}
        </h3>
        <p className="text-gray-700 text-lg leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}

=======
>>>>>>> a3a9ef4 (Still working)
function CTAContent({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <motion.div
      key="cta"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
    >
      <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl p-10 shadow-2xl max-w-lg pointer-events-auto">
        <h3 className="text-4xl font-bold mb-6 text-white">Ready to Take Control?</h3>
        <p className="text-white/90 text-lg mb-8">
          Join thousands of users who are proactively managing their diabetes risk with DiaGuard AI.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 px-6 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105" onClick={onOpenForm}>
            Start Free Trial
          </button>
          <button className="flex-1 px-6 py-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all backdrop-blur-sm">
            Learn More
          </button>
        </div>
        <p className="text-white/70 text-sm mt-6 text-center">
          No credit card required • HIPAA compliant • Cancel anytime
        </p>
      </div>
    </motion.div>
  );
}

function MinimapDot({ 
  position, 
  label, 
  active, 
  onClick 
}: { 
  position: 'center' | 'top' | 'bottom' | 'right'; 
  label: string; 
  active?: boolean;
  onClick: () => void;
}) {
  const positions = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    top: 'top-4 left-1/2 -translate-x-1/2',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2',
    right: 'top-1/2 right-4 -translate-y-1/2'
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      className={`absolute ${positions[position]} group`}
    >
      <div className={`
        w-3 h-3 rounded-full transition-all
        ${active ? 'bg-blue-600 ring-4 ring-blue-200' : 'bg-gray-400 hover:bg-gray-600'}
      `} />
      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-2 py-1 rounded">
        {label}
      </span>
    </motion.button>
  );
}