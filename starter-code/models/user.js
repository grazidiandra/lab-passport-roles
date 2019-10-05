const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: String,
    role: {type: String, enum: ['Boss', 'Developer', 'TA'], default: 'TA'},
    password: String,
    favoriteFood: String,
    favoriteCharacter: String,
    favoriteColor: String
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
