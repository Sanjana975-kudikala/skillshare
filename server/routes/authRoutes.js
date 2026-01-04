const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// --- 1. AUTHENTICATION ---
router.post('/register', authController.register);
router.post('/login', authController.login);

// --- 2. PROFILE & SETTINGS ---
router.get('/profile/:userId', authController.getProfile);
router.put('/settings/:userId', authController.updateSettings);
router.put('/update-skills/:userId', authController.updateSkills);

// --- 3. SEARCH & NETWORKING ---
router.get('/search', authController.searchUsers);
router.get('/all-users/:userId', authController.getAllUsers); 
router.post('/send-request', authController.sendConnectionRequest);
router.get('/notifications/:userId', authController.getNotifications);

// Connection Handlers
router.post('/accept-request', authController.acceptRequest);
router.delete('/reject-request/:notificationId', authController.rejectRequest);

// --- 4. PROJECT MANAGEMENT ---
router.post('/add-project', authController.addProject);
router.get('/user-projects/:userId', authController.getUserProjects);
router.put('/project/:projectId', authController.updateProject);
router.delete('/project/:projectId', authController.deleteProject);
router.post('/remove-connection', authController.removeConnection);
module.exports = router;