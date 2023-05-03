const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    name :{
        type: String,
        required: true
    },
    cart: {
        type: Object,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: false,
        default: Date.now
    },
    address: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('order',orderSchema);