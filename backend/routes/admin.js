const express = require('express');
const router = express.Router();
const { getAnalytics, updateUserRole, getAllUsers } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are admin-only
router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
