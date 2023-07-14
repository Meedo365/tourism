const mongoose = require("mongoose")

const connectDb = () => {
    mongoose.connect(process.env.URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    mongoose.connection.on('open', () => console.log('Mongo Running'));
    mongoose.connection.on('error', (err) => console.log(err));
}

module.exports = connectDb