'use strict';

const chai = require('chai');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const config = require('config');
const Chance = require('chance');
const Paste = require('../models/paste');
const chance = new Chance(4311613);
const clearDb = require('mocha-mongoose')(config.get('db.uri'));

mongoose.Promise = Promise;
chai.should();


describe('mongoose', function() {
  it('can connect properly', function(done) {
    mongoose.connect(config.get('db.uri'), config.get('db.options'), done);
  });

});

describe('models', function() {
  beforeEach(function(done) {
    // Make sure mongoose is connected
    if (mongoose.connection.db) return done();
    mongoose.connect(config.get('db.uri'), config.get('db.options'), done);
  });
  
  describe('pasteModel', function() {
    it('can add and retrieve a basic paste successfully', function(done) {
      const contents = generateContents();
      const paste = new Paste(contents);

      paste.save()
      .then(prod => {
        const id = prod._id;
        return Paste.findById(id).lean().exec();
      })
      .then(data => {
        comparePaste(data, contents);
        done();
      })
      .catch(err => {
        done(err);
      });
    });

    after(function(done) {
      clearDb(done);
    });

  });

  function generateContents() {
    return {
      title: chance.word(),
      tags: chance.n(chance.word, chance.integer({
        min: 0,
        max: 10
      })),
      content: chance.paragraph(),
      listed: chance.bool(),
      views: chance.integer({min: 0, max: 1000000000}),
      createdBy: chance.ip()
    };
  }

  function comparePaste(dbData, schema) {
    dbData.should.have.property('_id');
    dbData.should.have.property('__v');
    dbData.should.have.property('createdAt');
    dbData.should.have.property('updatedAt');

    dbData.content.should.equal(schema.content);
    dbData.title.should.equal(schema.title);
    dbData.views.should.equal(schema.views);
    dbData.listed.should.equal(schema.listed);
    dbData.createdBy.should.equal(schema.createdBy);
    dbData.tags.should.eql(schema.tags);
  }
  
});
