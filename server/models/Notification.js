const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    senderName: String,
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['connection_request', 'project_invite', 'general'], 
        default: 'general' 
    },
    status: { 
        type: String, 
        enum: ['unread', 'read'], 
        default: 'unread' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);