const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    firstname : String,
    lastname : String,
    mail : String,
    password : String,
    adress : String,
    profression : String,
    token : String,
    subsciption : Date,
    patients : [{ type: mongoose.Schema.Types.ObjectId, ref:'patients'}]
})

const User = mongoose.model('users',userSchema)
module.exports = User