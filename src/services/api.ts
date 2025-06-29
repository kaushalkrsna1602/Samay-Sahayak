import { Task } from '@/store/taskSlice';
import { Technique, SessionConfig } from '@/store/techniqueSlice';
import { TimetableData } from '@/store/timetableSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface GenerateTimetableRequest {
  tasks: Task[];
  technique: Technique;
  sessionConfig: SessionConfig;
}

export interface GenerateTimetableResponse {
  success: boolean;
  timetable: TimetableData;
  rawResponse?: string;
}

export interface SavedTimetable {
  _id: string;
  userId: string;
  data: TimetableData;
  createdAt: string;
  updatedAt: string;
}

export interface SaveTimetableRequest {
  userId: string;
  timetable: TimetableData;
}

export interface SaveTimetableResponse {
  success: boolean;
  timetable: SavedTimetable;
}

export interface FetchTimetablesResponse {
  success: boolean;
  timetables: SavedTimetable[];
}

export class ApiService {
  static async generateTimetable(data: GenerateTimetableRequest): Promise<GenerateTimetableResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-timetable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to generate timetable. Please try again.');
    }
  }

  static async saveTimetable(data: SaveTimetableRequest): Promise<SaveTimetableResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timetables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to save timetable. Please try again.');
    }
  }

  static async fetchTimetables(userId: string): Promise<FetchTimetablesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timetables?userId=${userId}`);
      
      if (!response.ok) {
        if (response.status === 500) {
          throw new Error(`HTTP error! status: ${response.status} - Server error. Please check if the backend is running.`);
        } else if (response.status === 404) {
          throw new Error(`HTTP error! status: ${response.status} - Endpoint not found.`);
        } else if (response.status === 400) {
          throw new Error(`HTTP error! status: ${response.status} - Bad request. Please check your user ID.`);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and ensure the backend is running.');
      }
      throw error;
    }
  }

  static async deleteTimetable(id: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timetables/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to delete timetable. Please try again.');
    }
  }

  static async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Backend service is not available');
    }
  }

  // Analytics methods
  static async saveAnalytics(analyticsData: any) {
    const response = await fetch(`${API_BASE_URL}/api/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async fetchAnalytics(userId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams({ userId });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/api/analytics?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async updateTaskCompletion(userId: string, date: string, taskId: string, completed: boolean) {
    const response = await fetch(`${API_BASE_URL}/api/analytics/task`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, date, taskId, completed }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async resetAnalytics(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/analytics?userId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
} 