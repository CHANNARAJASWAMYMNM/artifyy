const SellerProfile = require('../models/SellerProfile');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get current seller profile
// @route   GET /api/sellers/profile/me
// @access  Private (Seller only)
exports.getMyProfile = async (req, res) => {
  try {
    let profile = await SellerProfile.findOne({ user: req.user._id });
    
    // Auto-create profile if missing for seller role
    if (!profile && req.user.role === 'seller') {
      profile = await SellerProfile.create({
        user: req.user._id,
        shopName: `${req.user.name}'s Shop`,
        story: 'No story provided yet. Please update your profile.',
        location: 'Not specified',
        craftType: 'General Handcrafts',
      });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create or update seller profile
// @route   POST /api/sellers/profile
// @access  Private (Seller only)
exports.updateProfile = async (req, res) => {
  const { shopName, story, location, craftType, avatar, banner, bankDetails } = req.body;

  try {
    let profile = await SellerProfile.findOne({ user: req.user._id });

    const profileFields = {
      user: req.user._id,
      shopName,
      story,
      location,
      craftType,
      avatar,
      banner,
      bankDetails: bankDetails || {},
    };

    if (profile) {
      // Update (retain status unless admin resets it, but let's keep status intact)
      profile = await SellerProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true, runValidators: true }
      );
    } else {
      // Create
      profileFields.status = 'pending'; // new registration is pending
      profile = await SellerProfile.create(profileFields);
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get seller profile by user ID (Public)
// @route   GET /api/sellers/profile/:id
// @access  Public
exports.getSellerProfileById = async (req, res) => {
  try {
    const profile = await SellerProfile.findOne({ user: req.params.id }).populate('user', 'name email');
    
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Artisan profile not found' });
    }

    // Also fetch their active products
    const products = await Product.find({ seller: req.params.id });

    res.status(200).json({
      success: true,
      profile,
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all seller applications
// @route   GET /api/sellers/all
// @access  Private (Admin only)
exports.getAllSellers = async (req, res) => {
  try {
    const profiles = await SellerProfile.find().populate('user', 'name email role');
    res.status(200).json({ success: true, profiles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Approve/Reject seller profile status
// @route   PUT /api/sellers/approve/:id
// @access  Private (Admin only)
exports.approveSeller = async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status type' });
  }

  try {
    let profile = await SellerProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Seller profile not found' });
    }

    profile.status = status;
    await profile.save();

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
