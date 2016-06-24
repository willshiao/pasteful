const mongoose = require('mongoose');
const shortid = require('shortid');
const config = require('config');
const Schema = mongoose.Schema;

const pasteSchema = new Schema({
  title: String, //Title of the paste (optional)
  tags: [String], //Any tags (optional)
  content: String, //Paste content
  slug: String, //URL slug for the paste
  password: String, //The password hash (optional)
  salt: String, //The password salt (optional)
  userId: String, //User identifier for the paste (optional)
  listed: Boolean, //Whether or not it is listed in new pastes
  views: Number, //Number of page views
  createdBy: String, //IP of creator,
  createdAt: {type: Date, index: {expireAfterSeconds: config.get('paste.ttl')}}
}, {timestamps: true});

pasteSchema.statics.newPaste = function(data) {
  const settings = {
    title: data.title || "",
    tags: data.tags || [],
    content: data.content || null,
    slug: shortid.generate(),
    userId: data.userId || "",
    listed: ('listed' in data) ? data.listed : true,
    views: 0,
    createdBy: data.ip || 'unknown'
  };
  return new this(settings);
}


module.exports = mongoose.model('Paste', pasteSchema);