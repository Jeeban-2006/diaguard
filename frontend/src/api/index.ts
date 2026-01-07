export * from './supabase';

export async function explainRisk(data: {
  age: number;
  gender: string;
  bmi: number;
  glucose_mg_dl: number;
  systolic_bp: number;
  diastolic_bp: number;
  exercise_minutes_per_week: number;
  sleep_hours_per_night: number;
  stress_level: number;
}) {
  const response = await fetch('/api/explain-risk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}