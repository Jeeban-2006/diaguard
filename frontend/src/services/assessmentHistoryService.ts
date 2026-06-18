import { supabase } from '@/lib/supabase';
import type { AssessmentRecord } from '@/lib/supabase';

const TABLE = 'assessments';
const PAGE_SIZE = 10;

/**
 * SAVE ASSESSMENT (FINAL FIXED VERSION)
 */
export async function saveAssessment(
  result: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // ✅ Get logged-in user directly
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("AUTH USER:", user);
    console.log("RESULT:", result);

    if (userError || !user) {
      console.error("User not found", userError);
      return { success: false, error: "User not logged in" };
    }

    // Normalize score for both decimal (0.3) and percent (30) payloads.
    const rawScore = result?.risk_score ?? result?.data?.risk_score ?? 0;
    const numericRaw = Number(rawScore);
    const normalizedScore = Number.isFinite(numericRaw)
      ? (numericRaw <= 1 ? numericRaw * 100 : numericRaw)
      : 0;
    const safeScore = Math.max(0, Math.min(100, Math.round(normalizedScore)));

    console.log("RAW SCORE:", rawScore);
    console.log("SAFE SCORE:", safeScore);

    const { data, error } = await supabase.from(TABLE).insert([
      {
        user_id: user.id,

        risk_score: safeScore,
        risk_stage: result?.risk_stage ?? "unknown",

        // ✅ FIX TREND (array → string)
        trend: JSON.stringify(result?.trend ?? []),

        // ✅ SAFE DEFAULTS
        kidney_risk: result?.complication_risk?.kidney ?? 0,
        eye_risk: result?.complication_risk?.eye ?? 0,
        nerve_risk: result?.complication_risk?.nerve ?? 0,
        cardio_risk: result?.complication_risk?.cardio ?? 0,

        top_factors: result?.top_factors ?? {},
        recommendations: result?.recommendations ?? [],
      },
    ]);

    console.log("INSERT DATA:", data);
    console.log("INSERT ERROR:", error);

    if (error) {
      console.error("Insert failed:", error.message);
      return { success: false, error: error.message };
    }

    console.log("✅ DATA INSERTED SUCCESSFULLY");
    return { success: true };

  } catch (err: any) {
    console.error("Unexpected error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * GET ASSESSMENTS (HISTORY)
 */
export async function getAssessments(
  userId: string,
  page: number
): Promise<{ data: AssessmentRecord[]; error?: string }> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return { data: [], error: error.message };

  // ✅ Filter out records with null risk_score (invalid/incomplete records)
  const validHistory = (data ?? []).filter(item => item.risk_score !== null);

  return { data: validHistory as AssessmentRecord[] };
}

/**
 * COUNT TOTAL RECORDS
 */
export async function getAssessmentsCount(
  userId: string
): Promise<{ count: number; error?: string }> {
  const { count, error } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) return { count: 0, error: error.message };

  return { count: count ?? 0 };
}

/**
 * GET LATEST VALID ASSESSMENT
 */
export async function getLatestAssessment(
  userId: string
): Promise<{ data: AssessmentRecord | null; error?: string }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) return { data: null, error: error.message };

  // ✅ Filter to ensure we have a valid record with risk_score
  const validHistory = (data ?? []).filter(item => item.risk_score !== null);
  const latest = validHistory[0] || null;

  return { data: latest as AssessmentRecord | null };
}

export const ASSESSMENTS_PAGE_SIZE = PAGE_SIZE;