module.exports = {
    multipleMongooseToObject: function(mongooses) {
        return mongooses.map(mongoose => mongoose ? mongoose.toObject() : null);
    },
    mongooseToObject: function(mongoose) {
        return mongoose ? mongoose.toObject() : mongoose;
    },
};