const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema({
  gcsKey: {
    type: String,
    required: true,
    unique: true
  },
  originalName: String,
  contentType: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

let FileModel;



module.exports = FileModel;