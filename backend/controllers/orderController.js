const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer only)
exports.createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, error: 'No order items' });
  }

  try {
    // 1. Validate stock & collect item details
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images[0],
        seller: product.seller, // Store the seller reference
        status: 'processing',
      });
    }

    // Mock payment details
    const paymentStatus = paymentMethod === 'COD' ? 'pending' : 'paid';
    const paymentResult =
      paymentMethod !== 'COD'
        ? {
            id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
            status: 'succeeded',
            update_time: new Date().toISOString(),
            email_address: req.user.email,
          }
        : {};

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      paymentResult,
      totalAmount,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer only)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get orders for a seller's products
// @route   GET /api/orders/seller-orders
// @access  Private (Seller only)
exports.getSellerOrders = async (req, res) => {
  try {
    // Find orders containing products owned by the seller
    const orders = await Order.find({ 'items.seller': req.user._id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    // Filter items inside the orders to only show this seller's products
    const filteredOrders = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(
        (item) => item.seller.toString() === req.user._id.toString()
      );
      return orderObj;
    });

    res.status(200).json({ success: true, orders: filteredOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update order item status
// @route   PUT /api/orders/status/:orderId/:itemId
// @access  Private (Seller only)
exports.updateOrderItemStatus = async (req, res) => {
  const { status } = req.body; // 'processing', 'shipped', 'delivered'

  if (!['processing', 'shipped', 'delivered'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Find the item in the order
    const item = order.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found in order' });
    }

    // Verify the seller owns the item
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update status of this item' });
    }

    item.status = status;

    // If the payment was COD and is now marked as delivered, set paymentStatus = paid
    if (order.paymentMethod === 'COD' && status === 'delivered') {
      // Check if all other items in order are also delivered, or just mark overall paymentStatus
      // For simplicity, if this item is delivered and was COD, we can mark the order's paymentStatus as paid or check if all items are delivered
      const allDelivered = order.items.every(i => i._id.toString() === item._id.toString() ? status === 'delivered' : i.status === 'delivered');
      if (allDelivered) {
        order.paymentStatus = 'paid';
      }
    }

    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders/all
// @access  Private (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
