'use strict';

const chai = require('chai');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const config = require('config');
const Chance = require('chance');
const _ = require('lodash');
const chance = new Chance(4311613);
const clearDb = require('mocha-mongoose')(config.get('db.uri'));
const Paste = require('../models/paste');

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
    mongoose.connect(config.get('db.uri'), config.get('db.options'));
    done();
  });

  afterEach(function(done) {
    clearDb(done);
  });
  
  describe('Paste', function() {
    it('can add and retrieve a basic paste successfully', function(done) {
      const contents = generateContents();
      const paste = new Paste(contents);

      paste.save()
        .then(prod => Paste.findById(prod._id).lean().exec())
        .then(data => {
          comparePaste(data, contents);
          done();
        })
        .catch(done);
    });

    describe('#newPaste', function() {
      it('can create new pastes', function(done) {
        const contents = generateContents(['views']);
        const paste = Paste.newPaste(contents);

        paste.save()
          .then(prod => Paste.findById(prod._id).lean().exec())
          .then(data => {
            comparePaste(data, contents, ['views']);
            done()
          })
          .catch(done);
      });

      it('uses default values', function(done) {
        const paste = Paste.newPaste();

        paste.save()
          .then(prod => Paste.findById(prod._id).lean().exec())
          .then(data => {
            let expected = {
              title: 'Untitled',
              tags: [],
              content: "",
              listed: true,
              createdBy: 'Unknown',
              views: 0
            };
            comparePaste(data, expected);
            done()
          })
          .catch(done);
      });
    });

    describe('#getRecent', function (done) {
      it('retrieves recent promises', function() {
        let contents = [
          generateContents(), generateContents(),
          generateContents()
        ].map(item => {item.listed = true; return item;});

        Promise.each(contents, content => {
          return new Paste(content).save();
        }).then(() => Paste.getRecent())
          .then(recent => {
            console.log('recent:', recent);
            _.isEqualWith(recent, contents, comparePaste);
            done();
          })
          .catch(done);
      });
      
    });

    function generateContents(exclude) {
      exclude = exclude || [];
      return _.omit({
        title: chance.word(),
        tags: chance.n(chance.word, chance.integer({
          min: 0,
          max: 10
        })),
        content: chance.paragraph(),
        listed: chance.bool(),
        views: chance.integer({min: 0, max: 1000000000}),
        createdBy: chance.ip()
      }, exclude);
    }

    function comparePaste(dbData, schema, exclude) {
      exclude = exclude || [];
      const expected = ['_id', '__v', 'createdAt', 'updatedAt'];
      const shouldEqual = _.xor([
        'content', 'title', 'views', 'listed',
        'createdBy'
      ], exclude);

      _.each(expected, propName => {
        dbData.should.have.property(propName)
      });

      _.each(shouldEqual, propName => {
        dbData[propName].should.equal(schema[propName]);
      });
      dbData.tags.should.eql(schema.tags);
    }
  });
});

  
