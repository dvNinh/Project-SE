const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Cart = new Schema({
    username: { type: String },
    productId: { type: String },
    quantity: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Cart', Cart);
