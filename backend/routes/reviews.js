const express = require('express');
const router = express.Router();
const { addReview, getProductReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, authorize('customer'), addReview);

module.exports = router;
