const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pasteSchema = new Schema({
  title: String, //Title of the paste (optional)
  tags: [String], //Any tags (optional)
  slug: String, //URL slug for the paste
  password: String, //The password hash (optional)
  userId: String, //User identifier for the paste (optional)
  listed: Boolean, //Whether or not it is listed in new pastes
  views: Number, //Number of page views
  createdBy: String //IP of creator
}, {timestamps: true});