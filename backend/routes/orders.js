const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderItemStatus,
  getAllOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createOrder);
router.get('/my-orders', protect, authorize('customer'), getMyOrders);
router.get('/seller-orders', protect, authorize('seller'), getSellerOrders);
router.put('/status/:orderId/:itemId', protect, authorize('seller'), updateOrderItemStatus);

// Admin-only route
router.get('/all', protect, authorize('admin'), getAllOrders);

module.exports = router;
