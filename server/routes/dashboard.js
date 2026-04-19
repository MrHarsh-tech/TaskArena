const express = require('express');
const router = express.Router();
const { getDashboardStats, getStudentAnalytics, getInstructorAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDashboardStats);
router.get('/student-analytics', protect, getStudentAnalytics);
router.get('/instructor-analytics', protect, getInstructorAnalytics);

module.exports = router;
