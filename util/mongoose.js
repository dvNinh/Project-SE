const mongoose = require('mongoose');

module.exports = {
    multipleMongooseToObject: function(mongooseArrays) {
        if (Array.isArray(mongooseArrays)) {
            return mongooseArrays.map(mongooseArray => mongooseArray.toObject());
        } else {
            return mongooseArrays;
        }
    }, // su dung khi doi tuong tra ve la 1 array

    mongooseToObject: function(mongoose) {
            if (mongoose instanceof mongoose.Model) {
                return mongoose.toObject();
            } else {
                return mongoose;
            }
        } // su dung khi doi tuong la 1 cai thoi 
};