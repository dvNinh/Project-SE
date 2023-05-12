const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = new Schema({
    username: { type: String },
    userAvatar: { type: String },
    productId: { type: String },
    content: { type: String },
    star: { type: Number, enum: [1, 2, 3, 4, 5], default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Comment', Comment);
