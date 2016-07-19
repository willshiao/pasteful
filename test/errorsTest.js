'use strict';

const chai = require('chai');
const ArgumentError = require('../lib/errors').ArgumentError;
const NotFoundError = require('../lib/errors').NotFoundError;
chai.should();

describe('errors', function() {
  
  describe('ArgumentError', function() {
    it('is an instance of itself', function() {
      new ArgumentError().should.be.an.instanceOf(ArgumentError);
    });

    it('is an instance of Error', function() {
      new ArgumentError().should.be.an.instanceOf(Error);
    });

    it('retains a message', function() {
      (function() {
        throw new ArgumentError('error message!');
      }).should.throw('error message!');
    });

    it('is called ArgumentError', function() {
      new ArgumentError().name.should.equal('ArgumentError');
    });
  });

  describe('NotFoundError', function() {
    it('is an instance of itself', function() {
      new NotFoundError().should.be.an.instanceOf(NotFoundError);
    });

    it('is an instance of Error', function() {
      new NotFoundError().should.be.an.instanceOf(Error);
    });

    it('retains a message', function() {
      (function() {
        throw new NotFoundError('error message!');
      }).should.throw('error message!');
    });

    it('is called NotFoundError', function() {
      new NotFoundError().name.should.equal('NotFoundError');
    });
  });

});