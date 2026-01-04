import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API = import.meta.env.VITE_API_URL; 

const Dashboard = () => {
    // Navigation & Data State
    const [view, setView] = useState('overview'); 
    const [user, setUser] = useState(null);
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState("");
    const [projects, setProjects] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedPeer, setSelectedPeer] = useState(null); 

    // Project Form & Edit State
    const [isEditing, setIsEditing] = useState(null); 
    const [projectForm, setProjectForm] = useState({ 
        title: '', status: 'Idea', techStack: '', description: '', isDeployed: false, link: '' 
    });

    // Search & Discovery State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    // 1. Unified Data Loader
    useEffect(() => {
        const loadDashboardData = async () => {
            if (!userId) { navigate('/login'); return; }
            try {
                const userRes = await axios.get(`${API}/api/auth/profile/${userId}`);
                setUser(userRes.data);
                setSkills(userRes.data.skills || []);

                const allUsersRes = await axios.get(`${API}/api/auth/all-users/${userId}`);
                setAllUsers(allUsersRes.data);

                const projectRes = await axios.get(`${API}/api/auth/user-projects/${userId}`);
                setProjects(projectRes.data);

                const notifRes = await axios.get(`${API}/api/auth/notifications/${userId}`);
                setNotifications(notifRes.data);
            } catch (err) { console.error("Error loading data", err); }
        };
        loadDashboardData();
    }, [userId, navigate]);

    // --- SKILLS MANAGEMENT ---
    const handleAddSkill = async () => {
        if (newSkill && !skills.includes(newSkill)) {
            const updatedSkills = [...skills, newSkill];
            try {
                await axios.put(`${API}/api/auth/settings/${userId}`, { skills: updatedSkills });
                setSkills(updatedSkills);
                setNewSkill("");
            } catch (err) { alert("Failed to add skill"); }
        }
    };

    const handleRemoveSkill = async (skillToRemove) => {
        const updatedSkills = skills.filter(s => s !== skillToRemove);
        try {
            await axios.put(`${API}/api/auth/settings/${userId}`, { skills: updatedSkills });
            setSkills(updatedSkills);
        } catch (err) { alert("Failed to remove skill"); }
    };

    // --- PROJECT ACTIONS ---
    const handleAddOrUpdateProject = async (e) => {
        e.preventDefault();
        const processedData = {
            ...projectForm,
            userId: userId,
            techStack: typeof projectForm.techStack === 'string' 
                ? projectForm.techStack.split(',').map(s => s.trim()).filter(s => s !== "")
                : projectForm.techStack
        };
        try {
            if (isEditing) {
                const res = await axios.put(`${API}/api/auth/project/${isEditing}`, processedData);
                setProjects(projects.map(p => p._id === isEditing ? res.data : p));
                setIsEditing(null);
            } else {
                const res = await axios.post(`${API}/api/auth/add-project`, processedData);
                setProjects([res.data, ...projects]);
            }
            setProjectForm({ title: '', status: 'Idea', techStack: '', description: '', isDeployed: false, link: '' });
        } catch (err) { alert("Failed to save project."); }
    };

    const deleteProject = async (projectId) => {
        if (window.confirm("Delete this project?")) {
            try {
                await axios.delete(`${API}/api/auth/project/${projectId}`);
                setProjects(projects.filter(p => p._id !== projectId));
            } catch (err) { alert("Delete failed"); }
        }
    };

    // --- SEARCH LOGIC ---
    const handleSearch = async () => {
        if (!searchQuery) { setSearchResults([]); return; }
        try {
            const res = await axios.get(`${API}/api/auth/search?query=${searchQuery}`);
            setSearchResults(res.data);
        } catch (err) { console.error("Search failed"); }
    };

    const sendConnectionRequest = async (targetId, targetName) => {
        try {
            await axios.post(`${API}/api/auth/send-request`, {
                senderId: userId, senderName: user.name, receiverId: targetId
            });
            alert(`Request sent to ${targetName}!`);
        } catch (err) { alert("Failed to send request."); }
    };

    // ADDED: REMOVE CONNECTION LOGIC
    const handleRemoveConnection = async (targetId) => {
        if (window.confirm("Are you sure you want to remove this connection?")) {
            try {
                await axios.post(`${API}/api/auth/remove-connection`, {
                    userId, targetId
                });
                alert("Connection removed");
                window.location.reload(); 
            } catch (err) { alert("Error removing connection"); }
        }
    };

    const handleAccept = async (notif) => {
        try {
            await axios.post(`${API}/api/auth/accept-request`, {
                notificationId: notif._id, senderId: notif.sender, recipientId: userId
            });
            setNotifications(notifications.filter(n => n._id !== notif._id));
            window.location.reload(); 
        } catch (err) { alert("Error accepting request"); }
    };

    const handleReject = async (notifId) => {
        try {
            await axios.delete(`${API}/api/auth/reject-request/${notifId}`);
            setNotifications(notifications.filter(n => n._id !== notifId));
        } catch (err) { alert("Error rejecting request"); }
    };

    const updateTheme = async () => {
        const newTheme = user.theme === 'light' ? 'dark' : 'light';
        try {
            const res = await axios.put(`${API}/api/auth/settings/${userId}`, { theme: newTheme });
            setUser(res.data);
        } catch (err) { console.error("Theme update failed"); }
    };

    if (!user) return <div className="h-screen flex items-center justify-center font-bold text-blue-600 italic">Syncing SkillShare...</div>;
    const isDark = user.theme === 'dark';

    return (
        <div className={`min-h-screen flex flex-col lg:flex-row font-sans transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-[#F8FAFC] text-gray-900'}`}>
            
            {/* Sidebar (Responsive classes added) */}
            <aside className={`w-full lg:w-64 border-b lg:border-r flex flex-col sticky top-0 z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                <div className="p-6 lg:p-8 border-b border-gray-50 font-black text-2xl text-blue-600 italic">SkillShare</div>
                <nav className="p-4 lg:p-6 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible space-x-2 lg:space-x-0 lg:space-y-2 flex-1 scrollbar-hide">
                    <button onClick={() => {setView('overview'); setSelectedPeer(null);}} className={`whitespace-nowrap w-full text-left p-3 rounded-xl font-bold transition ${view === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400'}`}>Overview</button>
                    <button onClick={() => {setView('connections'); setSelectedPeer(null);}} className={`whitespace-nowrap w-full text-left p-3 rounded-xl font-bold transition ${view === 'connections' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400'}`}>Connections</button>
                    <button onClick={() => setView('notifications')} className={`whitespace-nowrap w-full text-left p-3 rounded-xl font-bold transition ${view === 'notifications' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400'}`}>Inbox ({notifications.length})</button>
                    <button onClick={() => setView('settings')} className={`whitespace-nowrap w-full text-left p-3 rounded-xl font-bold transition ${view === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400'}`}>Settings</button>
                </nav>
                <div className="p-4 lg:p-6 border-t border-gray-50 hidden lg:block">
                    <button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-gray-400 font-bold hover:text-red-500 flex items-center space-x-2">↩Logout</button>
                </div>
            </aside>

            <main className="flex-1 p-4 lg:p-12 overflow-y-auto">
                
                {/* --- OVERVIEW VIEW --- */}
                {view === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <section className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} p-6 lg:p-8 rounded-[2rem] shadow-sm border`}>
                            <h2 className={`text-xl font-black mb-6 italic ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{isEditing ? "✏️ Edit Project" : "➕ Add New Project"}</h2>
                            <form onSubmit={handleAddOrUpdateProject} className="grid gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input className={`p-3 rounded-xl border outline-none focus:border-blue-400 ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-50 text-black border-gray-200'}`} placeholder="Project Name" value={projectForm.title} onChange={(e)=>setProjectForm({...projectForm, title: e.target.value})} required />
                                    <select className={`p-3 rounded-xl border outline-none ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-50 text-black border-gray-200'}`} value={projectForm.status} onChange={(e)=>setProjectForm({...projectForm, status: e.target.value})}>
                                        <option value="Idea">Idea/Planned</option>
                                        <option value="Development">In Development</option>
                                        <option value="Testing">Testing Phase</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                                <input className={`p-3 rounded-xl border outline-none ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-50 text-black border-gray-200'}`} placeholder="Tech Stack (comma separated)" value={projectForm.techStack} onChange={(e)=>setProjectForm({...projectForm, techStack: e.target.value})} />
                                <textarea className={`p-3 rounded-xl h-24 border outline-none ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-50 text-black border-gray-200'}`} placeholder="What are you building?" value={projectForm.description} onChange={(e)=>setProjectForm({...projectForm, description: e.target.value})} required />
                                <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    <label className={`flex items-center gap-2 cursor-pointer text-sm font-bold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                                        <input type="checkbox" checked={projectForm.isDeployed} onChange={(e)=>setProjectForm({...projectForm, isDeployed: e.target.checked})} />
                                        Deployment Live?
                                    </label>
                                    {projectForm.isDeployed && (
                                        <input className={`flex-1 p-1 bg-transparent border-b border-blue-400 outline-none text-sm ${isDark ? 'text-white' : 'text-black'}`} placeholder="URL Link" value={projectForm.link} onChange={(e)=>setProjectForm({...projectForm, link: e.target.value})} />
                                    )}
                                </div>
                                <button className="bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">Post Project</button>
                            </form>
                        </section>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-gray-400 px-2 tracking-widest">Your Detailed Portfolio</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                {projects.map(p => (
                                    <div key={p._id} className={`p-6 border rounded-[1.5rem] flex flex-col sm:flex-row justify-between items-start sm:items-center group transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                                        <div className="mb-4 sm:mb-0">
                                            <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-black'}`}>{p.title}</h4>
                                            <div className="flex gap-2 items-center mt-1">
                                                <span className="text-[9px] font-black text-blue-500 uppercase px-2 py-0.5 bg-blue-50/10 rounded-md border border-blue-500/20">{p.status}</span>
                                                {p.isDeployed && <a href={p.link} target="_blank" rel="noreferrer" className="text-[9px] font-black text-green-500 underline">Live Demo</a>}
                                            </div>
                                            <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{p.description}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {p.techStack?.map(t => <span key={t} className={`text-[8px] font-bold uppercase ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>#{t}</span>)}
                                            </div>
                                        </div>
                                        <div className="flex gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setIsEditing(p._id); setProjectForm({...p, techStack: Array.isArray(p.techStack) ? p.techStack.join(', ') : p.techStack}); }} className="text-blue-600 font-bold text-xs hover:underline">Edit</button>
                                            <button onClick={() => deleteProject(p._id)} className="text-red-500 font-bold text-xs hover:underline">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CONNECTIONS VIEW --- */}
                {view === 'connections' && !selectedPeer && (
                    <div className="space-y-12 animate-in fade-in duration-500">
                        <section className="space-y-6">
                            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 rounded-[2rem] border shadow-sm gap-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                                <h2 className={`text-2xl font-black italic ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Network Hub</h2>
                                <div className="flex gap-3 w-full sm:w-1/2">
                                    <input 
                                        className={`flex-1 p-3 rounded-2xl border outline-none focus:border-blue-400 text-sm ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-50 text-black border-gray-100'}`} 
                                        placeholder="Search peers..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button onClick={handleSearch} className="bg-blue-600 text-white px-8 rounded-2xl font-black text-sm hover:bg-blue-700 shadow-md">Find</button>
                                </div>
                            </div>

                            <h2 className={`text-xl font-black italic px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>My Network</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {user.connections?.map(conn => (
                                    <div key={conn._id} className={`p-6 border rounded-[2rem] shadow-sm transition-all flex flex-col gap-4 ${isDark ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white border-green-100 hover:border-green-500'}`}>
                                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedPeer(conn)}>
                                            <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center font-bold uppercase shrink-0">{conn.name[0]}</div>
                                            <div className="overflow-hidden">
                                                <h4 className={`font-black text-lg truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{conn.name}</h4>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">View Detailed Portfolio</p>
                                            </div>
                                        </div>
                                        {/* ADDED: REMOVE BUTTON */}
                                        <button onClick={() => handleRemoveConnection(conn._id)} className={`w-full py-2 rounded-xl text-[10px] font-black transition-colors ${isDark ? 'bg-slate-700 text-red-400 hover:bg-red-900/20' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>REMOVE CONNECTION</button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h2 className={`text-xl font-black italic px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Discover Peers</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {(searchResults.length > 0 ? searchResults : allUsers).map(u => {
                                    const isConnected = user.connections?.some(c => c._id === u._id);
                                    return (
                                        <div key={u._id} className={`p-6 lg:p-8 rounded-[2.5rem] border shadow-sm space-y-6 hover:shadow-md transition ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className={`text-2xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{u.name}</h4>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {u.skills?.map(s => <span key={s} className="text-[9px] font-black bg-blue-50/10 text-blue-400 px-2 py-1 rounded uppercase border border-blue-400/20">{s}</span>)}
                                                    </div>
                                                </div>
                                                {!isConnected && <button onClick={() => sendConnectionRequest(u._id, u.name)} className="bg-blue-600 text-white px-6 py-2 rounded-2xl text-xs font-black transform hover:scale-105 transition shadow-lg shadow-blue-500/20">Connect</button>}
                                                {isConnected && <span className="text-[10px] font-black text-green-500 uppercase px-4 py-2 border border-green-100/20 rounded-2xl bg-green-50/10">Member</span>}
                                            </div>

                                            <div className="pt-4 border-t border-gray-700/50 space-y-4">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Portfolio Preview</p>
                                                {u.projects?.length > 0 ? u.projects.slice(0, 2).map(p => (
                                                    <div key={p._id} className={`p-4 rounded-[1.5rem] border space-y-2 ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-gray-100'}`}>
                                                        <div className="flex justify-between items-center">
                                                            <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{p.title}</span>
                                                            <div className="flex gap-2">
                                                                <span className="text-blue-500 font-black text-[8px] uppercase px-2 py-0.5 bg-blue-50/10 rounded-md border border-blue-500/20">{p.status}</span>
                                                                {p.isDeployed && p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-[8px] font-black text-green-600 underline">LIVE DEMO 🚀</a>}
                                                            </div>
                                                        </div>
                                                        <p className={`text-[11px] leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{p.description}</p>
                                                    </div>
                                                )) : <p className="text-[10px] text-gray-500 italic">No projects posted yet.</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                )}

                {/* PEER PROFILE VIEW, INBOX, and SETTINGS views updated with responsiveness and isDark logic... */}
                {selectedPeer && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <button onClick={() => setSelectedPeer(null)} className={`font-bold text-sm px-4 py-2 rounded-full transition-colors ${isDark ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>← Back to Network</button>
                        <header className="bg-blue-600 p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                            <h2 className="text-3xl lg:text-5xl font-black tracking-tighter">{selectedPeer.name}</h2>
                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
                                <a href={`mailto:${selectedPeer.email}`} className="bg-white/20 px-5 py-3 rounded-2xl text-sm font-black backdrop-blur-xl hover:bg-white/30 transition text-center truncate">📧 {selectedPeer.email}</a>
                                {selectedPeer.linkedIn && <a href={selectedPeer.linkedIn} target="_blank" rel="noreferrer" className="bg-white/20 px-5 py-3 rounded-2xl text-sm font-black backdrop-blur-xl hover:bg-white/30 transition text-center">🔗 LinkedIn</a>}
                                {selectedPeer.githubProfile && <a href={selectedPeer.githubProfile} target="_blank" rel="noreferrer" className="bg-white/20 px-5 py-3 rounded-2xl text-sm font-black backdrop-blur-xl hover:bg-white/30 transition text-center">💻 GitHub</a>}
                            </div>
                        </header>
                        <div className="space-y-6">
                            <h3 className={`text-2xl font-black italic px-2 underline decoration-blue-400 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Project Portfolio</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedPeer.projects?.length > 0 ? selectedPeer.projects.map(p => (
                                    <div key={p._id} className={`p-8 rounded-[2.5rem] space-y-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className={`font-black text-2xl ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{p.title}</h4>
                                                <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50/10 px-2 py-1 rounded-md border border-blue-500/20">{p.status}</span>
                                            </div>
                                            {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-[10px] bg-green-500 text-white px-4 py-2 rounded-full font-black uppercase shadow-lg shadow-green-500/20">Live Demo 🚀</a>}
                                        </div>
                                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{p.description}</p>
                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700/50">
                                            {p.techStack?.map(t => <span key={t} className={`text-[10px] font-black px-3 py-1 rounded ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>#{t}</span>)}
                                        </div>
                                    </div>
                                )) : <p className="text-gray-500 italic p-4">No projects detailed yet.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* INBOX VIEW */}
                {view === 'notifications' && (
                    <div className="max-w-2xl space-y-6 animate-in fade-in">
                        <h1 className={`text-4xl font-black italic ${isDark ? 'text-white' : 'text-slate-800'}`}>Inbox</h1>
                        {notifications.map((n) => (
                            <div key={n._id} className={`p-6 border rounded-[2rem] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl uppercase shrink-0">{n.senderName ? n.senderName[0] : "?"}</div>
                                    <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{n.message}</p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button onClick={() => handleAccept(n)} className="flex-1 sm:flex-none bg-blue-600 text-white px-5 py-2 rounded-xl text-[10px] font-black hover:bg-blue-700 transition">ACCEPT</button>
                                    <button onClick={() => handleReject(n._id)} className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-[10px] font-black transition ${isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>DECLINE</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* SETTINGS VIEW */}
                {view === 'settings' && (
                    <div className="max-w-2xl space-y-8 animate-in fade-in">
                        <h1 className={`text-4xl font-black italic ${isDark ? 'text-white' : 'text-slate-800'}`}>Settings</h1>
                        <div className={`p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] shadow-sm border space-y-8 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                            
                            <div className="space-y-4">
                                <h3 className={`text-xl font-black italic px-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Edit My Skillset</h3>
                                <div className={`flex flex-wrap gap-2 p-4 rounded-[1.5rem] lg:rounded-[2rem] min-h-[80px] ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    {skills.map(s => (
                                        <div key={s} className={`flex items-center gap-2 border px-3 py-1.5 rounded-full text-xs font-bold ${isDark ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-gray-200 text-slate-700'}`}>
                                            <span>{s}</span>
                                            <button onClick={() => handleRemoveSkill(s)} className="text-red-400 hover:text-red-600 text-base">×</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <input className={`flex-1 p-4 rounded-2xl border outline-none focus:border-blue-400 ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-50 text-black border-gray-200'}`} placeholder="Add skill..." value={newSkill} onChange={(e)=>setNewSkill(e.target.value)} />
                                    <button onClick={handleAddSkill} className="bg-blue-600 text-white px-8 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">+</button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-8 border-t border-gray-700/50">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase ml-2">LinkedIn URL</label>
                                    <input className={`w-full p-4 rounded-2xl border outline-none focus:border-blue-400 ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-50 text-black border-gray-200'}`} value={user.linkedIn || ""} onChange={(e) => setUser({...user, linkedIn: e.target.value})} placeholder="https://linkedin.com/..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase ml-2">GitHub URL</label>
                                    <input className={`w-full p-4 rounded-2xl border outline-none focus:border-blue-400 ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-50 text-black border-gray-200'}`} value={user.githubProfile || ""} onChange={(e) => setUser({...user, githubProfile: e.target.value})} placeholder="https://github.com/..." />
                                </div>
                                <button onClick={async () => {
                                    try {
                                        await axios.put(`${API}/api/auth/settings/${userId}`, user);
                                        alert("Contact links updated!");
                                    } catch (err) { alert("Update failed"); }
                                }} className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition">Save Professional Links</button>
                            </div>

                            <div className={`flex justify-between items-center p-6 rounded-[2rem] ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                <div><h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Visual Mode</h3><p className="text-xs text-gray-400">Toggle dark/light dashboard</p></div>
                                <button onClick={updateTheme} className={`w-14 h-8 rounded-full transition-colors relative ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isDark ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;