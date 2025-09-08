const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  deliveryTime: { 
    type: String, 
    required: true,
    enum: ['10 AM', '11 AM', '12 PM']
  },
  deliveryLocation: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  message: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'processing', 'shipped', 'delivered']
  }
});

module.exports = mongoose.model('Order', orderSchema);