'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { ApiService, SavedTimetable } from '@/services/api';
import Link from 'next/link';
import { Clock, Calendar, Trash2, Eye, Plus } from 'lucide-react';

export default function MyTimetablesPage() {
  const { user } = useUser();
  const [timetables, setTimetables] = useState<SavedTimetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTimetables();
    }
  }, [user]);

  const fetchTimetables = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.fetchTimetables(user.id);
      setTimetables(response.timetables || []);
    } catch (err: any) {
      console.error('Error fetching timetables:', err);
      if (err.message.includes('500')) {
        setError('Server error. Please check if the backend is running and try again.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to load timetables. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimetable = async (id: string) => {
    if (!confirm('Are you sure you want to delete this timetable?')) {
      return;
    }

    try {
      await ApiService.deleteTimetable(id);
      setTimetables(timetables.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting timetable:', err);
      alert('Failed to delete timetable');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'work':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'break':
        return <Calendar className="h-4 w-4 text-green-600" />;
      case 'lunch':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <SignedIn>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">My Timetables</h1>
              <Link
                href="/create-timetable"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Link>
            </div>
            
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your timetables...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-800 font-medium mb-2">Error loading timetables</p>
                <p className="text-red-700 text-sm mb-3">{error}</p>
                <button
                  onClick={fetchTimetables}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && timetables.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No timetables yet</h3>
                <p className="text-gray-600 mb-6">Create your first timetable to get started!</p>
                <Link
                  href="/create-timetable"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Timetable
                </Link>
              </div>
            )}

            {!loading && !error && timetables.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {timetables.map((timetable) => (
                  <div key={timetable._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {timetable.data.technique}
                          </h3>
                          <p className="text-sm text-gray-500 mb-1">
                            Created {formatDate(timetable.createdAt)}
                          </p>
                          {timetable.data.date && (
                            <p className="text-sm text-blue-600 font-medium">
                              For: {new Date(timetable.data.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {timetable.data.dailySchedule.length} sessions
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Work Time:</span>
                          <span className="font-medium">{timetable.data.totalWorkTime} min</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Break Time:</span>
                          <span className="font-medium">{timetable.data.totalBreakTime} min</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-gray-900">Sample Activities:</h4>
                        </div>
                        <div className="mt-2 space-y-1">
                          {timetable.data.dailySchedule.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                              {getActivityIcon(item.type)}
                              <span>{item.time} - {item.activity}</span>
                            </div>
                          ))}
                          {timetable.data.dailySchedule.length > 3 && (
                            <p className="text-xs text-gray-500">+{timetable.data.dailySchedule.length - 3} more activities</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-6">
                        <button
                          onClick={() => handleDeleteTimetable(timetable._id)}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                        <Link
                          href={`/timetable/${timetable._id}`}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SignedIn>
        <SignedOut>
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Sign in to view your timetables</h2>
            <Link href="/sign-in" className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Sign In</Link>
          </div>
        </SignedOut>
      </div>
    </div>
  );
} 