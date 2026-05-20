const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const jwt = require('jsonwebtoken');

// Helper to sign JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretartifykey12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer', // default to customer
    });

    // If role is seller, create a pending SellerProfile
    if (user.role === 'seller') {
      await SellerProfile.create({
        user: user._id,
        shopName: `${name}'s Shop`,
        story: 'No story provided yet. Please update your profile.',
        location: 'Not specified',
        craftType: 'General Handcrafts',
        status: 'pending', // Admins must approve
      });
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // If user is a seller, check their profile status
    let sellerStatus = null;
    if (user.role === 'seller') {
      const profile = await SellerProfile.findOne({ user: user._id });
      if (profile) {
        sellerStatus = profile.status;
      }
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerStatus, // returns 'pending', 'approved', 'rejected'
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    let sellerStatus = null;
    if (req.user.role === 'seller') {
      const profile = await SellerProfile.findOne({ user: req.user._id });
      if (profile) {
        sellerStatus = profile.status;
      }
    }

    res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        sellerStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
