const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateProfile,
  getSellerProfileById,
  getAllSellers,
  approveSeller,
} = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/auth');

// Public route to view seller details and products
router.get('/profile/:id', getSellerProfileById);

// Protected routes (Seller / Admin)
router.get('/profile/me', protect, authorize('seller'), getMyProfile);
router.post('/profile', protect, authorize('seller'), updateProfile);

// Admin-only routes
router.get('/all', protect, authorize('admin'), getAllSellers);
router.put('/approve/:id', protect, authorize('admin'), approveSeller);

module.exports = router;
