const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    story: {
      type: String,
      required: [true, 'Please share the story or hand-making process behind this piece'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Pottery', 'Clay Sculptures', 'Jewelry', 'Home Decor', 'Kitchenware', 'Paintings', 'Other'],
    },
    images: {
      type: [String],
      required: [true, 'Please upload at least one image'],
    },
    stock: {
      type: Number,
      required: [true, 'Please specify the stock count'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
