const  mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },  
        quantity: { type: Number, required: true },  
        price : {type :Number},
        size :{type:String},
        color : {type :String}
      }
    ],
    address: [
      {
        fullname:String,
        street: String,
        city: String,
        state: String,
        contact: String,
        postalCode: String,
        landMark: String,
        country: String,
      }
    ],
    totalAmount: { type: Number, required: true }, 
    orderDate: { type: Date, default: Date.now },  
    shippingTime: { type: Date, default: () => new Date(new Date().setDate(new Date().getDate() + 7)) },
    emailVerified : {type : Boolean , default : false},
    isPaymentDone : {type : Boolean , default : false},
    cancelRequest : {type : Boolean , default : false},
    refunded : {type : Boolean , default : false},
    status: { type: String, default: 'pending' } , 
  });
  
  const Order = mongoose.model('Order', orderSchema);
  

  module.exports = Order