const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Account = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        require: true
    },

    type: { type: String, default: "User" },

    cart: {
        type: Object,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Account', Account);