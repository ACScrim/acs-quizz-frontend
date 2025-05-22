import React from 'react';
import { useNavigate } from 'react-router';

interface QuizErrorViewProps {
  message?: string;
}

const QuizErrorView: React.FC<QuizErrorViewProps> = ({
  message = "An unexpected error occurred with the quiz data.",
}) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="relative group max-w-md mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-pink-700 to-orange-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div className="relative bg-gray-900 bg-opacity-80 backdrop-blur-md p-8 rounded-xl border border-red-700 shadow-xl">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-orange-300 mb-6 cyberpunk-font neon-text-strong uppercase tracking-wider">
                    Quiz System Error
                </h2>
                <p className="text-red-300 mb-8 text-shadow-sm text-lg">
                    {message}
                </p>
                <button
                    onClick={() => navigate('/')} // Ou vers la page des lobbies
                    className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-gray-800 rounded-md group hover:bg-gray-700 border border-pink-600 hover:border-red-500"
                >
                    <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-red-500 rounded-full group-hover:w-56 group-hover:h-56 opacity-50"></span>
                    <span className="relative">Return to Safety</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default QuizErrorView;