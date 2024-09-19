const  mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the User who placed the order
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },  // Reference to the Product model
        quantity: { type: Number, required: true },  // Quantity of the product ordered
       
      }
    ],
    totalAmount: { type: Number, required: true }, // Total amount of the order
    orderDate: { type: Date, default: Date.now },  // Date when the order was placed
    status: { type: String, default: 'pending' }   // Status of the order (e.g., pending, shipped, completed)
  });
  
  const Order = mongoose.model('Order', orderSchema);
  

  module.exports = Order