import React from 'react';
import { Link } from 'react-router-dom';
// The .. steps out of 'components' to find the 'assets' folder
import heroImage from '../assets/image.png'; 

const Home = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* 1. Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <div className="text-2xl font-bold text-blue-600 tracking-tight">SkillShare</div>
        <div className="hidden md:flex space-x-8 font-medium text-gray-600">
          <a href="#" className="hover:text-blue-600 transition">Browse Projects</a>
          <a href="#" className="hover:text-blue-600 transition">Find Peers</a>
          <a href="#" className="hover:text-blue-600 transition">How it Works</a>
        </div>
        <div className="space-x-4">
          {/* Using Link instead of button for navigation */}
          <Link to="/login" className="px-5 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition">
            Login
          </Link>
          <Link to="/signup" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
            Join Now
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="max-w-7xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 space-y-8">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900">
            Find your perfect <span className="text-blue-600">Project Partner.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
            The exclusive collaboration hub for college students. Share your skills, join innovative projects, and build your portfolio with peers from your campus.
          </p>
          <div className="flex space-x-4">
            <Link to="/signup" className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition transform">
              Start a Project
            </Link>
            <button className="px-8 py-4 border-2 border-gray-200 text-gray-700 text-lg font-bold rounded-xl hover:border-blue-600 hover:text-blue-600 transition">
              View Skills
            </button>
          </div>
          <div className="flex items-center space-x-4 pt-4 text-sm text-gray-500">
            <span className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-green-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-white"></div>
            </span>
            <p>Join and Explore</p>
          </div>
        </div>
        
        {/* Hero Illustration Container */}
        <div className="md:w-1/2 mt-16 md:mt-0 relative">
           <div className="w-full h-96 bg-blue-50 rounded-3xl border border-blue-100 shadow-2xl flex items-center justify-center overflow-hidden">
             {/* THE IMAGE TAG REPLACING THE PLACEHOLDER TEXT */}
             <img 
               src={heroImage} 
               alt="SkillShare Dashboard Preview" 
               className="w-full h-full object-cover" 
             />
             
                
          </div>
        </div>
      </header>

      {/* 3. Features Grid */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why use SkillShare?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Skip the informal group chats. Get direct access to a structured database of talent on your campus.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon="🚀" title="Launch Projects" desc="Post your idea and list exactly what roles you need to fill—from developers to marketers." />
            <FeatureCard icon="🤝" title="Skill Swapping" desc="Learn new technologies by collaborating on real projects instead of just watching tutorials." />
            <FeatureCard icon="🎓" title="Campus Exclusive" desc="Verified college access ensures you are working with real peers from your institution." />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition shadow-sm">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

export default Home;