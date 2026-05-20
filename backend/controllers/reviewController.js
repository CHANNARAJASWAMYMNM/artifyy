const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Add review for a product
// @route   POST /api/reviews/:productId
// @access  Private (Customer only)
exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.productId;

  try {
    // 1. Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // 2. Prevent reviews from the product owner
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'You cannot review your own product' });
    }

    // 3. Verify customer purchased this product
    const hasPurchased = await Order.findOne({
      customer: req.user._id,
      'items.product': productId,
      // Optional: require it to be delivered
      // 'items.status': 'delivered'
    });

    if (!hasPurchased) {
      return res.status(400).json({
        success: false,
        error: 'You can only review products you have purchased from Artify.',
      });
    }

    // 4. Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      product: productId,
      customer: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, error: 'Product already reviewed by you' });
    }

    // 5. Create review
    const review = await Review.create({
      product: productId,
      customer: req.user._id,
      customerName: req.user.name,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
