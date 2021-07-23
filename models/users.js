var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String
})

var UserModel = mongoose.model('users', userSchema)

module.exports = UserModel;