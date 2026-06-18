import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, User, LogOut, Plus, Calendar, TrendingDown, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import {
  getCurrentUser,
  signOut
} from '@/services/authService';
import {
  getAssessments,
  getLatestAssessment,
  getAssessmentsCount,
  ASSESSMENTS_PAGE_SIZE
} from '@/services/assessmentHistoryService';
import type { AssessmentRecord } from '@/lib/supabase';
import { Button } from '../components/ui/button';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [latestAssessment, setLatestAssessment] = useState<AssessmentRecord | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [page]);

  async function loadUserData() {
    setLoading(true);
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      navigate('/login');
      return;
    }

    setUser(currentUser);

    // Load latest assessment for summary card
    const { data: latest } = await getLatestAssessment(currentUser.id);
    setLatestAssessment(latest);

    // Load assessment history (paginated)
    const { data: history } = await getAssessments(currentUser.id, page);
    setAssessments(history);

    // Load total count for pagination
    const { count } = await getAssessmentsCount(currentUser.id);
    setTotal(count);

    setLoading(false);
  }

  async function handleLogout() {
    const result = await signOut();
    if (result.success) {
      navigate('/login');
    }
  }

  // Helper to map risk stage to badge color
  function getRiskStageBadge(stage: string) {
    const stageMap: Record<string, { color: string; bg: string }> = {
      'Normal': { color: 'text-green-700', bg: 'bg-green-100' },
      'Pre-diabetic': { color: 'text-yellow-700', bg: 'bg-yellow-100' },
      'High Risk': { color: 'text-red-700', bg: 'bg-red-100' },
      'High-Risk': { color: 'text-red-700', bg: 'bg-red-100' },
    };
    return stageMap[stage] || { color: 'text-gray-700', bg: 'bg-gray-100' };
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const totalPages = Math.ceil(total / ASSESSMENTS_PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-900 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                DiaGuard AI
              </span>
            </Link>
            <nav className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Dashboard</h1>
          <p className="text-gray-600">Track your diabetes risk assessments and monitor your progress over time.</p>
        </div>

        {/* Latest Assessment Summary */}
        {latestAssessment ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Latest Assessment</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(latestAssessment.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-4xl font-bold text-blue-600 mb-1">{latestAssessment.risk_score}%</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskStageBadge(latestAssessment.risk_stage).bg} ${getRiskStageBadge(latestAssessment.risk_stage).color}`}>
                    {latestAssessment.risk_stage}
                  </span>
                </div>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 text-blue-800">
              <AlertCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold">No assessments yet</p>
                <p className="text-sm text-blue-700">Start your first free risk assessment to see your results here.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Start New Assessment Button */}
        <div className="mb-8">
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Start New Assessment
          </Button>
        </div>

        {/* Assessment History */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Assessment History</h2>
            <span className="text-sm text-gray-500">({total} total)</span>
          </div>

          {assessments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No assessment history yet</p>
              <p className="text-sm text-gray-500">Your completed assessments will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Risk Score</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <AnimatePresence>
                      {assessments.map((assessment, index) => (
                        <motion.tr
                          key={assessment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(assessment.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold text-blue-600">{assessment.risk_score}%</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskStageBadge(assessment.risk_stage).bg} ${getRiskStageBadge(assessment.risk_stage).color}`}>
                              {assessment.risk_stage}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {index < assessments.length - 1 ? (
                              assessments[index + 1].risk_score > assessment.risk_score ? (
                                <span className="flex items-center gap-1 text-green-600 font-semibold">
                                  <TrendingDown className="w-4 h-4" />
                                  Improved
                                </span>
                              ) : assessments[index + 1].risk_score < assessment.risk_score ? (
                                <span className="flex items-center gap-1 text-red-600 font-semibold">
                                  <TrendingUp className="w-4 h-4" />
                                  Increased
                                </span>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
                  <div className="text-sm text-gray-700">
                    Showing page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
