const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Account = new Schema({
    username: { type: String },
    password: { type: String },
    type: { type: String, default: "User" },
}, { timestamps: true });

module.exports = mongoose.model('Account', Account);