const mongoose = require('mongoose');
const urlConnect = 'mongodb://127.0.0.1:27017/btl';

async function connect() {
    try {
        await mongoose.connect(urlConnect, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected successfully');
    } catch (err) {
        console.log(`Connected failed (Error: ${err.message})`);
    }
}

module.exports = { connect };