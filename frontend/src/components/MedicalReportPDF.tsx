import React from 'react';
import type { HealthData } from '@/app/DiaGuardApp';
import { Activity, User, Heart, Brain, Dumbbell, Scale, Moon } from 'lucide-react';

interface MedicalReportPDFProps {
  healthData: HealthData;
  riskScore: number;
  riskStage: string;
  profile: { name: string; email: string } | null;
  date: string;
}

export const MedicalReportPDF = React.forwardRef<HTMLDivElement, MedicalReportPDFProps>(
  ({ healthData, riskScore, riskStage, profile, date }, ref) => {
    
    return (
      <div 
        ref={ref} 
        style={{ width: '800px', minHeight: '1131px', fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', color: '#000000', padding: '3rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #16a34a', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.25rem', backgroundColor: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 'bold', fontSize: '1.25rem' }}>D</div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>DiaGuard Clinical Report</h1>
            </div>
            <p style={{ color: '#6b7280', fontWeight: 500, margin: 0 }}>Metabolic Health & Diabetes Risk Assessment</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Date of Assessment</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{date}</p>
          </div>
        </div>

        {/* Patient Info */}
        <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
           <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', backgroundColor: '#dcfce3', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <User size={32} />
           </div>
           <div>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem', marginTop: 0 }}>{profile?.full_name || 'Anonymous Patient'}</h2>
             <p style={{ color: '#6b7280', margin: 0 }}>{profile?.email || 'No email provided'}</p>
           </div>
           <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
             <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Age / Gender</p>
             <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{healthData.age} yrs / <span style={{ textTransform: 'capitalize' }}>{healthData.gender}</span></p>
           </div>
        </div>

        {/* Risk Assessment Result */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', backgroundColor: '#ffffff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem', marginTop: 0 }}>Overall Risk Score</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{Math.round(riskScore)}</span>
              <span style={{ fontSize: '1.25rem', color: '#6b7280', fontWeight: 500, paddingBottom: '0.25rem' }}>/ 100</span>
            </div>
            <div style={{ 
                   display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold', marginTop: '0.5rem',
                   backgroundColor: riskStage === 'high-risk' ? '#fee2e2' : riskStage === 'pre-diabetic' ? '#fef3c7' : '#dcfce3',
                   color: riskStage === 'high-risk' ? '#b91c1c' : riskStage === 'pre-diabetic' ? '#b45309' : '#15803d'
                 }}>
              {riskStage.toUpperCase().replace('-', ' ')}
            </div>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', backgroundColor: '#ffffff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem', marginTop: 0 }}>Key Clinical Markers</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, margin: 0 }}>BMI</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{healthData.bmi}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, margin: 0 }}>Fasting Glucose</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{healthData.fastingGlucose} mg/dL</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, margin: 0 }}>Blood Pressure</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{healthData.systolicBP}/{healthData.diastolicBP}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lifestyle Factors */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', borderBottom: '2px solid #1f2937', paddingBottom: '0.5rem', marginTop: 0 }}>Lifestyle Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
             <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#2563eb' }}>
                  <Moon size={18} />
                  <span style={{ fontWeight: 'bold' }}>Sleep</span>
                </div>
                <p style={{ color: '#1f2937', fontWeight: 600, margin: 0 }}>{healthData.sleepHours} Hours/night</p>
             </div>
             <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#f97316' }}>
                  <Dumbbell size={18} />
                  <span style={{ fontWeight: 'bold' }}>Activity</span>
                </div>
                <p style={{ color: '#1f2937', fontWeight: 600, textTransform: 'capitalize', margin: 0 }}>{healthData.physicalActivity}</p>
             </div>
             <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#9333ea' }}>
                  <Brain size={18} />
                  <span style={{ fontWeight: 'bold' }}>Stress</span>
                </div>
                <p style={{ color: '#1f2937', fontWeight: 600, textTransform: 'capitalize', margin: 0 }}>Level {healthData.stressLevel}/10</p>
             </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>This report was generated by DiaGuard AI and is intended for informational purposes only.</p>
          <p style={{ margin: 0 }}>It does not substitute professional medical advice, diagnosis, or treatment.</p>
        </div>
      </div>
    );
  }
);
