const User = require('../models/User');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// --- 1. AUTHENTICATION ---
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const newUser = new User({ name, email, password, skills: [], theme: 'light', connections: [] });
        await newUser.save();
        res.status(201).json({ message: "Registered successfully!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(400).json({ message: "Invalid credentials" });
        res.status(200).json({ user: { id: user._id, name: user.name, email: user.email, theme: user.theme } });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- 2. PROFILE & SETTINGS ---
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password')
            // Updated to populate more fields for connected users
            .populate('connections', 'name skills email linkedIn githubProfile'); 
        res.status(200).json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateSettings = async (req, res) => {
    try {
        // Included social links in the update logic
        const updated = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true }).select('-password');
        res.status(200).json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateSkills = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, { skills: req.body.skills }, { new: true });
        res.status(200).json(user.skills);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- 3. DISCOVERY & SEARCH ---
exports.getAllUsers = async (req, res) => {
    try {
        // 1. Get all users
        const users = await User.find({ _id: { $ne: req.params.userId } })
            .select('-password')
            .lean();

        // 2. Attach projects to each user manually for discovery portfolio view
        const usersWithProjects = await Promise.all(users.map(async (u) => {
            const projects = await Project.find({ owner: u._id });
            return { ...u, projects };
        }));

        res.status(200).json(usersWithProjects);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const users = await User.find({
            $or: [{ name: { $regex: query, $options: 'i' } }, { skills: { $regex: query, $options: 'i' } }]
        }).select('-password').lean();

        // Attach projects to search results as well
        const resultsWithProjects = await Promise.all(users.map(async (u) => {
            const projects = await Project.find({ owner: u._id });
            return { ...u, projects };
        }));

        res.status(200).json(resultsWithProjects);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- 4. NETWORKING & NOTIFICATIONS ---
exports.sendConnectionRequest = async (req, res) => {
    try {
        const { senderId, senderName, receiverId } = req.body;
        const newNotif = new Notification({
            recipient: receiverId, sender: senderId, senderName,
            message: `${senderName} wants to connect!`, type: 'connection_request'
        });
        await newNotif.save();
        res.status(201).json({ message: "Request sent!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.acceptRequest = async (req, res) => {
    try {
        const { notificationId, senderId, recipientId } = req.body;
        await User.findByIdAndUpdate(recipientId, { $addToSet: { connections: senderId } });
        await User.findByIdAndUpdate(senderId, { $addToSet: { connections: recipientId } });
        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({ message: "Accepted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.rejectRequest = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.notificationId);
        res.status(200).json({ message: "Declined" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- 5. PROJECTS ---
exports.addProject = async (req, res) => {
    try {
        const { userId, title, description, techStack, status, isDeployed, link, githubRepo } = req.body;
        const newProject = new Project({ 
            owner: userId, 
            title,
            description,
            // Handling techStack as array if passed as array, or string-split if passed as string
            techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map(s => s.trim()) : []),
            status: status || "Idea",
            isDeployed: isDeployed || false,
            link: link || "",
            githubRepo: githubRepo || ""
        });
        await newProject.save();
        res.status(201).json(newProject);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getUserProjects = async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateProject = async (req, res) => {
    try {
        const updated = await Project.findByIdAndUpdate(req.params.projectId, req.body, { new: true });
        res.status(200).json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.projectId);
        res.status(200).json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
// --- 2. PROFILE & SETTINGS (Updated for Collaboration) ---
exports.getProfile = async (req, res) => {
    try {
        // 1. Fetch user and populate basic connection info
        const user = await User.findById(req.params.userId)
            .select('-password')
            .populate('connections', 'name skills email linkedIn githubProfile')
            .lean(); // Use lean for faster processing

        if (!user) return res.status(404).json({ message: "User not found" });

        // 2. Attach projects to each connection so their portfolio is visible
        const connectionsWithProjects = await Promise.all(
            user.connections.map(async (conn) => {
                const projects = await Project.find({ owner: conn._id });
                return { ...conn, projects }; // Merge projects into the connection object
            })
        );

        // 3. Return user with fully populated connection data
        res.status(200).json({ ...user, connections: connectionsWithProjects });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
// --- Updated Search Logic to include Skills ---
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } }, 
                { skills: { $regex: query, $options: 'i' } } // Now searches skills
            ]
        }).select('-password').lean();

        // Attach projects to search results
        const resultsWithProjects = await Promise.all(users.map(async (u) => {
            const projects = await Project.find({ owner: u._id });
            return { ...u, projects };
        }));

        res.status(200).json(resultsWithProjects);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
// --- REMOVE CONNECTION ---
exports.removeConnection = async (req, res) => {
    try {
        const { userId, targetId } = req.body;

        // Remove target from user's connections
        await User.findByIdAndUpdate(userId, { $pull: { connections: targetId } });
        // Remove user from target's connections
        await User.findByIdAndUpdate(targetId, { $pull: { connections: userId } });

        res.status(200).json({ message: "Connection removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};