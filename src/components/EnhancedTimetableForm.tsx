'use client';

import { useState } from 'react';
import { Target, Zap, Sun, Moon, Clock, Plus, X } from 'lucide-react';

interface EnhancedFormData {
  dailyGoal: string;
  energyLevel: 'low' | 'medium' | 'high';
  preferredWorkoutTime: 'morning' | 'afternoon' | 'evening' | 'none';
  preferredLearningTime: 'morning' | 'afternoon' | 'evening' | 'none';
  includeBreaks: boolean;
  includeMeals: boolean;
}

interface EnhancedTimetableFormProps {
  formData: EnhancedFormData;
  onFormDataChange: (data: EnhancedFormData) => void;
}

export function EnhancedTimetableForm({ formData, onFormDataChange }: EnhancedTimetableFormProps) {
  const updateFormData = (updates: Partial<EnhancedFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  return (
    <div className="space-y-6">
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
            value={formData.dailyGoal}
            onChange={(e) => updateFormData({ dailyGoal: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              value={formData.energyLevel}
              onChange={(e) => updateFormData({ energyLevel: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={formData.preferredWorkoutTime}
                onChange={(e) => updateFormData({ preferredWorkoutTime: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={formData.preferredLearningTime}
                onChange={(e) => updateFormData({ preferredLearningTime: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                checked={formData.includeBreaks}
                onChange={(e) => updateFormData({ includeBreaks: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include regular breaks</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.includeMeals}
                onChange={(e) => updateFormData({ includeMeals: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include meal breaks</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 