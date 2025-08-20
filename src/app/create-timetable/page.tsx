'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectTechnique, updateSessionConfig } from '@/store/techniqueSlice';
import { addTask, removeTask, Task } from '@/store/taskSlice';
import { setTimetable, setLoading, setError, TimetableData } from '@/store/timetableSlice';
import { ApiService } from '@/services/api';
import { Plus, X, Clock, Calendar, Settings, Target, Sun, Moon, Zap } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function CreateTimetablePage() {
  const router = useRouter();
  const { user } = useUser();
  const dispatch = useAppDispatch();
  const { techniques, selectedTechnique, sessionConfig } = useAppSelector(state => state.technique);
  const { tasks, categories } = useAppSelector(state => state.tasks);

  const [mode, setMode] = useState('structured'); // 'structured' or 'ceo'
  const [randomPlan, setRandomPlan] = useState('');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    estimatedDuration: 60,
    category: 'Work'
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Enhanced form state
  const [timetableDate, setTimetableDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyGoal, setDailyGoal] = useState('');
  const [energyLevel, setEnergyLevel] = useState('medium');
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState('morning');
  const [preferredLearningTime, setPreferredLearningTime] = useState('morning');
  const [includeBreaks, setIncludeBreaks] = useState(true);
  const [includeMeals, setIncludeMeals] = useState(true);

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      dispatch(addTask(newTask));
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        estimatedDuration: 60,
        category: 'Work'
      });
    }
  };

  const handleTechniqueSelect = (techniqueId: string) => {
    dispatch(selectTechnique(techniqueId));
  };

  const handleSessionConfigUpdate = (updates: any) => {
    dispatch(updateSessionConfig(updates));
  };

  const handleGenerateTimetable = async () => {
    if (!selectedTechnique || !sessionConfig || tasks.length === 0 || !user) {
      return;
    }

    setIsGenerating(true);
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const selectedTechniqueData = techniques.find(t => t.id === selectedTechnique);

      const requestData = {
        tasks,
        technique: selectedTechniqueData,
        sessionConfig,
        userPreferences: {
          timetableDate,
          dailyGoal,
          energyLevel,
          preferredWorkoutTime,
          preferredLearningTime,
          includeBreaks,
          includeMeals
        }
      };

      console.log('Generating timetable with enhanced data:', requestData);

      // Generate enhanced timetable data
      const enhancedTimetable: TimetableData = generateEnhancedTimetable(
        tasks,
        selectedTechniqueData!,
        sessionConfig,
        requestData.userPreferences
      );

      // Store the timetable in Redux
      dispatch(setTimetable(enhancedTimetable));

      // Save timetable to backend
      try {
        await ApiService.saveTimetable({
          userId: user.id,
          timetable: enhancedTimetable
        });
        console.log('Timetable saved successfully');
      } catch (error) {
        console.error('Failed to save timetable:', error);
        // Continue to results page even if save fails
      }

      // Navigate to results page
      router.push('/timetable-results');
    } catch (error) {
      console.error('Error generating timetable:', error);
      dispatch(setError('Failed to generate timetable. Please try again.'));
      alert('Failed to generate timetable. Please try again.');
    } finally {
      setIsGenerating(false);
      dispatch(setLoading(false));
    }
  };

  const handleGenerateCEOSchedule = async () => {
    if (!randomPlan.trim() || !user) {
        return;
    }

    setIsGenerating(true);
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
        // NOTE: You will need to create a new method in your ApiService
        // for 'generateCEOTimetable'. For now, we'll placeholder it.
        const response = await ApiService.generateTimetable({
            tasks: [{ title: randomPlan, description: '', priority: 'medium', estimatedDuration: 480, category: 'General' }],
            technique: techniques[0],
            sessionConfig: { techniqueId: 'pomodoro', sessionLength: 25, breakLength: 5, workDays: [], startTime: '09:00', endTime: '17:00' },
        });

        if (response.success) {
            dispatch(setTimetable(response.timetable));
            router.push('/timetable-results');
        } else {
            throw new Error('Failed to generate CEO timetable');
        }
    } catch (error) {
        console.error('Error generating CEO timetable:', error);
        dispatch(setError('Failed to generate CEO timetable. Please try again.'));
        alert('Failed to generate CEO timetable. Please try again.');
    } finally {
        setIsGenerating(false);
        dispatch(setLoading(false));
    }
};

  const generateEnhancedTimetable = (
    tasks: Task[],
    technique: any,
    sessionConfig: any,
    preferences: any
  ): TimetableData => {
    const schedule: any[] = [];
    let currentTime = new Date(`2000-01-01T${sessionConfig.startTime}`);
    let totalWorkTime = 0;
    let totalBreakTime = 0;

    // Sort tasks by priority and category
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Add tasks to schedule with enhanced logic
    sortedTasks.forEach((task, index) => {
      // Add work session
      schedule.push({
        time: currentTime.toTimeString().slice(0, 5),
        duration: Math.min(task.estimatedDuration, sessionConfig.sessionLength),
        activity: task.title,
        type: 'work' as const,
        description: task.description || `Focus on ${task.title}`,
        priority: task.priority,
        category: task.category
      });

      totalWorkTime += Math.min(task.estimatedDuration, sessionConfig.sessionLength);

      // Move time forward
      currentTime.setMinutes(currentTime.getMinutes() + Math.min(task.estimatedDuration, sessionConfig.sessionLength));

      // Add break if not the last task and breaks are enabled
      if (index < sortedTasks.length - 1 && preferences.includeBreaks) {
        schedule.push({
          time: currentTime.toTimeString().slice(0, 5),
          duration: sessionConfig.breakLength,
          activity: 'Break',
          type: 'break' as const,
          description: 'Take a short break to refresh'
        });

        totalBreakTime += sessionConfig.breakLength;
        currentTime.setMinutes(currentTime.getMinutes() + sessionConfig.breakLength);
      }
    });

    // Add lunch break if work time is long enough and meals are enabled
    if (totalWorkTime > 240 && preferences.includeMeals) { // 4 hours
      schedule.splice(Math.floor(schedule.length / 2), 0, {
        time: '12:00',
        duration: 30,
        activity: 'Lunch Break',
        type: 'lunch' as const,
        description: 'Healthy meal and rest'
      });
      totalBreakTime += 30;
    }

    return {
      date: timetableDate,
      dailySchedule: schedule,
      technique: technique.name,
      totalWorkTime,
      totalBreakTime,
      recommendations: [
        preferences.dailyGoal && `Focus on your goal: ${preferences.dailyGoal}`,
        'Take regular breaks to maintain focus',
        'Start with your most challenging task',
        'Avoid multitasking during work sessions',
        'Use breaks for light physical activity',
        `Follow the ${technique.name} principles for best results`,
        preferences.energyLevel === 'low' && 'Consider shorter work sessions due to lower energy',
        preferences.energyLevel === 'high' && 'Use your high energy for complex tasks'
      ].filter(Boolean)
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SignedIn>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Timetable
            </h1>
            <p className="text-gray-600">
              Tell us about your goals and preferences, then let AI create your perfect schedule.
            </p>
          </div>

          <div className="flex justify-center mb-4">
            <button onClick={() => setMode('structured')} className={`px-4 py-2 rounded-l-md ${mode === 'structured' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>Structured Planning</button>
            <button onClick={() => setMode('ceo')} className={`px-4 py-2 rounded-r-md ${mode === 'ceo' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>CEO Mode</button>
          </div>

          {mode === 'structured' ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Goals & Preferences */}
              <div className="space-y-6">
                {/* Date Selection */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Timetable Date
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Which day is this timetable for?
                    </label>
                    <input
                      type="date"
                      value={timetableDate}
                      onChange={(e) => setTimetableDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Daily Goal */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Your Daily Goal
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What do you want to achieve today?
                    </label>
                    <textarea
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={3}
                      placeholder="e.g., Complete the project proposal, exercise for 30 minutes, read 20 pages..."
                    />
                  </div>
                </div>

                {/* Energy & Preferences */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Energy & Preferences
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How's your energy level today?
                      </label>
                      <select
                        value={energyLevel}
                        onChange={(e) => setEnergyLevel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="low">Low - Need gentle tasks</option>
                        <option value="medium">Medium - Balanced approach</option>
                        <option value="high">High - Ready for challenges</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred workout time
                        </label>
                        <select
                          value={preferredWorkoutTime}
                          onChange={(e) => setPreferredWorkoutTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                          <option value="none">No workout today</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred learning time
                        </label>
                        <select
                          value={preferredLearningTime}
                          onChange={(e) => setPreferredLearningTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                          <option value="none">No learning today</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={includeBreaks}
                          onChange={(e) => setIncludeBreaks(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Include regular breaks</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={includeMeals}
                          onChange={(e) => setIncludeMeals(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Include meal breaks</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Tasks Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Tasks
                  </h2>

                  {/* Add Task Form */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Enter task title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        rows={2}
                        placeholder="Optional description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={newTask.priority}
                          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (min)
                        </label>
                        <input
                          type="number"
                          value={newTask.estimatedDuration}
                          onChange={(e) => setNewTask({ ...newTask, estimatedDuration: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          min="5"
                          step="5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={newTask.category}
                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleAddTask}
                      disabled={!newTask.title.trim()}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Task
                    </button>
                  </div>

                  {/* Task List */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Your Tasks ({tasks.length})
                    </h3>
                    {tasks.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No tasks added yet. Add your first task above.
                      </p>
                    ) : (
                      tasks.map((task) => (
                        <div key={task.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <button
                              onClick={() => dispatch(removeTask(task.id))}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.estimatedDuration} min
                            </span>
                            <span className="text-gray-500">{task.category}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Technique & Config */}
              <div className="space-y-6">
                {/* Technique Selection */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Choose Technique
                  </h2>

                  <div className="space-y-3">
                    {techniques.map((technique) => (
                      <div
                        key={technique.id}
                        onClick={() => handleTechniqueSelect(technique.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedTechnique === technique.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{technique.name}</h3>
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: technique.color }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{technique.description}</p>
                        <div className="text-xs text-gray-500">
                          Default: {technique.defaultSessionLength}min work, {technique.defaultBreakLength}min break
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Configuration */}
                {selectedTechnique && sessionConfig && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Session Configuration
                    </h2>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Session Length (min)
                          </label>
                          <input
                            type="number"
                            value={sessionConfig.sessionLength}
                            onChange={(e) => handleSessionConfigUpdate({ sessionLength: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            min="5"
                            step="5"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Break Length (min)
                          </label>
                          <input
                            type="number"
                            value={sessionConfig.breakLength}
                            onChange={(e) => handleSessionConfigUpdate({ breakLength: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            min="1"
                            step="1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={sessionConfig.startTime}
                            onChange={(e) => handleSessionConfigUpdate({ startTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={sessionConfig.endTime}
                            onChange={(e) => handleSessionConfigUpdate({ endTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Work Days
                        </label>
                        <div className="grid grid-cols-7 gap-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <label key={day} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={sessionConfig.workDays.includes(day === 'Mon' ? 'Monday' : day === 'Tue' ? 'Tuesday' : day === 'Wed' ? 'Wednesday' : day === 'Thu' ? 'Thursday' : day === 'Fri' ? 'Friday' : day === 'Sat' ? 'Saturday' : 'Sunday')}
                                onChange={(e) => {
                                  const dayName = day === 'Mon' ? 'Monday' : day === 'Tue' ? 'Tuesday' : day === 'Wed' ? 'Wednesday' : day === 'Thu' ? 'Thursday' : day === 'Fri' ? 'Friday' : day === 'Sat' ? 'Saturday' : 'Sunday';
                                  const newWorkDays = e.target.checked
                                    ? [...sessionConfig.workDays, dayName]
                                    : sessionConfig.workDays.filter(d => d !== dayName);
                                  handleSessionConfigUpdate({ workDays: newWorkDays });
                                }}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-900">{day}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                {tasks.length > 0 && selectedTechnique && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <button
                      onClick={handleGenerateTimetable}
                      disabled={isGenerating}
                      className={`w-full py-3 px-4 rounded-md font-semibold text-lg transition-colors ${isGenerating
                        ? 'bg-gray-400 text-gray-800 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                      {isGenerating ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800 mr-2"></div>
                          Generating...
                        </div>
                      ) : (
                        'Generate Timetable with AI'
                      )}
                    </button>
                    <p className="text-sm text-gray-500 text-center mt-2">
                      AI will analyze your goals, preferences, and tasks to create an optimal schedule
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Describe Your Day</h2>
              <textarea
                value={randomPlan}
                onChange={(e) => setRandomPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={10}
                placeholder="e.g., 'I have a big presentation tomorrow that I need to finish. I also need to call my mom, go to the gym, and pick up groceries. I feel a bit tired today.'"
              />
              <button onClick={handleGenerateCEOSchedule} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md mt-4">
                Generate CEO Plan
              </button>
            </div>
          )}
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-semibold mb-4">Sign in to create your timetable</h2>
          <SignInButton mode="modal">
            <button className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </div>
  );
}