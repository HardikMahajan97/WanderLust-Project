const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
    folder: 'wanderlust_DEV',
    allowedFormats: ["png", "jpg", "jpeg"],
    },
});

module.exports = {
    cloudinary,
    storage,
}


//What this file is actually doing:::

/*Dekh bhai, mujhe bhi jayda kuch samaj nhi aya h ye abhi toh. But general set up h bas
for using cloud. Abhi cloudinary.config() wala jo method h usme apan apne credentials daal rhe h.
CloudName hota h , apiKey hita h, apiSecret hota h  aisa sab .
const storage jo cheez h vo toh copy paste h google se. documentation from npm multer storage cloudinary se.
Usme shyd jyada kuch nhi bas cloudinary use kr rhe h aisa and konse format allowed hone chahiye ye sab h .
Usi storage ko apan export kr rhe h .*/
