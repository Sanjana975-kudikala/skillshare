const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { 
        type: String, 
        required: [true, "Project title is required"],
        trim: true 
    },
    description: { 
        type: String, 
        required: [true, "Description is required"] 
    },
    // Enhanced Stage/Status for better collaboration tracking
    status: { 
        type: String, 
        enum: ['Idea', 'Development', 'Testing', 'Completed'], 
        default: 'Idea' 
    },
    // Changed to Array for easier searching/filtering by technology
    techStack: { 
        type: [String], 
        default: [] 
    },
    isDeployed: { 
        type: Boolean, 
        default: false 
    },
    // Deployment link (e.g., Vercel, Netlify, GitHub Pages)
    link: { 
        type: String, 
        default: "" 
    },
    githubRepo: { 
        type: String, 
        default: "" 
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);