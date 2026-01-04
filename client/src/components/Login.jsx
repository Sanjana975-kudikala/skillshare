import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
const API = import.meta.env.VITE_API_URL;

const Login = () => {
    const [formData, setFormData] = useState({
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
            const response = await axios.post('${API}/api/auth/login', formData);
            
            // CRITICAL FIX: Save the MongoDB _id to localStorage
            // Your backend sends: { user: { id: user._id, ... } }
            if (response.data.user && response.data.user.id) {
                localStorage.setItem('userId', response.data.user.id);
                alert("Login Successful!");
                navigate('/dashboard'); 
            } else {
                alert("Login failed: Server did not return a user ID.");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Invalid Email or Password");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-blue-600 tracking-tight">Welcome Back</h2>
                    <p className="text-gray-600 mt-2 font-medium">Log in to manage your projects</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">College Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="name@college.edu"
                            required 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                            onChange={handleChange} 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="••••••••"
                            required 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                            onChange={handleChange} 
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all transform"
                    >
                        Sign In
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-gray-600 font-medium">
                    New to SkillShare?{' '}
                    <Link to="/signup" className="text-blue-600 font-bold hover:underline">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;