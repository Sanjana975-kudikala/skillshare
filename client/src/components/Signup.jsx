import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
const API = import.meta.env.VITE_API_URL;

const Signup = () => {
    // State to hold user input
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Connecting to your backend registration route
            const response = await axios.post('${API}/api/auth/register', formData);
            alert("Account created successfully! Please login.");
            navigate('/login'); // Redirect to login page after success
        } catch (err) {
            // Error handling if user already exists or server is down
            alert(err.response?.data?.message || "Registration failed. Check if server is running.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-blue-600 tracking-tight">Join SkillShare</h2>
                    <p className="text-gray-500 mt-2 font-medium">Start collaborating with your peers</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name Field */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="John Doe"
                            required 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                            onChange={handleChange} 
                        />
                    </div>

                    {/* College Email Field */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">College Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="name@college.edu"
                            required 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                            onChange={handleChange} 
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="••••••••"
                            required 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                            onChange={handleChange} 
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                    >
                        Create Account
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-gray-600 font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 font-bold hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;