import Link from 'next/link';
import { Clock, Brain, Target, Zap, Users, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Samay Sahayak
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your productivity with AI-powered time management. 
              Generate personalized schedules using proven techniques.
            </p>
            <Link
              href="/create-timetable"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg"
            >
              Create My Timetable
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Samay Sahayak Helps You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI analyzes your tasks and preferences to create optimal schedules 
              using time-tested productivity techniques.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI-Powered Planning
              </h3>
              <p className="text-gray-600">
                Our advanced AI considers your energy levels, task complexity, 
                and personal preferences to create the perfect schedule.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Proven Techniques
              </h3>
              <p className="text-gray-600">
                Choose from scientifically-backed productivity methods like 
                Pomodoro, Time Blocking, and more.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Integration
              </h3>
              <p className="text-gray-600">
                Seamlessly sync with Google Calendar, set reminders, 
                and get notifications to stay on track.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Techniques Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Time Management Techniques
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover proven methods to boost your productivity and achieve more in less time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Pomodoro Technique</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Work for 25 minutes, then take a 5-minute break. After 4 sessions, 
                take a longer 15-30 minute break to maintain focus and prevent burnout.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Best for:</strong> Deep work, studying, writing
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Time Blocking</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Allocate specific time blocks for different tasks and activities 
                throughout your day. This method helps you focus on one thing at a time.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Best for:</strong> Project management, complex tasks
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Timeboxing</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Set strict time limits for tasks to increase focus and prevent 
                over-engineering. This technique helps you work more efficiently.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Best for:</strong> Creative work, problem-solving
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Eat That Frog</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Tackle your most challenging task first thing in the morning. 
                This approach ensures your most important work gets done.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Best for:</strong> Overcoming procrastination
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">52/17 Rule</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Work for 52 minutes, then take a 17-minute break. This rhythm 
                helps maintain peak productivity throughout the day.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Best for:</strong> Sustained productivity
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Custom Blend</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Let our AI create a personalized approach combining multiple 
                techniques based on your specific needs and preferences.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Best for:</strong> Unique workflows, experimentation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have already improved their time management 
            with AI-powered scheduling.
          </p>
          <Link
            href="/create-timetable"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 text-lg"
          >
            Start Creating Your Schedule
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
