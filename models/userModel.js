
const mongoose = require("mongoose")

const User = mongoose.model("User",{

    username : String,
    email : String,
    password : String,
    street:String,
    landMark : String,
    city : String,
    State: String,
    isAdmin : Boolean,
    isEmailVerified : Boolean,
    cart : [],
})


module.exports = User