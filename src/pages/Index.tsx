// src/pages/Index.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Mic, BookOpen, Phone, Brain } from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Mic,
      title: "AI Pronunciation",
      description: "Get real-time feedback on your English pronunciation with our advanced AI technology",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BookOpen,
      title: "Daily Topics",
      description: "Learn new vocabulary and grammar concepts with carefully curated daily lessons",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Phone,
      title: "Voice Calling",
      description: "Practice speaking with native English speakers in real-time conversations",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Brain,
      title: "Daily Quizzes",
      description: "Test your knowledge and track your progress with engaging interactive quizzes",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-teal-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl w-full">
          {/* Main Content */}
          <div className="text-center mb-16">
            {/* Header Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-teal-300 
                              flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                ET
              </div>
            </div>

            {/* Main Hero Text */}
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              Welcome to <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">EduTalks</span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Master English communication through the EduTalks platform
            </p>

            {/* Tagline */}
            <p className="text-lg md:text-xl text-blue-50 mb-10 font-semibold">
              🚀 Connect with real users, practice speaking, take quizzes, and improve faster than ever before!
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <Link
                to="/login"
                className="px-8 py-4 text-lg border-3 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition font-bold shadow-lg"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-8 py-4 text-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-xl 
                           hover:from-yellow-300 hover:to-orange-300 transition font-bold shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition transform hover:scale-105 text-center border border-gray-100 dark:border-gray-700"
                >
                  {/* Icon Container */}
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Tagline */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center border border-gray-100 dark:border-gray-700 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Elevate Your English Communication
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              EduTalks is your premier platform for mastering English communication. 
              With interactive learning tools, real-time practice opportunities, and personalized feedback, 
              you'll achieve fluency faster and with confidence. Join thousands of learners worldwide who are 
              transforming their English skills today!
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-blue-100 dark:text-gray-400">
            © {new Date().getFullYear()} EduTalks — Master English. Connect with the World.
          </p>
        </div>
      </div>
    </div>
  );
}
