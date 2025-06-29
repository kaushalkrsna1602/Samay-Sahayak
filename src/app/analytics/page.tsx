'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle, 
  Calendar,
  Trophy,
  Zap,
  Activity,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { ApiService } from '@/services/api';

interface AnalyticsData {
  date: string;
  tasksCompleted: number;
  totalWorkTime: number;
  technique: string;
  energyLevel: string;
  goal: string;
}

interface MetricsData {
  totalDays: number;
  totalTasksCompleted: number;
  totalWorkTime: number;
  averageProductivityScore: number;
  mostUsedTechnique: string;
  averageTasksPerDay: number;
  averageWorkTimePerDay: number;
}

export default function AnalyticsPage() {
  const { user } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [metrics, setMetrics] = useState<MetricsData>({
    totalDays: 0,
    totalTasksCompleted: 0,
    totalWorkTime: 0,
    averageProductivityScore: 0,
    mostUsedTechnique: 'None',
    averageTasksPerDay: 0,
    averageWorkTimePerDay: 0
  });
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, selectedPeriod]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Calculate date range based on selected period
      const endDate = new Date().toISOString().split('T')[0];
      let startDate = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      
      const startDateStr = startDate.toISOString().split('T')[0];

      const response = await ApiService.fetchAnalytics(user.id, startDateStr, endDate);
      
      if (response.success) {
        setAnalytics(response.analytics || []);
        setMetrics(response.metrics || {
          totalDays: 0,
          totalTasksCompleted: 0,
          totalWorkTime: 0,
          averageProductivityScore: 0,
          mostUsedTechnique: 'None',
          averageTasksPerDay: 0,
          averageWorkTimePerDay: 0
        });
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getProductivityScore = () => {
    return metrics.averageProductivityScore;
  };

  const getProductivityTrend = () => {
    if (analytics.length < 2) return 'stable';
    const recent = analytics.slice(-3).reduce((sum, stat) => sum + stat.tasksCompleted, 0) / 3;
    const older = analytics.slice(-6, -3).reduce((sum, stat) => sum + stat.tasksCompleted, 0) / 3;
    return recent > older ? 'up' : recent < older ? 'down' : 'stable';
  };

  const getCurrentStreak = () => {
    if (analytics.length === 0) return 0;
    
    const sortedDates = analytics
      .map(a => a.date)
      .sort()
      .reverse();
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);
    
    for (const dateStr of sortedDates) {
      const date = new Date(dateStr);
      const diffTime = Math.abs(currentDate.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        currentDate = date;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleResetAnalytics = async () => {
    if (!user) return;

    // Add confirmation dialog
    if (!confirm('Are you sure you want to reset all your analytics data? This action cannot be undone.')) {
      return;
    }

    try {
      setIsResetting(true);
      setError(null);

      const response = await ApiService.resetAnalytics(user.id);
      
      if (response.success) {
        // Clear local state
        setAnalytics([]);
        setMetrics({
          totalDays: 0,
          totalTasksCompleted: 0,
          totalWorkTime: 0,
          averageProductivityScore: 0,
          mostUsedTechnique: 'None',
          averageTasksPerDay: 0,
          averageWorkTimePerDay: 0
        });
        
        // Show success message
        alert(`Successfully reset analytics. ${response.deletedCount} records deleted.`);
      }
    } catch (err: any) {
      console.error('Error resetting analytics:', err);
      setError(err.message || 'Failed to reset analytics');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SignedIn>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
                  Productivity Analytics
                </h1>
                <p className="text-gray-600">
                  Track your productivity patterns and optimize your time management.
                </p>
              </div>
              <button
                onClick={handleResetAnalytics}
                disabled={isResetting}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isResetting ? 'Resetting...' : 'Reset Analytics'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800 font-medium mb-2">Error loading analytics</p>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Try again
              </button>
            </div>
          )}

          {/* Period Selector */}
          <div className="mb-6">
            <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
              {(['week', 'month', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Productivity Score */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className={`flex items-center text-sm ${
                  getProductivityTrend() === 'up' ? 'text-green-600' : 
                  getProductivityTrend() === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {getProductivityTrend() === 'up' && <ArrowUp className="h-4 w-4 mr-1" />}
                  {getProductivityTrend() === 'down' && <ArrowDown className="h-4 w-4 mr-1" />}
                  {getProductivityTrend() === 'up' ? '+12%' : 
                   getProductivityTrend() === 'down' ? '-8%' : '0%'}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {getProductivityScore()}%
              </h3>
              <p className="text-sm text-gray-600">Productivity Score</p>
            </div>

            {/* Tasks Completed */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {metrics.totalTasksCompleted}
              </h3>
              <p className="text-sm text-gray-600">Tasks Completed</p>
            </div>

            {/* Total Work Time */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {formatTime(metrics.totalWorkTime)}
              </h3>
              <p className="text-sm text-gray-600">Total Work Time</p>
            </div>

            {/* Current Streak */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {getCurrentStreak()}
              </h3>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Completion Rate */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Completion Rate
              </h3>
              <div className="flex items-center mb-4">
                <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${metrics.averageProductivityScore}%` }}
                  ></div>
                </div>
                <span className="text-2xl font-bold text-gray-900">{metrics.averageProductivityScore}%</span>
              </div>
              <p className="text-sm text-gray-600">
                You're completing {metrics.averageProductivityScore}% of your planned tasks on average.
              </p>
            </div>

            {/* Session Analysis */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Session Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Work Time/Day</span>
                  <span className="font-semibold">{formatTime(metrics.averageWorkTimePerDay)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Tasks/Day</span>
                  <span className="font-semibold">{metrics.averageTasksPerDay}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Preferred Technique</span>
                  <span className="font-semibold">{metrics.mostUsedTechnique}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Activity
            </h3>
            {analytics.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No analytics data available for this period.</p>
                <p className="text-sm text-gray-500 mt-2">Create and complete timetables to see your analytics here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.slice(-5).reverse().map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(stat.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-gray-600">{stat.goal}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{stat.tasksCompleted} tasks</p>
                      <p className="text-sm text-gray-600">{formatTime(stat.totalWorkTime)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Goal Progress */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Period Summary
            </h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">
                {metrics.totalDays} days with activity
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Overview
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((metrics.totalDays / (selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Track Your Productivity
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in to access detailed analytics and insights about your productivity patterns.
            </p>
            <SignInButton mode="modal">
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Sign In to View Analytics
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </div>
  );
} 