const mongoose = require('mongoose');

const sellerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    shopName: {
      type: String,
      required: [true, 'Please add a shop name'],
      trim: true,
    },
    story: {
      type: String,
      required: [true, 'Please share your craft story or biography'],
    },
    location: {
      type: String,
      required: [true, 'Please specify your location (e.g., city, state/country)'],
    },
    craftType: {
      type: String,
      required: [true, 'Specify your craft (e.g., Clay Pottery, Hand-woven Rugs)'],
    },
    avatar: {
      type: String,
      default: '', // URL
    },
    banner: {
      type: String,
      default: '', // URL
    },
    bankDetails: {
      accountHolder: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      upiId: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SellerProfile', sellerProfileSchema);
