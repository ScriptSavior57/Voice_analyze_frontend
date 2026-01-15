/**
 * Student Progress View - View practice history and statistics.
 */
import React, { useEffect, useState } from "react";
import { getStudentProgress, getStudentStatistics } from "../services/platformService";
import { StudentProgress, StudentStatistics } from "../services/platformService";
import { BarChart3, TrendingUp, TrendingDown, Clock, Target } from "lucide-react";

const StudentProgressView: React.FC = () => {
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [statistics, setStatistics] = useState<StudentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const [progressData, statsData] = await Promise.all([
        getStudentProgress(50),
        getStudentStatistics(),
      ]);
      setProgress(progressData.progress);
      setStatistics(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load progress");
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Progress</h1>
        <p className="text-gray-600">Track your improvement and practice history</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-800">
                  {statistics.total_sessions}
                </p>
              </div>
              <Clock className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-800">
                  {Math.round(statistics.average_score)}%
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Best Score</p>
                <p className="text-3xl font-bold text-gray-800">
                  {Math.round(statistics.best_score)}%
                </p>
              </div>
              <Target className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Latest Score</p>
                <p className="text-3xl font-bold text-gray-800">
                  {Math.round(statistics.latest_score)}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-amber-500" />
            </div>
          </div>
        </div>
      )}

      {/* Weakest Verses */}
      {statistics && statistics.weakest_verses.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Verses Needing Practice
          </h2>
          <div className="space-y-2">
            {statistics.weakest_verses.map((verse, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
              >
                <span className="text-gray-800">{verse.text}</span>
                <span className="text-sm text-amber-700 font-medium">
                  Appears {verse.frequency} time{verse.frequency > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Practice History</h2>
        {progress.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No practice sessions yet.</p>
            <p className="text-sm mt-2">Start practicing to see your progress here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {progress.map((session) => (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-gray-800">
                        {Math.round(session.overall_score)}%
                      </div>
                      {session.improvement !== undefined && session.improvement > 0 && (
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            +{Math.round(session.improvement)}%
                          </span>
                        </div>
                      )}
                      {session.improvement !== undefined && session.improvement < 0 && (
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendingDown className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {Math.round(session.improvement)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(session.created_at).toLocaleString()}
                    </p>
                  </div>
                  {session.verse_scores && session.verse_scores.length > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {session.verse_scores.length} verse
                        {session.verse_scores.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProgressView;
