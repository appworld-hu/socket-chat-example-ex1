const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    color: String,
    created_at: {type:Date, default: Date.now}
})

module.exports = userSchema;