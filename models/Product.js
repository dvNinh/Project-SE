const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema({
    name: { type: String },
    description: { type: String },
    price: { type: Number },
    image: { type: String },
    quantity: { type: Number },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    slug: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Product', Product);