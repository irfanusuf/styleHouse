const mongoose = require ("mongoose")


const Product = mongoose.model("Product" , {

    name : String,
    category : String,
    searchTag: String,
    size :String,
    color : String,
    price : Number,
    discount : Number,
    itemQty : Number,
    imageUrl : String,
    
   
    

})


module.exports = Product