const mongoose = require ("mongoose")


const Product = mongoose.model("Product" , {

    name : String,
    category : String,
    subCategory : String,
    searchTag: String,
    size : String,
    color : String,
    price : Number,
    discount : Number,  
    itemQty : Number,
    description : String,
    imageUrl : String,
    rating: { type: Number, default: 0 }, 
    reviews : [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            review : {type : String},
            star : {type : Number}
        }
    ]
    
   
    

})


module.exports = Product