'use strict';
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
  createdAt: {
    type: Date,
    expires: config.get('paste.ttl')
  }
}, {timestamps: true});

pasteSchema.index({expireAt: 1}, {expireAfterSeconds: 0});

pasteSchema.statics.getRecent = function(num) {
  return this.find()
  .where('listed', true)
  .select({
    _id: 0,
    slug: 1,
    tags: 1,
    title: 1
  })
  .sort({updatedAt: -1})
  .limit(num)
  .lean().exec();
}

pasteSchema.statics.newPaste = function(data) {
  const settings = {
    title: data.title || 'Untitled',
    tags: data.tags || [],
    content: data.content || null,
    slug: shortid.generate(),
    userId: data.userId || "",
    listed: ('listed' in data) ? data.listed : true,
    views: 0,
    createdBy: data.ip || 'Unknown'
  };
  return new this(settings);
}


module.exports = mongoose.model('Paste', pasteSchema);