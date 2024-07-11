const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const userSchema = new Schema({
    email :{
        type:String,
        reuired: true,
    },
});

//The below mf thing will add automatically the USERNAME, SALTING and HASHING to the page. Thus we use this plugin.
userSchema.plugin(passportLocalMongoose); 

module.exports = mongoose.model("User", userSchema);