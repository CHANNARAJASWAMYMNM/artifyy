const Product = require('../models/Product');
const SellerProfile = require('../models/SellerProfile');

// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, seller, sort } = req.query;
    
    let query = {};

    // Search by product name or description
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by seller (artisan)
    if (seller) {
      query.seller = seller;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sorting query
    let sortBy = { createdAt: -1 }; // default sorting: latest
    if (sort) {
      if (sort === 'priceAsc') sortBy = { price: 1 };
      else if (sort === 'priceDesc') sortBy = { price: -1 };
      else if (sort === 'rating') sortBy = { rating: -1 };
    }

    const products = await Product.find(query)
      .populate('seller', 'name')
      .sort(sortBy);

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Fetch the seller profile as well to show story in frontend
    const sellerProfile = await SellerProfile.findOne({ user: product.seller._id });

    res.status(200).json({ success: true, product, sellerProfile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Seller only)
exports.createProduct = async (req, res) => {
  const { name, description, story, price, category, images, stock } = req.body;

  try {
    // 1. Check if seller profile is approved
    const profile = await SellerProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(400).json({ success: false, error: 'No seller profile found. Please create a profile first.' });
    }
    if (profile.status !== 'approved') {
      return res.status(403).json({
        success: false,
        error: `Your seller profile status is currently '${profile.status}'. You can only list products once approved by an admin.`,
      });
    }

    // 2. Create product
    const product = await Product.create({
      seller: req.user._id,
      name,
      description,
      story,
      price,
      category,
      images: images || ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80'], // Fallback mockup pottery image
      stock: stock || 0,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller or Admin)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Make sure user is product owner or admin
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Seller or Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Make sure user is product owner or admin
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this product' });
    }

    await product.deleteOne();

    res.status(200).json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
