const mongoose = require("mongoose")

//Definicion de Schema

const productSchema = new mongoose.Schema({
productName:{
    type: String,
    required: true,
    index: true,
},
productSize:{
    type: Number,
    required: true,
},
UM:{
    type: String,
    required: true,
},
price:{
    type: Number,
    required: true,
},
image:{
    type:String,
    default: null,
},
deleted:{
    type: Boolean,
    default: false,
}
})

module.exports = mongoose.model("product", productSchema)