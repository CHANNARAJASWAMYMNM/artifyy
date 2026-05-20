const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const SellerProfile = require('../models/SellerProfile');

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
exports.getAnalytics = async (req, res) => {
  try {
    // 1. User & Artisan counts
    const totalUsers = await User.countDocuments();
    const customerCount = await User.countDocuments({ role: 'customer' });
    const sellerCount = await User.countDocuments({ role: 'seller' });
    const pendingSellers = await SellerProfile.countDocuments({ status: 'pending' });
    const approvedSellers = await SellerProfile.countDocuments({ status: 'approved' });

    // 2. Order counts and revenue
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.find({ paymentStatus: 'paid' });
    
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 3. Category Sales breakdown
    // Let's aggregate sales by category from paid orders
    const allPaidOrders = await Order.find({ paymentStatus: 'paid' });
    const categorySales = {};
    
    // Initialize standard categories
    const categories = ['Pottery', 'Clay Sculptures', 'Jewelry', 'Home Decor', 'Kitchenware', 'Paintings', 'Other'];
    categories.forEach(cat => { categorySales[cat] = 0; });

    allPaidOrders.forEach(order => {
      order.items.forEach(item => {
        // We can't guarantee category is on the item directly, but we can look it up or estimate.
        // To be safe, let's assume we can fetch categories or we store a default.
        // Since we didn't store category on the order item, let's look up the products dynamically.
        // Wait, for speed, let's fetch the category of the item. To do this asynchronously:
        // We can write a simple category tally.
      });
    });

    // Let's populate the products on items to sum by category
    const ordersWithProducts = await Order.find({ paymentStatus: 'paid' }).populate('items.product');
    ordersWithProducts.forEach(order => {
      order.items.forEach(item => {
        if (item.product && item.product.category) {
          const cat = item.product.category;
          categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
        } else {
          categorySales['Other'] = (categorySales['Other'] || 0) + (item.price * item.quantity);
        }
      });
    });

    // 4. Recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Recent registered users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Platform commission estimate (e.g. 10%)
    const commissionRate = 0.10;
    const platformEarnings = Math.round(totalRevenue * commissionRate * 100) / 100;

    res.status(200).json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          customers: customerCount,
          sellers: sellerCount,
        },
        sellersStatus: {
          pending: pendingSellers,
          approved: approvedSellers,
        },
        orders: {
          total: totalOrders,
          paid: paidOrders.length,
          revenue: Math.round(totalRevenue * 100) / 100,
          platformEarnings,
        },
        categorySales,
        recentOrders,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!['customer', 'seller', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role' });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.role = role;
    await user.save();

    // If changing to seller, make sure profile exists
    if (role === 'seller') {
      const profileExists = await SellerProfile.findOne({ user: user._id });
      if (!profileExists) {
        await SellerProfile.create({
          user: user._id,
          shopName: `${user.name}'s Shop`,
          story: 'No story provided yet. Please update your profile.',
          location: 'Not specified',
          craftType: 'General Handcrafts',
          status: 'approved', // auto-approve when admin sets the role
        });
      } else {
        profileExists.status = 'approved';
        await profileExists.save();
      }
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
