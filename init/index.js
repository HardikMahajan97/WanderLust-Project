const mongoose= require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL= 'mongodb://127.0.0.1:27017/wanderlust';
main() 
    .then(() =>{
        console.log("Connected to Wanderlust DATABASE!");  
    })
    .catch(err => console.log(err));


async function main() { 
    await mongoose.connect(MONGO_URL);  
}

const intiDB = async() =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner:"668531898ce661f584f600ce"}));
    await Listing.insertMany(initData.data);
    console.log("Data was intialised");
};

intiDB();

