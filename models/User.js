const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['Dentiste', 'Prothesiste', 'Assistante']
  }
}, {
  timestamps: true,
});

userSchema.method({
  transform() {
    let obj = this.toObject();
    delete obj.password;
    return obj;
  },
});

userSchema.plugin(uniqueValidator);

let UserModel;

// Check if the model is already registered
if (mongoose.models.User) {
  UserModel = mongoose.model('User');
} else {
  UserModel = mongoose.model('User', userSchema);
}

module.exports = UserModel;
