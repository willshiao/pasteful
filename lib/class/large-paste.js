'use strict'

const Promise = require('bluebird')

const gfs = require('../gfs').gfs
const db = require('../gfs').conn.db
const collection = db.collection('fs.files')
const shortid = require('shortid')

class LargePaste {
  constructor (data) {
    const id = data.filename || data.id || data.slug || shortid.generate()
    this._raw = {
      filename: id,
      mode: 'w',
      content_type: 'plain/text',
      metadata: {
        title: data.title || 'Untitled',
        slug: id,
        tags: data.tags || [],
        createdBy: data.ip || data.createdBy || '',
        views: 0,
        listed: (data.listed === undefined) ? false : data.listed
      }
    }
  }

  getWriteStream () {
    return gfs.createWriteStream(this._raw)
  }

  static getReadStream (slug) {
    return gfs.createReadStream({
      filename: slug
    })
  }

  static getView (slug) {
    return collection.updateOneAsync({ filename: slug }, {
      $inc: { 'metadata.views': 1 }
    }).then(() => {
      return Promise.resolve(this.getReadStream(slug))
    })
  }

  static getRecent (n) {
    if (n === undefined || n <= 0) n = 10
    return collection.find({}, {
      _id: 0,
      'metadata.slug': 1,
      uploadDate: 1
    }, { limit: n }).toArrayAsync()
  }

  static delete (paste) {
    return gfs.removeAsync(paste)
  }
}

module.exports = LargePaste
