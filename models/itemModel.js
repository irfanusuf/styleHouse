const mongoose = require ("mongoose")


const Item = mongoose.model("Item" , {

    name : String,
    category : String,
    price : Number,
    discount : Number,
    imageUrl : String,
    searchTag: String
    

})


module.exports = Item