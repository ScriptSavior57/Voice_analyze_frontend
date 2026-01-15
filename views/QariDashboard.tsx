/**
 * Qari Dashboard - View students, scores, and progress.
 */
import React, { useEffect, useState } from "react";
import { getQariStudents, getQariContent, getQariCommissionStats } from "../services/platformService";
import { StudentInfo, QariContent } from "../services/platformService";
import { Users, TrendingUp, TrendingDown, BookOpen, BarChart3, DollarSign, Copy, Check } from "lucide-react";

const QariDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [content, setContent] = useState<QariContent[]>([]);
  const [commissionStats, setCommissionStats] = useState<{
    active_students: number;
    referral_code: string;
    commission_rate: number;
    referral_breakdown: Array<{ code: string; count: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [studentsData, contentData, commissionData] = await Promise.all([
        getQariStudents(),
        getQariContent(),
        getQariCommissionStats().catch(() => null), // Optional, don't fail if not available
      ]);
      setStudents(studentsData.students);
      setContent(contentData.content);
      if (commissionData) {
        setCommissionStats(commissionData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (commissionStats?.referral_code) {
      navigator.clipboard.writeText(commissionStats.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Qari Dashboard</h1>
        <p className="text-gray-600">Manage your students and content library</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-800">{students.length}</p>
            </div>
            <Users className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Content Library</p>
              <p className="text-3xl font-bold text-gray-800">{content.length}</p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Score</p>
              <p className="text-3xl font-bold text-gray-800">
                {students.length > 0
                  ? Math.round(
                      students.reduce((sum, s) => sum + (s.latest_score || 0), 0) /
                        students.length
                    )
                  : 0}
                %
              </p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        {commissionStats && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commission Rate</p>
                <p className="text-3xl font-bold text-gray-800">
                  {commissionStats.commission_rate}%
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-amber-500" />
            </div>
          </div>
        )}
      </div>

      {/* Referral Code Section */}
      {commissionStats && commissionStats.referral_code && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Referral Code</h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white rounded-lg px-4 py-3 border border-gray-200">
              <code className="text-2xl font-mono font-bold text-gray-800">
                {commissionStats.referral_code}
              </code>
            </div>
            <button
              onClick={copyReferralCode}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Share this code with students to track referrals. You'll earn {commissionStats.commission_rate}% commission on their subscriptions.
          </p>
          {commissionStats.referral_breakdown.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Referral Breakdown:</p>
              <div className="flex flex-wrap gap-2">
                {commissionStats.referral_breakdown.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200"
                  >
                    {item.code}: {item.count} student{item.count > 1 ? "s" : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">My Students</h2>
        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No students yet.</p>
            <p className="text-sm mt-2">Students will appear here when they select you as their Qari.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student.student_id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {student.student_name || student.student_email}
                    </h3>
                    <p className="text-sm text-gray-600">{student.student_email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Joined: {new Date(student.joined_at).toLocaleDateString()}</span>
                      <span>Last Active: {new Date(student.last_active).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {student.latest_score !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-800">
                          {Math.round(student.latest_score)}%
                        </span>
                        {student.improvement !== undefined && student.improvement > 0 && (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        )}
                        {student.improvement !== undefined && student.improvement < 0 && (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                    {student.statistics && (
                      <div className="text-sm text-gray-600 mt-1">
                        {student.statistics.total_sessions} sessions
                      </div>
                    )}
                  </div>
                </div>
                {student.statistics && (
                  <>
                    {student.statistics.improvement_trend && student.statistics.improvement_trend.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-2">Improvement Trend (Last 10 Sessions):</p>
                        <div className="flex items-end gap-1 h-12">
                          {student.statistics.improvement_trend.slice(-10).map((improvement, idx) => (
                            <div
                              key={idx}
                              className="flex-1 bg-green-100 rounded-t flex items-end justify-center"
                              style={{
                                height: `${Math.max(10, Math.abs(improvement) * 2)}%`,
                                backgroundColor: improvement > 0 ? '#dcfce7' : improvement < 0 ? '#fee2e2' : '#f3f4f6'
                              }}
                              title={`${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`}
                            >
                              <div className="w-full h-full rounded-t" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {student.statistics.weakest_verses.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-1">Weakest Verses:</p>
                        <div className="flex flex-wrap gap-2">
                          {student.statistics.weakest_verses.slice(0, 3).map((verse, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded"
                              title={verse.text}
                            >
                              {verse.text.length > 30 ? `${verse.text.substring(0, 30)}...` : verse.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Library */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">My Content Library</h2>
        {content.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No content yet.</p>
            <p className="text-sm mt-2">Add reference audios to your library to share with students.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-800 mb-1">
                  {item.reference_title || "Untitled"}
                </h3>
                {item.surah_name && (
                  <p className="text-sm text-gray-600">
                    {item.surah_name}
                    {item.ayah_number && ` - Ayah ${item.ayah_number}`}
                  </p>
                )}
                {item.maqam && (
                  <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {item.maqam}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QariDashboard;
