<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> a3a9ef4 (Still working)
import { ThreeScene } from './components/ThreeScene';
import { UIOverlay } from './components/UIOverlay';
import { LoadingScreen } from './components/LoadingScreen';
import { HealthInputForm } from './components/HealthInputForm';
import { Dashboard } from './components/Dashboard';
<<<<<<< HEAD
import { AnimatePresence } from 'motion/react';
=======
import { HowItWorksModal } from './components/HowItWorksModal';
import { AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
>>>>>>> a3a9ef4 (Still working)

export default function App() {
  const [currentZone, setCurrentZone] = useState<string | null>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
<<<<<<< HEAD
=======
  const [showHowItWorks, setShowHowItWorks] = useState(false);
>>>>>>> a3a9ef4 (Still working)
  const [healthData, setHealthData] = useState<any>(null);
  const [riskScore, setRiskScore] = useState(0);
  const [riskStage, setRiskStage] = useState<'Normal' | 'Pre-diabetic' | 'High Risk'>('Normal');

  const handleZoneChange = (zone: string | null) => {
    setCurrentZone(zone);
  };

  const handleNavigate = (zone: string) => {
    setCurrentZone(zone);
  };

  const handleOpenForm = () => {
    setShowHealthForm(true);
  };

  const handleCloseForm = () => {
    setShowHealthForm(false);
  };

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data);
    
    // Enhanced risk calculation based on submitted data
    let calculatedScore = 0;
    
    // Age factor (0-15 points)
    if (data.age > 65) calculatedScore += 15;
    else if (data.age > 55) calculatedScore += 12;
    else if (data.age > 45) calculatedScore += 8;
    else if (data.age > 35) calculatedScore += 4;
    
    // BMI factor (0-20 points)
    if (data.bmi > 35) calculatedScore += 20;
    else if (data.bmi > 30) calculatedScore += 15;
    else if (data.bmi > 25) calculatedScore += 10;
    else if (data.bmi < 18.5) calculatedScore += 5;
    
    // Fasting glucose factor (0-30 points) - Most important
    if (data.fastingGlucose > 126) calculatedScore += 30;
    else if (data.fastingGlucose > 100) calculatedScore += 20;
    else if (data.fastingGlucose > 90) calculatedScore += 10;
    else if (data.fastingGlucose < 70) calculatedScore += 5;
    
    // Blood pressure factor (0-15 points)
    if (data.systolicBP > 140) calculatedScore += 15;
    else if (data.systolicBP > 130) calculatedScore += 10;
    else if (data.systolicBP > 120) calculatedScore += 5;
    
    // Physical activity factor (0-10 points)
    if (data.physicalActivity === 'low') calculatedScore += 10;
    else if (data.physicalActivity === 'medium') calculatedScore += 3;
    
    // Sleep factor (0-5 points)
    if (data.sleepHours < 6) calculatedScore += 5;
    else if (data.sleepHours < 7) calculatedScore += 3;
    
    // Stress factor (0-5 points)
    // Convert stress level to numeric for calculation
    const stressValue = data.stressLevel === 'high' ? 8 : data.stressLevel === 'medium' ? 5 : 2;
    if (stressValue > 7) calculatedScore += 5;
    else if (stressValue > 5) calculatedScore += 3;
    
    // Cap at 100
    calculatedScore = Math.min(calculatedScore, 100);
    
    // Determine risk stage
    let stage: 'Normal' | 'Pre-diabetic' | 'High Risk';
    if (calculatedScore < 30) stage = 'Normal';
    else if (calculatedScore < 60) stage = 'Pre-diabetic';
    else stage = 'High Risk';
    
    setHealthData(data);
    setRiskScore(calculatedScore);
    setRiskStage(stage);
    setShowHealthForm(false);
    setShowDashboard(true);
  };

  const handleCloseDashboard = () => {
    setShowDashboard(false);
  };

  // Simulate loading time for 3D scene
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showHealthForm ? (
        // Full-screen form experience
        <AnimatePresence mode="wait">
          <HealthInputForm onSubmit={handleFormSubmit} />
        </AnimatePresence>
      ) : (
        // Main 3D landing page
        <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
          <AnimatePresence>
            {isLoading && <LoadingScreen />}
          </AnimatePresence>

          {/* 3D Scene */}
          <ThreeScene currentZone={currentZone} onZoneChange={handleZoneChange} />
          
          {/* 2D UI Overlay */}
<<<<<<< HEAD
          <UIOverlay currentZone={currentZone} onNavigate={handleNavigate} onOpenForm={handleOpenForm} />
=======
          <UIOverlay 
            currentZone={currentZone} 
            onNavigate={handleNavigate} 
            onOpenForm={handleOpenForm}
            onOpenHowItWorks={() => setShowHowItWorks(true)}
          />

          {/* How It Works Modal */}
          <HowItWorksModal 
            open={showHowItWorks} 
            onOpenChange={setShowHowItWorks}
          />
>>>>>>> a3a9ef4 (Still working)

          {/* Dashboard */}
          <AnimatePresence>
            {showDashboard && healthData && (
              <Dashboard 
                onClose={handleCloseDashboard} 
                healthData={healthData}
                riskScore={riskScore}
                riskStage={riskStage}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}