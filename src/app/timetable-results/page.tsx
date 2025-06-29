'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAppSelector } from '@/store/hooks';
import { Clock, Calendar, Download, Share2, Bell, CheckCircle, Coffee, BookOpen, ArrowLeft } from 'lucide-react';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { ApiService } from '@/services/api';

interface TaskCompletion {
  taskId: string;
  taskTitle: string;
  completed: boolean;
  completedAt?: Date;
}

export default function TimetableResultsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { timetable, isLoading, error } = useAppSelector(state => state.timetable);
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([]);
  const [analyticsSaved, setAnalyticsSaved] = useState(false);

  useEffect(() => {
    // If no timetable data, redirect back to creation page
    if (!timetable && !isLoading) {
      router.push('/create-timetable');
    }
  }, [timetable, isLoading, router]);

  useEffect(() => {
    if (timetable && user && !analyticsSaved) {
      initializeAnalytics();
    }
  }, [timetable, user, analyticsSaved]);

  const initializeAnalytics = async () => {
    if (!timetable || !user) return;

    // Create task completions array from work tasks
    const workTasks = timetable.dailySchedule.filter(item => item.type === 'work');
    const initialCompletions: TaskCompletion[] = workTasks.map((task, index) => ({
      taskId: `task-${index}`,
      taskTitle: task.activity,
      completed: false
    }));

    setTaskCompletions(initialCompletions);

    // Save initial analytics data
    try {
      await ApiService.saveAnalytics({
        userId: user.id,
        date: timetable.date,
        technique: timetable.technique,
        totalTasks: workTasks.length,
        totalWorkTime: timetable.totalWorkTime,
        totalBreakTime: timetable.totalBreakTime,
        taskCompletions: initialCompletions
      });
      setAnalyticsSaved(true);
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    if (!user || !timetable) return;

    const updatedCompletions = taskCompletions.map(task => 
      task.taskId === taskId 
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date() : undefined }
        : task
    );

    setTaskCompletions(updatedCompletions);

    // Update analytics in backend
    try {
      await ApiService.updateTaskCompletion(
        user.id,
        timetable.date,
        taskId,
        !taskCompletions.find(t => t.taskId === taskId)?.completed || false
      );
    } catch (error) {
      console.error('Failed to update task completion:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'work':
        return <BookOpen className="h-4 w-4" />;
      case 'break':
        return <Coffee className="h-4 w-4" />;
      case 'lunch':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'work':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'break':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'lunch':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompletionStats = () => {
    const completed = taskCompletions.filter(t => t.completed).length;
    const total = taskCompletions.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your personalized timetable...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/create-timetable')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No timetable data available.</p>
          <button
            onClick={() => router.push('/create-timetable')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mt-4"
          >
            Create Timetable
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <button
                    onClick={() => router.push('/create-timetable')}
                    className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Create Timetable
                  </button>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Your Personalized Timetable
                  </h1>
                  <p className="text-gray-600 mb-2">
                    Generated using {timetable.technique} for optimal productivity
                  </p>
                  {timetable.date && (
                    <p className="text-sm text-gray-500">
                      For: {new Date(timetable.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </button>
                  <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    <Bell className="h-4 w-4 mr-2" />
                    Set Reminders
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Work Time</p>
                      <p className="text-2xl font-bold text-blue-900">{timetable.totalWorkTime} min</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Coffee className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total Break Time</p>
                      <p className="text-2xl font-bold text-green-900">{timetable.totalBreakTime} min</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <BookOpen className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Sessions</p>
                      <p className="text-2xl font-bold text-purple-900">{timetable.dailySchedule.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Task Progress</p>
                      <p className="text-2xl font-bold text-yellow-900">{getCompletionStats().percentage}%</p>
                      <p className="text-xs text-yellow-700">{getCompletionStats().completed}/{getCompletionStats().total} completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Timetable */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Daily Schedule</h2>
                  
                  <div className="space-y-4">
                    {timetable.dailySchedule.map((item, index) => {
                      const isWorkTask = item.type === 'work';
                      const taskCompletion = isWorkTask ? taskCompletions.find(t => t.taskId === `task-${index}`) : null;
                      
                      return (
                        <div
                          key={index}
                          className={`flex items-center p-4 rounded-lg border-2 ${getActivityColor(item.type)} ${
                            taskCompletion?.completed ? 'opacity-75' : ''
                          }`}
                        >
                          {isWorkTask && (
                            <div className="flex-shrink-0 mr-3">
                              <input
                                type="checkbox"
                                checked={taskCompletion?.completed || false}
                                onChange={() => handleTaskToggle(`task-${index}`)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </div>
                          )}
                          <div className="flex-shrink-0 mr-4">
                            {getActivityIcon(item.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className={`font-medium ${taskCompletion?.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {item.activity}
                              </h3>
                              <span className="text-sm font-medium">
                                {item.time} ({item.duration} min)
                              </span>
                            </div>
                            <p className={`text-sm ${taskCompletion?.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommendations</h2>
                  
                  <div className="space-y-4">
                    {timetable.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Pro Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Stick to the schedule as closely as possible</li>
                      <li>• Use the breaks for light stretching</li>
                      <li>• Avoid checking emails during work sessions</li>
                      <li>• Adjust the schedule if needed for urgent tasks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-semibold mb-4">Sign in to view your timetable results</h2>
          <Link href="/sign-in" className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Sign In</Link>
        </div>
      </SignedOut>
    </>
  );
} 